import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';

const DB_PATH = process.env.DATABASE_PATH || './expenses.db';

// Ensure directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    amount INTEGER NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    date TEXT NOT NULL,
    created_at TEXT NOT NULL,
    idempotency_key TEXT UNIQUE,
    user_id TEXT REFERENCES users(id)
  );

  -- Add user_id column if it doesn't exist (for existing tables)
  -- SQLite doesn't have IF NOT EXISTS for ADD COLUMN, so we use a try/catch pattern in JS if needed
  -- But for this project, we'll assume the CREATE TABLE above handles fresh setups, 
  -- and we'll manually ensure the column exists.
  
  CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
  CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);
  CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
`);

// Migration: Add user_id column if it's missing (SQLite handles this gracefully if we wrap it)
try {
  db.exec('ALTER TABLE expenses ADD COLUMN user_id TEXT REFERENCES users(id)');
} catch (e) {
  // Column already exists or other error we can ignore for now
}

export default db;
