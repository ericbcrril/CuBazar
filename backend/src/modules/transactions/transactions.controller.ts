import type { Request, Response } from 'express';
import type { z } from 'zod';
import { requireUser } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/response';
import * as transactionsService from './transactions.service';
import { confirmTransactionSchema, createReviewSchema } from './transactions.schemas';

export const confirm = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const body = req.body as z.infer<typeof confirmTransactionSchema>['body'];
  return sendSuccess(
    res,
    200,
    await transactionsService.confirmTransaction(user.id, body.conversationId, body.confirmed),
  );
});

export const listMine = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  return sendSuccess(res, 200, await transactionsService.listMyTransactions(user.id));
});

export const review = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const body = req.body as z.infer<typeof createReviewSchema>['body'];
  return sendSuccess(
    res,
    201,
    await transactionsService.createReview(user.id, req.params.id, body),
    'Reseña creada correctamente',
  );
});
