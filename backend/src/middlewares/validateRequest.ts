import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { AppError } from '../shared/errors/AppError';

export const validateRequest = (schema: ZodType): RequestHandler => (req, _res, next) => {
  const parsed = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (!parsed.success) {
    next(
      new AppError(
        400,
        'La solicitud contiene datos inválidos',
        'VALIDATION_ERROR',
        parsed.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      ),
    );
    return;
  }

  const data = parsed.data as Record<string, unknown>;
  req.validated = {
    body: data.body as Record<string, unknown> | undefined,
    params: data.params as Record<string, unknown> | undefined,
    query: data.query as Record<string, unknown> | undefined,
  };
  if (req.validated.body) req.body = req.validated.body;
  if (req.validated.params) req.params = req.validated.params as typeof req.params;
  next();
};
