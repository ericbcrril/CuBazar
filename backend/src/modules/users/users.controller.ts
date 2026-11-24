import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/response';
import { requireUser } from '../../middlewares/auth.middleware';
import * as usersService from './users.service';
import type { z } from 'zod';
import { updateAvailabilitySchema } from './users.schemas';
import { AppError } from '../../shared/errors/AppError';

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  return sendSuccess(res, 200, await usersService.getMyProfile(user.id));
});

export const getActivity = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  return sendSuccess(res, 200, await usersService.getActivity(user.id));
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  return sendSuccess(res, 200, await usersService.getPublicProfile(req.params.id));
});

export const setAvailability = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const body = req.body as z.infer<typeof updateAvailabilitySchema>['body'];
  const data = await usersService.updateAvailability(user.id, body.isAvailable);
  return sendSuccess(res, 200, data);
});

export const updateAvatar = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  if (!req.file) throw new AppError(400, 'Debes adjuntar una imagen en el campo avatar', 'IMAGE_REQUIRED');
  const data = await usersService.updateAvatar(user.id, req.file.buffer);
  return sendSuccess(res, 200, data, 'Foto de perfil actualizada');
});
