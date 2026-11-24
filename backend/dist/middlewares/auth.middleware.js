"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireUser = exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = require("mongoose");
const models_1 = require("../models");
const env_1 = require("../config/env");
const AppError_1 = require("../shared/errors/AppError");
const requireAuth = (req, _res, next) => {
    const authorization = req.header('authorization');
    const [scheme, token, extra] = authorization?.split(' ') ?? [];
    if (scheme !== 'Bearer' || !token || extra) {
        next(new AppError_1.AppError(401, 'Se requiere un token Bearer válido', 'UNAUTHORIZED'));
        return;
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        if (typeof payload === 'string' ||
            typeof payload.id !== 'string' ||
            !mongoose_1.Types.ObjectId.isValid(payload.id) ||
            typeof payload.email !== 'string' ||
            (payload.role !== models_1.Role.STUDENT && payload.role !== models_1.Role.ADMIN)) {
            throw new AppError_1.AppError(401, 'El token no contiene un perfil válido', 'INVALID_TOKEN');
        }
        const user = payload;
        req.user = { id: user.id, email: user.email, role: user.role };
        next();
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            next(error);
            return;
        }
        next(new AppError_1.AppError(401, 'El token es inválido o ha expirado', 'INVALID_TOKEN'));
    }
};
exports.requireAuth = requireAuth;
const requireUser = (req) => {
    if (!req.user) {
        throw new AppError_1.AppError(401, 'Se requiere autenticación', 'UNAUTHORIZED');
    }
    return req.user;
};
exports.requireUser = requireUser;
//# sourceMappingURL=auth.middleware.js.map