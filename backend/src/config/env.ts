import 'dotenv/config';
import { z } from 'zod';
import { AppError } from '../shared/errors/AppError';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  CORS_ORIGIN: z.string().default('*'),
  MONGODB_URI: z.string().url(),
  MONGODB_DATABASE: z.string().min(1).default('cuBazar-db'),
  URI_NOT_SRV0: z.string().optional(),
  URI_NOT_SRV1: z.string().optional(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.literal('8h').default('8h'),
  GOOGLE_CLIENT_ID: z.string().min(1),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const details = parsedEnv.error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
  throw new AppError(500, 'La configuración del servidor no es válida', 'INVALID_ENV', details);
}

export const env = parsedEnv.data;
