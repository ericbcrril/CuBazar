import type { Request, Response } from 'express';
import type { z } from 'zod';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/response';
import { googleAuthSchema, loginSchema, registerSchema } from './auth.schemas';
import * as authService from './auth.service';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as z.infer<typeof registerSchema>['body'];
  const data = await authService.register(body);
  return sendSuccess(res, 201, data, 'Cuenta creada correctamente');
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as z.infer<typeof loginSchema>['body'];
  return sendSuccess(res, 200, await authService.login(body));
});

export const googleSignIn = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as z.infer<typeof googleAuthSchema>['body'];
  return sendSuccess(res, 200, await authService.signInWithGoogle(body.idToken));
});
