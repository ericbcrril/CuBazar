import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validateRequest';
import * as controller from './transactions.controller';
import { confirmTransactionSchema, createReviewSchema } from './transactions.schemas';

export const transactionsRoutes = Router();

transactionsRoutes.use(requireAuth);
transactionsRoutes.get('/me', controller.listMine);
transactionsRoutes.post('/confirm', validateRequest(confirmTransactionSchema), controller.confirm);
transactionsRoutes.post('/:id/review', validateRequest(createReviewSchema), controller.review);
