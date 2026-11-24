"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typingSchema = exports.sendMessageSchema = exports.conversationSocketSchema = exports.chatMessagesSchema = exports.chatIdSchema = exports.chatListSchema = exports.createChatSchema = void 0;
const zod_1 = require("zod");
const objectId_1 = require("../../shared/utils/objectId");
const pageSchema = zod_1.z.string().regex(/^[1-9]\d*$/).default('1');
const limitSchema = zod_1.z
    .string()
    .regex(/^[1-9]\d*$/)
    .refine((value) => Number(value) <= 100, 'El límite máximo por página es 100')
    .default('30');
exports.createChatSchema = zod_1.z.object({
    body: zod_1.z.union([
        zod_1.z.object({ productId: objectId_1.objectIdSchema, userId: zod_1.z.never().optional() }),
        zod_1.z.object({ userId: objectId_1.objectIdSchema, productId: zod_1.z.never().optional() }),
    ]),
});
exports.chatListSchema = zod_1.z.object({
    query: zod_1.z.object({
        filter: zod_1.z.enum(['ALL', 'UNREAD']).default('ALL'),
    }),
});
exports.chatIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: objectId_1.objectIdSchema,
    }),
});
exports.chatMessagesSchema = zod_1.z.object({
    params: zod_1.z.object({ id: objectId_1.objectIdSchema }),
    query: zod_1.z.object({
        page: pageSchema,
        limit: limitSchema,
    }),
});
exports.conversationSocketSchema = zod_1.z.object({
    conversationId: objectId_1.objectIdSchema,
});
exports.sendMessageSchema = zod_1.z.object({
    conversationId: objectId_1.objectIdSchema,
    content: zod_1.z.string().trim().min(1).max(4000),
});
exports.typingSchema = zod_1.z.object({
    conversationId: objectId_1.objectIdSchema,
    isTyping: zod_1.z.boolean(),
});
//# sourceMappingURL=chats.schemas.js.map