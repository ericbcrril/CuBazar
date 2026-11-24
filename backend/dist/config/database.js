"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotSrvUri = createNotSrvUri;
exports.connectToDatabase = connectToDatabase;
exports.disconnectFromDatabase = disconnectFromDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
const AppError_1 = require("../shared/errors/AppError");
function errorCode(error) {
    if (error && typeof error === 'object' && 'code' in error) {
        return String(error.code);
    }
    if (error instanceof Error)
        return error.name;
    return 'UNKNOWN';
}
function createNotSrvUri() {
    if (!env_1.env.URI_NOT_SRV0 || !env_1.env.URI_NOT_SRV1) {
        throw new AppError_1.AppError(503, 'La conexión notSRV no está configurada', 'MONGODB_FALLBACK_NOT_CONFIGURED', [{ required: ['URI_NOT_SRV0', 'URI_NOT_SRV1'] }]);
    }
    const prefix = env_1.env.URI_NOT_SRV0.replace(/\/+$/, '');
    const suffix = env_1.env.URI_NOT_SRV1.startsWith('?')
        ? env_1.env.URI_NOT_SRV1
        : `?${env_1.env.URI_NOT_SRV1}`;
    return `${prefix}/${encodeURIComponent(env_1.env.MONGODB_DATABASE)}${suffix}`;
}
async function connectToDatabase() {
    try {
        await mongoose_1.default.connect(env_1.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10_000,
        });
        console.info('Conexión a MongoDB establecida usando la URI principal');
        return;
    }
    catch (primaryError) {
        console.warn('Falló la conexión principal a MongoDB; se intentará el modo notSRV');
        let fallbackUri;
        try {
            fallbackUri = createNotSrvUri();
        }
        catch (configurationError) {
            throw new AppError_1.AppError(503, 'Fallaron la conexión principal y la configuración notSRV de MongoDB', 'MONGODB_CONNECTION_FAILED', [
                { attempt: 'primary', code: errorCode(primaryError) },
                {
                    attempt: 'notSRV',
                    code: errorCode(configurationError),
                },
            ]);
        }
        try {
            await mongoose_1.default.connect(fallbackUri, {
                serverSelectionTimeoutMS: 10_000,
            });
            console.info('Conexión a MongoDB establecida usando el modo notSRV');
        }
        catch (fallbackError) {
            throw new AppError_1.AppError(503, 'No se pudo conectar a MongoDB con la URI principal ni con notSRV', 'MONGODB_CONNECTION_FAILED', [
                { attempt: 'primary', code: errorCode(primaryError) },
                { attempt: 'notSRV', code: errorCode(fallbackError) },
            ]);
        }
    }
}
async function disconnectFromDatabase() {
    await mongoose_1.default.disconnect();
}
//# sourceMappingURL=database.js.map