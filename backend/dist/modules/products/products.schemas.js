"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCommentSchema = exports.myProductsSchema = exports.productFeedSchema = exports.productIdSchema = exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
const models_1 = require("../../models");
const objectId_1 = require("../../shared/utils/objectId");
const conditionSchema = zod_1.z.enum([
    'NUEVO',
    'USADO_COMO_NUEVO',
    'USADO_BUEN_ESTADO',
    'USADO_ACEPTABLE',
]);
const typeSchema = zod_1.z.enum(['VENTA', 'PUBLICACION']);
const createStatusSchema = zod_1.z.enum(['DRAFT', 'PUBLISHED']);
const pageSchema = zod_1.z.string().regex(/^[1-9]\d*$/).default('1');
const limitSchema = zod_1.z
    .string()
    .regex(/^[1-9]\d*$/)
    .refine((value) => Number(value) <= 100, 'El límite máximo por página es 100')
    .default('10');
const productFields = {
    title: zod_1.z.string().min(3).max(120),
    description: zod_1.z.string().min(10).max(2000),
    price: zod_1.z.preprocess((value) => (typeof value === 'string' && value.trim() === '' ? Number.NaN : value), zod_1.z.coerce.number().nonnegative('El precio no puede ser negativo')),
    condition: conditionSchema,
    type: typeSchema.default('VENTA'),
};
exports.createProductSchema = zod_1.z.object({
    body: zod_1.z.object({
        ...productFields,
        status: createStatusSchema.default('PUBLISHED'),
    }),
});
exports.updateProductSchema = zod_1.z.object({
    params: zod_1.z.object({ id: objectId_1.objectIdSchema }),
    body: zod_1.z
        .object({
        title: productFields.title.optional(),
        description: productFields.description.optional(),
        price: productFields.price.optional(),
        condition: conditionSchema.optional(),
        type: typeSchema.optional(),
        status: zod_1.z.nativeEnum(models_1.ProductStatus).optional(),
    })
        .refine((body) => Object.keys(body).length > 0, 'Debe proporcionarse al menos un campo'),
});
exports.productIdSchema = zod_1.z.object({
    params: zod_1.z.object({ id: objectId_1.objectIdSchema }),
});
exports.productFeedSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: pageSchema,
        limit: limitSchema,
    }),
});
exports.myProductsSchema = zod_1.z.object({
    query: zod_1.z.object({
        status: zod_1.z.nativeEnum(models_1.ProductStatus).optional(),
        page: pageSchema,
        limit: limitSchema,
    }),
});
exports.createCommentSchema = zod_1.z.object({
    params: zod_1.z.object({ id: objectId_1.objectIdSchema }),
    body: zod_1.z.object({
        content: zod_1.z.string().min(1).max(500),
    }),
});
//# sourceMappingURL=products.schemas.js.map