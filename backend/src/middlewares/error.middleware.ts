import type { ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { AppError } from '../shared/errors/AppError';

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  let appError = error instanceof AppError ? error : undefined;

  if (error instanceof ZodError) {
    appError = new AppError(
      400,
      'La solicitud contiene datos inválidos',
      'VALIDATION_ERROR',
      error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })),
    );
  } else if (error instanceof multer.MulterError) {
    appError = new AppError(400, error.message, 'UPLOAD_ERROR');
  } else if (error instanceof SyntaxError && 'status' in error && error.status === 400) {
    appError = new AppError(400, 'El JSON de la solicitud no es válido', 'INVALID_JSON');
  } else if (error instanceof mongoose.Error.ValidationError) {
    appError = new AppError(
      400,
      'La solicitud contiene datos inválidos',
      'VALIDATION_ERROR',
      Object.values(error.errors).map((issue) => ({
        field: issue.path,
        message: issue.message,
      })),
    );
  } else if (error instanceof mongoose.Error.CastError) {
    appError = new AppError(400, 'Identificador o valor inválido', 'INVALID_VALUE');
  } else if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
    appError = new AppError(409, 'El recurso ya existe', 'CONFLICT');
  }

  if (!appError) {
    console.error(error);
    appError = new AppError(500, 'Ocurrió un error interno del servidor');
  }

  res.status(appError.statusCode).json({
    success: false,
    error: {
      code: appError.code,
      message: appError.message,
      details: appError.details,
      ...(env.NODE_ENV === 'development' && error instanceof Error ? { stack: error.stack } : {}),
    },
  });
};
