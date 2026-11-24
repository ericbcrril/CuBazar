"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
const zod_1 = require("zod");
const AppError_1 = require("../shared/errors/AppError");
const envSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().int().positive().default(3000),
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    CORS_ORIGIN: zod_1.z.string().default('*'),
    MONGODB_URI: zod_1.z.string().url(),
    MONGODB_DATABASE: zod_1.z.string().min(1).default('cuBazar-db'),
    URI_NOT_SRV0: zod_1.z.string().optional(),
    URI_NOT_SRV1: zod_1.z.string().optional(),
    JWT_SECRET: zod_1.z.string().min(32),
    JWT_EXPIRES_IN: zod_1.z.literal('8h').default('8h'),
    GOOGLE_CLIENT_ID: zod_1.z.string().min(1),
    CLOUDINARY_CLOUD_NAME: zod_1.z.string().min(1),
    CLOUDINARY_API_KEY: zod_1.z.string().min(1),
    CLOUDINARY_API_SECRET: zod_1.z.string().min(1),
});
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
    const details = parsedEnv.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
    }));
    throw new AppError_1.AppError(500, 'La configuración del servidor no es válida', 'INVALID_ENV', details);
}
exports.env = parsedEnv.data;
//# sourceMappingURL=env.js.map