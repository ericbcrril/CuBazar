import { Router } from 'express';
import { authRateLimiter } from '../../middlewares/rateLimiter';
import { validateRequest } from '../../middlewares/validateRequest';
import * as controller from './auth.controller';
import { googleAuthSchema, loginSchema, registerSchema } from './auth.schemas';

export const authRoutes = Router();

authRoutes.post('/register', authRateLimiter, validateRequest(registerSchema), controller.register);
authRoutes.post('/login', authRateLimiter, validateRequest(loginSchema), controller.login);
authRoutes.post('/google', authRateLimiter, validateRequest(googleAuthSchema), controller.googleSignIn);
