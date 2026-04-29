import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  if (err instanceof ZodError) {
    res.status(422).json({
      error: "Validation failed",
      details: (err as ZodError<any>).issues
    });
    return;
  }

  // Handle SQLite errors
  if (err.code && err.code.startsWith('SQLITE_')) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
       res.status(409).json({ error: "Conflict", details: "A resource with that unique key already exists." });
       return;
    }
  }

  const statusCode = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    error: message,
    details: process.env.NODE_ENV === 'development' ? err : undefined
  });
};
