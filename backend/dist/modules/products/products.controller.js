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
exports.createComment = exports.toggleLike = exports.removeImage = exports.remove = exports.setSold = exports.update = exports.create = exports.getById = exports.myProducts = exports.explore = exports.feed = void 0;
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const response_1 = require("../../shared/utils/response");
const productsService = __importStar(require("./products.service"));
const pageLimit = (query, fallbackLimit) => ({
    page: Number(query.page ?? 1),
    limit: Math.min(Number(query.limit ?? fallbackLimit), 100),
});
exports.feed = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const query = req.validated?.query ?? req.query;
    const { page, limit } = pageLimit(query, 10);
    return (0, response_1.sendSuccess)(res, 200, await productsService.getFeed(page, limit));
});
exports.explore = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = (0, auth_middleware_1.requireUser)(req);
    return (0, response_1.sendSuccess)(res, 200, await productsService.getExplore(user.id));
});
exports.myProducts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = (0, auth_middleware_1.requireUser)(req);
    const query = req.validated?.query ?? req.query;
    const { page, limit } = pageLimit(query, 10);
    return (0, response_1.sendSuccess)(res, 200, await productsService.getMyProducts(user.id, query.status, page, limit));
});
exports.getById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = (0, auth_middleware_1.requireUser)(req);
    return (0, response_1.sendSuccess)(res, 200, await productsService.getProduct(req.params.id, user.id));
});
exports.create = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = (0, auth_middleware_1.requireUser)(req);
    const body = req.body;
    const files = Array.isArray(req.files) ? req.files : [];
    const product = await productsService.createProduct(user.id, body, files);
    return (0, response_1.sendSuccess)(res, 201, product, 'Publicación creada correctamente');
});
exports.update = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = (0, auth_middleware_1.requireUser)(req);
    const body = req.body;
    const files = Array.isArray(req.files) ? req.files : [];
    return (0, response_1.sendSuccess)(res, 200, await productsService.updateProduct(req.params.id, user.id, body, files));
});
exports.setSold = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = (0, auth_middleware_1.requireUser)(req);
    const body = req.body;
    return (0, response_1.sendSuccess)(res, 200, await productsService.setSold(req.params.id, user.id, body.isSold !== false));
});
exports.remove = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = (0, auth_middleware_1.requireUser)(req);
    await productsService.deleteProduct(req.params.id, user.id);
    return (0, response_1.sendSuccess)(res, 200, { id: req.params.id }, 'Publicación eliminada');
});
exports.removeImage = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = (0, auth_middleware_1.requireUser)(req);
    await productsService.deleteProductImage(req.params.id, req.params.imageId, user.id);
    return (0, response_1.sendSuccess)(res, 200, { id: req.params.imageId }, 'Imagen eliminada');
});
exports.toggleLike = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = (0, auth_middleware_1.requireUser)(req);
    return (0, response_1.sendSuccess)(res, 200, await productsService.toggleLike(req.params.id, user.id));
});
exports.createComment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = (0, auth_middleware_1.requireUser)(req);
    const body = req.body;
    return (0, response_1.sendSuccess)(res, 201, await productsService.createComment(req.params.id, user.id, body.content), 'Comentario agregado');
});
//# sourceMappingURL=products.controller.js.map