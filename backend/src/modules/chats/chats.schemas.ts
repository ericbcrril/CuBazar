import { z } from 'zod';
import { objectIdSchema } from '../../shared/utils/objectId';

const pageSchema = z.string().regex(/^[1-9]\d*$/).default('1');
const limitSchema = z
  .string()
  .regex(/^[1-9]\d*$/)
  .refine((value) => Number(value) <= 100, 'El límite máximo por página es 100')
  .default('30');

export const createChatSchema = z.object({
  body: z.union([
    z.object({ productId: objectIdSchema, userId: z.never().optional() }),
    z.object({ userId: objectIdSchema, productId: z.never().optional() }),
  ]),
});

export const chatListSchema = z.object({
  query: z.object({
    filter: z.enum(['ALL', 'UNREAD']).default('ALL'),
  }),
});

export const chatIdSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const chatMessagesSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  query: z.object({
    page: pageSchema,
    limit: limitSchema,
  }),
});

export const conversationSocketSchema = z.object({
  conversationId: objectIdSchema,
});

export const sendMessageSchema = z.object({
  conversationId: objectIdSchema,
  content: z.string().trim().min(1).max(4000),
});

export const typingSchema = z.object({
  conversationId: objectIdSchema,
  isTyping: z.boolean(),
});
