import { z as zod } from 'zod';
import { ProductStatus } from '../../models';
import { objectIdSchema } from '../../shared/utils/objectId';

const conditionSchema = zod.enum([
  'NUEVO',
  'USADO_COMO_NUEVO',
  'USADO_BUEN_ESTADO',
  'USADO_ACEPTABLE',
]);

const typeSchema = zod.enum(['VENTA', 'PUBLICACION']);
const createStatusSchema = zod.enum(['DRAFT', 'PUBLISHED']);
const pageSchema = zod.string().regex(/^[1-9]\d*$/).default('1');
const limitSchema = zod
  .string()
  .regex(/^[1-9]\d*$/)
  .refine((value) => Number(value) <= 100, 'El límite máximo por página es 100')
  .default('10');

const productFields = {
  title: zod.string().min(3).max(120),
  description: zod.string().min(10).max(2000),
  price: zod.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? Number.NaN : value),
    zod.coerce.number().nonnegative('El precio no puede ser negativo'),
  ),
  condition: conditionSchema,
  type: typeSchema.default('VENTA'),
};

export const createProductSchema = zod.object({
  body: zod.object({
    ...productFields,
    status: createStatusSchema.default('PUBLISHED'),
  }),
});

export const updateProductSchema = zod.object({
  params: zod.object({ id: objectIdSchema }),
  body: zod
    .object({
      title: productFields.title.optional(),
      description: productFields.description.optional(),
      price: productFields.price.optional(),
      condition: conditionSchema.optional(),
      type: typeSchema.optional(),
      status: zod.nativeEnum(ProductStatus).optional(),
    })
    .refine((body) => Object.keys(body).length > 0, 'Debe proporcionarse al menos un campo'),
});

export const productIdSchema = zod.object({
  params: zod.object({ id: objectIdSchema }),
});

export const productFeedSchema = zod.object({
  query: zod.object({
    page: pageSchema,
    limit: limitSchema,
  }),
});

export const myProductsSchema = zod.object({
  query: zod.object({
    status: zod.nativeEnum(ProductStatus).optional(),
    page: pageSchema,
    limit: limitSchema,
  }),
});

export const createCommentSchema = zod.object({
  params: zod.object({ id: objectIdSchema }),
  body: zod.object({
    content: zod.string().min(1).max(500),
  }),
});
