import { z } from 'zod';

export const expenseSchema = z.object({
  amount: z.number().positive().max(10000000).refine((val) => {
    // max 2 decimal places
    const str = val.toString();
    const parts = str.split('.');
    if (parts.length > 1) {
      return parts[1].length <= 2;
    }
    return true;
  }, "Amount must have at most 2 decimal places"),
  category: z.enum(["Food", "Transport", "Shopping", "Health", "Other"]),
  description: z.string().min(1).max(255),
  date: z.string().refine((val) => {
    const d = new Date(val);
    if (isNaN(d.getTime())) return false; // Must be valid date
    
    // Check if it's purely a date string YYYY-MM-DD
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!isoDateRegex.test(val)) {
        // If it includes time, it will fail this regex but technically the date-fns 
        // might allow it on frontend. Let's strictly enforce YYYY-MM-DD or simple valid dates.
        // Actually, the requirement says "valid ISO date string, not in the future".
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // start of today
    
    const inputDate = new Date(val);
    // Remove time from input date to compare properly
    inputDate.setHours(0, 0, 0, 0);

    return inputDate <= today;
  }, "Date must be a valid date and not in the future"),
  idempotency_key: z.string().uuid("Invalid UUID format for idempotency_key")
});
