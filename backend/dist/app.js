"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const env_1 = require("./config/env");
const error_middleware_1 = require("./middlewares/error.middleware");
const AppError_1 = require("./shared/errors/AppError");
const response_1 = require("./shared/utils/response");
const auth_routes_1 = require("./modules/auth/auth.routes");
const users_routes_1 = require("./modules/users/users.routes");
const products_routes_1 = require("./modules/products/products.routes");
const chats_routes_1 = require("./modules/chats/chats.routes");
const transactions_routes_1 = require("./modules/transactions/transactions.routes");
exports.app = (0, express_1.default)();
exports.app.disable('x-powered-by');
exports.app.use((0, helmet_1.default)());
exports.app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        const allowedOrigins = env_1.env.CORS_ORIGIN.split(',').map((item) => item.trim());
        if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new AppError_1.AppError(403, 'Origen no permitido por CORS', 'CORS_ORIGIN_DENIED'));
    },
    credentials: true,
}));
exports.app.use(express_1.default.json({ limit: '1mb' }));
exports.app.use(express_1.default.urlencoded({ extended: true, limit: '1mb' }));
exports.app.get('/health', (_req, res) => (0, response_1.sendSuccess)(res, 200, { status: 'ok' }));
exports.app.use('/api/v1/auth', auth_routes_1.authRoutes);
exports.app.use('/api/v1/users', users_routes_1.usersRoutes);
exports.app.use('/api/v1/products', products_routes_1.productsRoutes);
exports.app.use('/api/v1/chats', chats_routes_1.chatsRoutes);
exports.app.use('/api/v1/transactions', transactions_routes_1.transactionsRoutes);
exports.app.use((_req, _res, next) => {
    next(new AppError_1.AppError(404, 'Ruta no encontrada', 'NOT_FOUND'));
});
exports.app.use(error_middleware_1.errorMiddleware);
//# sourceMappingURL=app.js.map