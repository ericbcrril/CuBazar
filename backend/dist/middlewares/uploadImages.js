"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.avatarUpload = exports.productImagesUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const AppError_1 = require("../shared/errors/AppError");
const imageUpload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 5,
    },
    fileFilter: (_req, file, callback) => {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
            callback(new AppError_1.AppError(400, 'Solo se permiten imágenes JPEG, PNG o WebP', 'INVALID_IMAGE'));
            return;
        }
        callback(null, true);
    },
});
exports.productImagesUpload = imageUpload.array('images[]', 5);
exports.avatarUpload = imageUpload.single('avatar');
//# sourceMappingURL=uploadImages.js.map