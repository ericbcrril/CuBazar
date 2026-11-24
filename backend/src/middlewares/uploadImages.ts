import multer from 'multer';
import { AppError } from '../shared/errors/AppError';

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },
  fileFilter: (_req, file, callback) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      callback(new AppError(400, 'Solo se permiten imágenes JPEG, PNG o WebP', 'INVALID_IMAGE'));
      return;
    }
    callback(null, true);
  },
});

export const productImagesUpload = imageUpload.array('images[]', 5);
export const avatarUpload = imageUpload.single('avatar');
