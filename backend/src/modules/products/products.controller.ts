import type { Request, Response } from 'express';
import type { z } from 'zod';
import type { ProductStatus } from '../../models';
import { requireUser } from '../../middlewares/auth.middleware';
import { AppError } from '../../shared/errors/AppError';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/response';
import * as productsService from './products.service';
import {
  createCommentSchema,
  createProductSchema,
  myProductsSchema,
  productFeedSchema,
  productIdSchema,
  updateProductSchema,
} from './products.schemas';

const pageLimit = (query: Record<string, unknown>, fallbackLimit: number) => ({
  page: Number(query.page ?? 1),
  limit: Math.min(Number(query.limit ?? fallbackLimit), 100),
});

export const feed = asyncHandler(async (req: Request, res: Response) => {
  const query = req.validated?.query ?? (req.query as Record<string, unknown>);
  const { page, limit } = pageLimit(query, 10);
  return sendSuccess(res, 200, await productsService.getFeed(page, limit));
});

export const explore = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  return sendSuccess(res, 200, await productsService.getExplore(user.id));
});

export const myProducts = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const query = req.validated?.query ?? (req.query as Record<string, unknown>);
  const { page, limit } = pageLimit(query, 10);
  return sendSuccess(
    res,
    200,
    await productsService.getMyProducts(user.id, query.status as ProductStatus | undefined, page, limit),
  );
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  return sendSuccess(res, 200, await productsService.getProduct(req.params.id, user.id));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const body = req.body as z.infer<typeof createProductSchema>['body'];
  const files = Array.isArray(req.files) ? req.files : [];
  const product = await productsService.createProduct(user.id, body, files);
  return sendSuccess(res, 201, product, 'Publicación creada correctamente');
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const body = req.body as z.infer<typeof updateProductSchema>['body'];
  const files = Array.isArray(req.files) ? req.files : [];
  return sendSuccess(res, 200, await productsService.updateProduct(req.params.id, user.id, body, files));
});

export const setSold = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const body = req.body as { isSold?: boolean };
  return sendSuccess(
    res,
    200,
    await productsService.setSold(req.params.id, user.id, body.isSold !== false),
  );
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  await productsService.deleteProduct(req.params.id, user.id);
  return sendSuccess(res, 200, { id: req.params.id }, 'Publicación eliminada');
});

export const removeImage = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  await productsService.deleteProductImage(req.params.id, req.params.imageId, user.id);
  return sendSuccess(res, 200, { id: req.params.imageId }, 'Imagen eliminada');
});

export const toggleLike = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  return sendSuccess(res, 200, await productsService.toggleLike(req.params.id, user.id));
});

export const createComment = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const body = req.body as z.infer<typeof createCommentSchema>['body'];
  return sendSuccess(
    res,
    201,
    await productsService.createComment(req.params.id, user.id, body.content),
    'Comentario agregado',
  );
});
