import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import { productImagesUpload } from '../../middlewares/uploadImages';
import { validateRequest } from '../../middlewares/validateRequest';
import * as controller from './products.controller';
import {
  createCommentSchema,
  createProductSchema,
  myProductsSchema,
  productFeedSchema,
  productIdSchema,
  updateProductSchema,
} from './products.schemas';

export const productsRoutes = Router();

productsRoutes.use(requireAuth);
productsRoutes.get('/feed', validateRequest(productFeedSchema), controller.feed);
productsRoutes.get('/explore', controller.explore);
productsRoutes.get('/me', validateRequest(myProductsSchema), controller.myProducts);
productsRoutes.post('/', productImagesUpload, validateRequest(createProductSchema), controller.create);
productsRoutes.get('/:id', validateRequest(productIdSchema), controller.getById);
productsRoutes.patch('/:id', productImagesUpload, validateRequest(updateProductSchema), controller.update);
productsRoutes.post('/:id/sold', validateRequest(productIdSchema), controller.setSold);
productsRoutes.delete('/:id/images/:imageId', controller.removeImage);
productsRoutes.delete('/:id', validateRequest(productIdSchema), controller.remove);
productsRoutes.post('/:id/like', validateRequest(productIdSchema), controller.toggleLike);
productsRoutes.post('/:id/comments', validateRequest(createCommentSchema), controller.createComment);
