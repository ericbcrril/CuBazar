import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import { avatarUpload } from '../../middlewares/uploadImages';
import { validateRequest } from '../../middlewares/validateRequest';
import * as controller from './users.controller';
import { updateAvailabilitySchema, userIdSchema } from './users.schemas';

export const usersRoutes = Router();

usersRoutes.use(requireAuth);
usersRoutes.get('/me', controller.getMe);
usersRoutes.get('/me/activity', controller.getActivity);
usersRoutes.patch(
  '/me/availability',
  validateRequest(updateAvailabilitySchema),
  controller.setAvailability,
);
usersRoutes.patch('/me/avatar', avatarUpload, controller.updateAvatar);
usersRoutes.get('/:id', validateRequest(userIdSchema), controller.getById);
