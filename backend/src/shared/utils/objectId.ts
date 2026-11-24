import { Types } from 'mongoose';
import { z } from 'zod';
import { AppError } from '../errors/AppError';

export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Debe ser un ObjectId de MongoDB válido');

export function toObjectId(value: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(value)) {
    throw new AppError(400, 'Identificador de MongoDB inválido', 'INVALID_OBJECT_ID');
  }
  return new Types.ObjectId(value);
}
