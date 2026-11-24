import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { Role } from '../models';
import { env } from '../config/env';
import { AppError } from '../shared/errors/AppError';

interface AccessTokenPayload extends jwt.JwtPayload {
  id: string;
  email: string;
  role: Role;
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  const authorization = req.header('authorization');
  const [scheme, token, extra] = authorization?.split(' ') ?? [];

  if (scheme !== 'Bearer' || !token || extra) {
    next(new AppError(401, 'Se requiere un token Bearer válido', 'UNAUTHORIZED'));
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    if (
      typeof payload === 'string' ||
      typeof payload.id !== 'string' ||
      !Types.ObjectId.isValid(payload.id) ||
      typeof payload.email !== 'string' ||
      (payload.role !== Role.STUDENT && payload.role !== Role.ADMIN)
    ) {
      throw new AppError(401, 'El token no contiene un perfil válido', 'INVALID_TOKEN');
    }
    const user = payload as AccessTokenPayload;
    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    next(new AppError(401, 'El token es inválido o ha expirado', 'INVALID_TOKEN'));
  }
};

export const requireUser = (req: Express.Request): NonNullable<Express.Request['user']> => {
  if (!req.user) {
    throw new AppError(401, 'Se requiere autenticación', 'UNAUTHORIZED');
  }
  return req.user;
};
