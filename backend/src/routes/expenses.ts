import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db';
import { expenseSchema } from '../validators/expense';
import { getExpensesLimiter, postExpenseLimiter } from '../middleware/rateLimiter';
import { Expense, PaginatedResponse } from '../types';
import redis from '../redis';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();

// Helper to invalidate cache
const invalidateCache = async (userId: string) => {
  if (!redis) return;
  try {
    let cursor = '0';
    do {
      const result = await redis.scan(cursor, 'MATCH', `expenses:${userId}:*`, 'COUNT', 100);
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

router.post('/', auth, postExpenseLimiter, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const validatedData = expenseSchema.parse(req.body);
    const { amount, category, description, date, idempotency_key } = validatedData;

    // Check for idempotency key
    const existingRes = await pool.query(
      'SELECT * FROM expenses WHERE idempotency_key = $1 AND user_id = $2', 
      [idempotency_key, userId]
    );
    const existingExpense = existingRes.rows[0] as Expense | undefined;

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

    await pool.query(`
      INSERT INTO expenses (id, amount, category, description, date, created_at, idempotency_key, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [id, paiseAmount, category, description, date, created_at, idempotency_key, userId]);

    const newExpenseRes = await pool.query('SELECT * FROM expenses WHERE id = $1', [id]);
    const newExpense = newExpenseRes.rows[0] as Expense;

    // Invalidate cache in background after successful insert
    invalidateCache(userId);

    res.status(201).json({
      ...newExpense,
      amount: Number((newExpense.amount / 100).toFixed(2))
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', auth, getExpensesLimiter, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { category, sort = 'date_desc', page = '1', limit = '20' } = req.query;

    const cacheKey = `expenses:${userId}:${category || 'all'}:${sort}:${page}:${limit}`;

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

    // Build user-filtered queries
    let baseQuery = 'SELECT * FROM expenses WHERE user_id = $1';
    let countQuery = 'SELECT COUNT(*) as total FROM expenses WHERE user_id = $1';
    let sumQuery = 'SELECT SUM(amount) as total_amount FROM expenses WHERE user_id = $1';
    const queryParams: any[] = [userId];

    if (category) {
      baseQuery += ` AND category = $${queryParams.length + 1}`;
      countQuery += ` AND category = $${queryParams.length + 1}`;
      sumQuery += ` AND category = $${queryParams.length + 1}`;
      queryParams.push(category);
    }

    if (sort === 'date_asc') {
      baseQuery += ' ORDER BY date ASC, created_at ASC';
    } else {
      baseQuery += ' ORDER BY date DESC, created_at DESC';
    }

    baseQuery += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    const dataParams = [...queryParams, limitNum, offset];

    const expensesRes = await pool.query(baseQuery, dataParams);
    const expenses = expensesRes.rows as Expense[];

    const totalRes = await pool.query(countQuery, queryParams);
    const total = parseInt(totalRes.rows[0].total, 10);
    
    const sumRes = await pool.query(sumQuery, queryParams);
    const totalAmountPaise = parseInt(sumRes.rows[0].total_amount || '0', 10);
    const totalAmountRupees = Number((totalAmountPaise / 100).toFixed(2));

    // Category Breakdown Query (User-specific)
    let breakdownQuery = 'SELECT category, SUM(amount) as total FROM expenses WHERE user_id = $1';
    const breakdownParams = [userId];
    if (category) {
      breakdownQuery += ' AND category = $2';
      breakdownParams.push(category as string);
    }
    breakdownQuery += ' GROUP BY category';
    const breakdownRes = await pool.query(breakdownQuery, breakdownParams);
    const categoryTotals = breakdownRes.rows.map(b => ({
      category: b.category,
      amount: Number((parseInt(b.total, 10) / 100).toFixed(2))
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
