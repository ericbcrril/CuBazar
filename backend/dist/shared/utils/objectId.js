"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.objectIdSchema = void 0;
exports.toObjectId = toObjectId;
const mongoose_1 = require("mongoose");
const zod_1 = require("zod");
const AppError_1 = require("../errors/AppError");
exports.objectIdSchema = zod_1.z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Debe ser un ObjectId de MongoDB válido');
function toObjectId(value) {
    if (!mongoose_1.Types.ObjectId.isValid(value)) {
        throw new AppError_1.AppError(400, 'Identificador de MongoDB inválido', 'INVALID_OBJECT_ID');
    }
    return new mongoose_1.Types.ObjectId(value);
}
//# sourceMappingURL=objectId.js.map