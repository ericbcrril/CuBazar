import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
  windowMs: 60_000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Se excedió el límite de intentos. Intenta nuevamente en un minuto.',
        details: [],
      },
    });
  },
});
