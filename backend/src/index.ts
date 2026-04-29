import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import expensesRouter from './routes/expenses';
import authRouter from './routes/auth';
import { errorHandler } from './middleware/errorHandler';

import { initDb } from './db';

const app = express();
const PORT = process.env.PORT || 3000;

// ... middleware and routes remain the same ...
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.set('trust proxy', 1);

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRouter);
app.use('/expenses', expensesRouter);
app.use(errorHandler);

const start = async () => {
  try {
    await initDb();
    console.log('Database initialized');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
