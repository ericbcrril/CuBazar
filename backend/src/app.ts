import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { errorMiddleware } from './middlewares/error.middleware';
import { AppError } from './shared/errors/AppError';
import { sendSuccess } from './shared/utils/response';
import { authRoutes } from './modules/auth/auth.routes';
import { usersRoutes } from './modules/users/users.routes';
import { productsRoutes } from './modules/products/products.routes';
import { chatsRoutes } from './modules/chats/chats.routes';
import { transactionsRoutes } from './modules/transactions/transactions.routes';

export const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = env.CORS_ORIGIN.split(',').map((item) => item.trim());
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new AppError(403, 'Origen no permitido por CORS', 'CORS_ORIGIN_DENIED'));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.get('/health', (_req, res) => sendSuccess(res, 200, { status: 'ok' }));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/products', productsRoutes);
app.use('/api/v1/chats', chatsRoutes);
app.use('/api/v1/transactions', transactionsRoutes);

app.use((_req, _res, next) => {
  next(new AppError(404, 'Ruta no encontrada', 'NOT_FOUND'));
});
app.use(errorMiddleware);
