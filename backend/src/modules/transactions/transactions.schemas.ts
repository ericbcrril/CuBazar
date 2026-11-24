import { z } from 'zod';
import { objectIdSchema } from '../../shared/utils/objectId';

export const confirmTransactionSchema = z.object({
  body: z.object({
    conversationId: objectIdSchema,
    confirmed: z.boolean().nullable(),
  }),
});

export const createReviewSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(500).optional(),
    targetType: z.enum(['BUYER', 'SELLER', 'PRODUCT']),
  }),
});
