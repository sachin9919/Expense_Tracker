import Database from 'better-sqlite3';

const DB_PATH = process.env.DATABASE_PATH || './expenses.db';
const db = new Database(DB_PATH);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    amount INTEGER NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    date TEXT NOT NULL,
    created_at TEXT NOT NULL,
    idempotency_key TEXT UNIQUE
  );

  CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
  CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);
  CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at DESC);
`);

export default db;
