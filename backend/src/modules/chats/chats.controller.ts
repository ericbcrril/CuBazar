import type { Request, Response } from 'express';
import type { z } from 'zod';
import { requireUser } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/response';
import * as chatsService from './chats.service';
import { chatIdSchema, chatListSchema, chatMessagesSchema, createChatSchema } from './chats.schemas';
import { AppError } from '../../shared/errors/AppError';

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const body = req.body as z.infer<typeof createChatSchema>['body'];
  if ('productId' in body) {
    const productId: unknown = (body as { productId?: unknown }).productId;
    if (typeof productId !== 'string' || productId.length === 0) {
      throw new AppError(400, 'Se requiere productId', 'PRODUCT_REQUIRED');
    }
    return sendSuccess(res, 201, await chatsService.createConversation(user.id, productId));
  }
  const directUserId: unknown = (body as { userId?: unknown }).userId;
  if (typeof directUserId !== 'string' || directUserId.length === 0) {
    throw new AppError(400, 'Se requiere userId', 'USER_REQUIRED');
  }
  return sendSuccess(res, 201, await chatsService.createDirectConversation(user.id, directUserId));
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const query = (req.validated?.query ?? req.query) as z.infer<typeof chatListSchema>['query'];
  return sendSuccess(res, 200, await chatsService.listConversations(user.id, query.filter));
});

export const messages = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const params = req.params as z.infer<typeof chatMessagesSchema>['params'];
  const query = (req.validated?.query ?? req.query) as z.infer<typeof chatMessagesSchema>['query'];
  const page = Number(query.page);
  const limit = Math.min(Number(query.limit), 100);
  return sendSuccess(res, 200, await chatsService.getMessages(params.id, user.id, page, limit));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const params = req.params as z.infer<typeof chatIdSchema>['params'];
  return sendSuccess(
    res,
    200,
    await chatsService.deleteConversation(params.id, user.id),
    'Conversación eliminada',
  );
});
