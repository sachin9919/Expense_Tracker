import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db';
import { signupSchema, loginSchema } from '../validators/user';
import { User } from '../types';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me';

router.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = signupSchema.parse(req.body);
    const { email, password } = validatedData;

    // Check if user exists
    const existingUserRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUserRes.rows.length > 0) {
      res.status(400).json({ error: 'Email already in use' });
      return;
    }

    const id = uuidv4();
    const password_hash = await bcrypt.hash(password, 12);
    const created_at = new Date().toISOString();

    await pool.query(
      'INSERT INTO users (id, email, password_hash, created_at) VALUES ($1, $2, $3, $4)',
      [id, email, password_hash, created_at]
    );

    const token = jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id, email }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userRes.rows[0] as User | undefined;

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      token,
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
