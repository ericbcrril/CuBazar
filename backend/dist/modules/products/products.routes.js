"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const uploadImages_1 = require("../../middlewares/uploadImages");
const validateRequest_1 = require("../../middlewares/validateRequest");
const controller = __importStar(require("./products.controller"));
const products_schemas_1 = require("./products.schemas");
exports.productsRoutes = (0, express_1.Router)();
exports.productsRoutes.use(auth_middleware_1.requireAuth);
exports.productsRoutes.get('/feed', (0, validateRequest_1.validateRequest)(products_schemas_1.productFeedSchema), controller.feed);
exports.productsRoutes.get('/explore', controller.explore);
exports.productsRoutes.get('/me', (0, validateRequest_1.validateRequest)(products_schemas_1.myProductsSchema), controller.myProducts);
exports.productsRoutes.post('/', uploadImages_1.productImagesUpload, (0, validateRequest_1.validateRequest)(products_schemas_1.createProductSchema), controller.create);
exports.productsRoutes.get('/:id', (0, validateRequest_1.validateRequest)(products_schemas_1.productIdSchema), controller.getById);
exports.productsRoutes.patch('/:id', uploadImages_1.productImagesUpload, (0, validateRequest_1.validateRequest)(products_schemas_1.updateProductSchema), controller.update);
exports.productsRoutes.post('/:id/sold', (0, validateRequest_1.validateRequest)(products_schemas_1.productIdSchema), controller.setSold);
exports.productsRoutes.delete('/:id/images/:imageId', controller.removeImage);
exports.productsRoutes.delete('/:id', (0, validateRequest_1.validateRequest)(products_schemas_1.productIdSchema), controller.remove);
exports.productsRoutes.post('/:id/like', (0, validateRequest_1.validateRequest)(products_schemas_1.productIdSchema), controller.toggleLike);
exports.productsRoutes.post('/:id/comments', (0, validateRequest_1.validateRequest)(products_schemas_1.createCommentSchema), controller.createComment);
//# sourceMappingURL=products.routes.js.map