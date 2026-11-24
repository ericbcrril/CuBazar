"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = uploadImage;
const cloudinary_1 = require("../../config/cloudinary");
const AppError_1 = require("../errors/AppError");
function uploadImage(buffer, folder) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.cloudinary.uploader.upload_stream({ folder, resource_type: 'image' }, (error, result) => {
            if (error) {
                reject(new AppError_1.AppError(502, 'No se pudo almacenar la imagen', 'IMAGE_UPLOAD_FAILED'));
                return;
            }
            if (!result) {
                reject(new AppError_1.AppError(502, 'El proveedor no devolvió la imagen', 'IMAGE_UPLOAD_FAILED'));
                return;
            }
            resolve(result);
        });
        stream.end(buffer);
    });
}
//# sourceMappingURL=uploadImage.js.map