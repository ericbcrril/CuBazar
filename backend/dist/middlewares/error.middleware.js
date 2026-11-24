"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const multer_1 = __importDefault(require("multer"));
const zod_1 = require("zod");
const env_1 = require("../config/env");
const AppError_1 = require("../shared/errors/AppError");
const errorMiddleware = (error, _req, res, _next) => {
    let appError = error instanceof AppError_1.AppError ? error : undefined;
    if (error instanceof zod_1.ZodError) {
        appError = new AppError_1.AppError(400, 'La solicitud contiene datos inválidos', 'VALIDATION_ERROR', error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })));
    }
    else if (error instanceof multer_1.default.MulterError) {
        appError = new AppError_1.AppError(400, error.message, 'UPLOAD_ERROR');
    }
    else if (error instanceof SyntaxError && 'status' in error && error.status === 400) {
        appError = new AppError_1.AppError(400, 'El JSON de la solicitud no es válido', 'INVALID_JSON');
    }
    else if (error instanceof mongoose_1.default.Error.ValidationError) {
        appError = new AppError_1.AppError(400, 'La solicitud contiene datos inválidos', 'VALIDATION_ERROR', Object.values(error.errors).map((issue) => ({
            field: issue.path,
            message: issue.message,
        })));
    }
    else if (error instanceof mongoose_1.default.Error.CastError) {
        appError = new AppError_1.AppError(400, 'Identificador o valor inválido', 'INVALID_VALUE');
    }
    else if (error instanceof mongoose_1.default.mongo.MongoServerError && error.code === 11000) {
        appError = new AppError_1.AppError(409, 'El recurso ya existe', 'CONFLICT');
    }
    if (!appError) {
        console.error(error);
        appError = new AppError_1.AppError(500, 'Ocurrió un error interno del servidor');
    }
    res.status(appError.statusCode).json({
        success: false,
        error: {
            code: appError.code,
            message: appError.message,
            details: appError.details,
            ...(env_1.env.NODE_ENV === 'development' && error instanceof Error ? { stack: error.stack } : {}),
        },
    });
};
exports.errorMiddleware = errorMiddleware;
//# sourceMappingURL=error.middleware.js.map