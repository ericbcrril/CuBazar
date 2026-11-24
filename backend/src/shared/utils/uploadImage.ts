import type { UploadApiResponse } from 'cloudinary';
import { cloudinary } from '../../config/cloudinary';
import { AppError } from '../errors/AppError';

export function uploadImage(buffer: Buffer, folder: string): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) {
          reject(new AppError(502, 'No se pudo almacenar la imagen', 'IMAGE_UPLOAD_FAILED'));
          return;
        }
        if (!result) {
          reject(new AppError(502, 'El proveedor no devolvió la imagen', 'IMAGE_UPLOAD_FAILED'));
          return;
        }
        resolve(result);
      },
    );
    stream.end(buffer);
  });
}
