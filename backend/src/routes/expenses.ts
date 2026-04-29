import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import { expenseSchema } from '../validators/expense';
import { getExpensesLimiter, postExpenseLimiter } from '../middleware/rateLimiter';
import { Expense, PaginatedResponse } from '../types';
import redis from '../redis';

const router = Router();

// Helper to invalidate cache
const invalidateCache = async () => {
  if (!redis) return;
  try {
    let cursor = '0';
    do {
      const result = await redis.scan(cursor, 'MATCH', 'expenses:*', 'COUNT', 100);
      cursor = result[0];
      const keys = result[1];
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== '0');
  } catch (error) {
    console.error('Failed to invalidate Redis cache:', error);
  }
};

router.post('/', postExpenseLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = expenseSchema.parse(req.body);
    const { amount, category, description, date, idempotency_key } = validatedData;

    // Check for idempotency key
    const existingStmt = db.prepare('SELECT * FROM expenses WHERE idempotency_key = ?');
    const existingExpense = existingStmt.get(idempotency_key) as Expense | undefined;

    if (existingExpense) {
      res.status(200).json({
        ...existingExpense,
        amount: Number((existingExpense.amount / 100).toFixed(2))
      });
      return;
    }

    const id = uuidv4();
    const paiseAmount = Math.round(amount * 100);
    const created_at = new Date().toISOString();

    const insertStmt = db.prepare(`
      INSERT INTO expenses (id, amount, category, description, date, created_at, idempotency_key)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(id, paiseAmount, category, description, date, created_at, idempotency_key);

    const newExpenseStmt = db.prepare('SELECT * FROM expenses WHERE id = ?');
    const newExpense = newExpenseStmt.get(id) as Expense;

    // Invalidate cache in background after successful insert
    invalidateCache();

    res.status(201).json({
      ...newExpense,
      amount: Number((newExpense.amount / 100).toFixed(2))
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', getExpensesLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, sort = 'date_desc', page = '1', limit = '20' } = req.query;

    const cacheKey = `expenses:${category || 'all'}:${sort}:${page}:${limit}`;

    // Try cache first
    if (redis) {
      try {
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
          res.setHeader('X-Cache', 'HIT');
          res.status(200).json(JSON.parse(cachedData));
          return;
        }
      } catch (cacheErr) {
        console.error('Redis GET error:', cacheErr);
        // Fall through to DB on cache error
      }
    }

    res.setHeader('X-Cache', 'MISS');

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);
    const offset = (pageNum - 1) * limitNum;

    let baseQuery = 'SELECT * FROM expenses';
    let countQuery = 'SELECT COUNT(*) as total FROM expenses';
    let sumQuery = 'SELECT SUM(amount) as totalAmount FROM expenses';
    const params: any[] = [];

    if (category) {
      baseQuery += ' WHERE category = ?';
      countQuery += ' WHERE category = ?';
      sumQuery += ' WHERE category = ?';
      params.push(category);
    }

    if (sort === 'date_asc') {
      baseQuery += ' ORDER BY date ASC, created_at ASC';
    } else {
      baseQuery += ' ORDER BY date DESC, created_at DESC';
    }

    baseQuery += ' LIMIT ? OFFSET ?';
    const dataParams = [...params, limitNum, offset];

    const expenses = db.prepare(baseQuery).all(...dataParams) as Expense[];
    const totalRow = db.prepare(countQuery).get(...params) as { total: number };
    const total = totalRow.total;
    
    const sumRow = db.prepare(sumQuery).get(...params) as { totalAmount: number | null };
    const totalAmountPaise = sumRow.totalAmount || 0;
    const totalAmountRupees = Number((totalAmountPaise / 100).toFixed(2));

    // Category Breakdown Query
    let breakdownQuery = 'SELECT category, SUM(amount) as total FROM expenses';
    if (category) {
      breakdownQuery += ' WHERE category = ?';
    }
    breakdownQuery += ' GROUP BY category';
    const breakdown = db.prepare(breakdownQuery).all(...params) as { category: string, total: number }[];
    const categoryTotals = breakdown.map(b => ({
      category: b.category,
      amount: Number((b.total / 100).toFixed(2))
    }));

    const totalPages = Math.ceil(total / limitNum);

    const formattedExpenses = expenses.map(exp => ({
      ...exp,
      amount: Number((exp.amount / 100).toFixed(2))
    }));

    const responseData: PaginatedResponse<any> = {
      data: formattedExpenses,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages
      },
      meta: {
        totalAmount: totalAmountRupees,
        categoryTotals
      }
    };

    // Store in cache
    if (redis) {
      try {
        await redis.set(cacheKey, JSON.stringify(responseData), 'EX', 30);
      } catch (cacheErr) {
        console.error('Redis SET error:', cacheErr);
      }
    }

    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
});

export default router;
