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
exports.remove = exports.messages = exports.list = exports.create = void 0;
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const response_1 = require("../../shared/utils/response");
const chatsService = __importStar(require("./chats.service"));
const AppError_1 = require("../../shared/errors/AppError");
exports.create = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = (0, auth_middleware_1.requireUser)(req);
    const body = req.body;
    if ('productId' in body) {
        const productId = body.productId;
        if (typeof productId !== 'string' || productId.length === 0) {
            throw new AppError_1.AppError(400, 'Se requiere productId', 'PRODUCT_REQUIRED');
        }
        return (0, response_1.sendSuccess)(res, 201, await chatsService.createConversation(user.id, productId));
    }
    const directUserId = body.userId;
    if (typeof directUserId !== 'string' || directUserId.length === 0) {
        throw new AppError_1.AppError(400, 'Se requiere userId', 'USER_REQUIRED');
    }
    return (0, response_1.sendSuccess)(res, 201, await chatsService.createDirectConversation(user.id, directUserId));
});
exports.list = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = (0, auth_middleware_1.requireUser)(req);
    const query = (req.validated?.query ?? req.query);
    return (0, response_1.sendSuccess)(res, 200, await chatsService.listConversations(user.id, query.filter));
});
exports.messages = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = (0, auth_middleware_1.requireUser)(req);
    const params = req.params;
    const query = (req.validated?.query ?? req.query);
    const page = Number(query.page);
    const limit = Math.min(Number(query.limit), 100);
    return (0, response_1.sendSuccess)(res, 200, await chatsService.getMessages(params.id, user.id, page, limit));
});
exports.remove = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = (0, auth_middleware_1.requireUser)(req);
    const params = req.params;
    return (0, response_1.sendSuccess)(res, 200, await chatsService.deleteConversation(params.id, user.id), 'Conversación eliminada');
});
//# sourceMappingURL=chats.controller.js.map