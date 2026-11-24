"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReviewSchema = exports.confirmTransactionSchema = void 0;
const zod_1 = require("zod");
const objectId_1 = require("../../shared/utils/objectId");
exports.confirmTransactionSchema = zod_1.z.object({
    body: zod_1.z.object({
        conversationId: objectId_1.objectIdSchema,
        confirmed: zod_1.z.boolean().nullable(),
    }),
});
exports.createReviewSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: objectId_1.objectIdSchema,
    }),
    body: zod_1.z.object({
        rating: zod_1.z.number().int().min(1).max(5),
        comment: zod_1.z.string().max(500).optional(),
        targetType: zod_1.z.enum(['BUYER', 'SELLER', 'PRODUCT']),
    }),
});
//# sourceMappingURL=transactions.schemas.js.map