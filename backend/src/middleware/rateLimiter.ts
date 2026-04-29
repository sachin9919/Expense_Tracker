import rateLimit from 'express-rate-limit';

export const postExpenseLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 POST requests per `window` (here, per minute)
  message: { error: "Too many requests" },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export const getExpensesLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 GET requests per `window`
  message: { error: "Too many requests" },
  standardHeaders: true,
  legacyHeaders: false,
});
