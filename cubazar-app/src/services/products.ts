import { Platform } from 'react-native';
import { File } from 'expo-file-system';
import type {
  ApiComment,
  ApiProduct,
  ApiProductStatus,
  ExploreResponse,
  ProductPage,
} from '@/types/api';
import { request } from './api';

export function getFeed(): Promise<ProductPage> {
  return request('/products/feed');
}

export function getExplore(): Promise<ExploreResponse> {
  return request('/products/explore');
}

export function getProduct(id: string): Promise<ApiProduct> {
  return request(`/products/${encodeURIComponent(id)}`);
}

export function toggleProductLike(id: string): Promise<{ liked: boolean; totalLikes: number }> {
  return request(`/products/${encodeURIComponent(id)}/like`, { method: 'POST' });
}

export function createProductComment(id: string, content: string): Promise<ApiComment> {
  return request(`/products/${encodeURIComponent(id)}/comments`, {
    method: 'POST',
    body: { content },
  });
}

export function getMyProducts(status?: ApiProductStatus): Promise<ProductPage> {
  const query = new URLSearchParams({ page: '1', limit: '100' });
  if (status) query.set('status', status);
  return request(`/products/me?${query.toString()}`);
}

export interface ProductInput {
  title: string;
  description: string;
  price: number;
  condition: ApiProduct['condition'];
  type: ApiProduct['type'];
  status?: Extract<ApiProductStatus, 'DRAFT' | 'PUBLISHED'>;
}

export interface ProductImageUpload {
  uri: string;
  mimeType?: string | null;
  fileName?: string | null;
}

function imageMimeType(image: ProductImageUpload): string {
  const declaredType = image.mimeType === 'image/jpg' ? 'image/jpeg' : image.mimeType;
  const extension = image.fileName?.split('.').pop()?.toLowerCase();
  const inferredType =
    extension === 'jpg' || extension === 'jpeg'
      ? 'image/jpeg'
      : extension === 'png'
        ? 'image/png'
        : extension === 'webp'
          ? 'image/webp'
          : undefined;
  const mimeType = declaredType || inferredType;
  if (!mimeType || !['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
    throw new Error('El servidor solo acepta imágenes JPEG, PNG o WebP.');
  }
  return mimeType;
}

export async function createProduct(
  input: ProductInput,
  images: ProductImageUpload[] = [],
): Promise<ApiProduct> {
  if (images.length === 0) {
    return request('/products', { method: 'POST', body: input });
  }

  const formData = new FormData();
  formData.append('title', input.title);
  formData.append('description', input.description);
  formData.append('price', String(input.price));
  formData.append('condition', input.condition);
  formData.append('type', input.type);
  if (input.status) formData.append('status', input.status);

  for (const [index, image] of images.entries()) {
    const mimeType = imageMimeType(image);
    const extension = mimeType === 'image/jpeg' ? 'jpg' : mimeType.split('/')[1];
    const fileName = image.fileName ?? `product-${index + 1}.${extension}`;

    if (Platform.OS === 'web') {
      const response = await fetch(image.uri);
      const blob = await response.blob();
      if (blob.size === 0) {
        const scheme = image.uri.split(':', 1)[0] || 'desconocido';
        throw new Error(
          `Imagen vacía (plataforma ${Platform.OS}, esquema ${scheme}, estado ${response.status}).`,
        );
      }
      formData.append('images[]', blob.slice(0, blob.size, mimeType), fileName);
    } else {
      formData.append('images[]', new File(image.uri), fileName);
    }
  }

  return request('/products', { method: 'POST', body: formData });
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>,
  images: ProductImageUpload[] = [],
): Promise<ApiProduct> {
  if (!images.length) {
    return request(`/products/${encodeURIComponent(id)}`, { method: 'PATCH', body: input });
  }
  const formData = new FormData();
  Object.entries(input).forEach(([key, value]) => {
    if (value !== undefined) formData.append(key, String(value));
  });
  for (const [index, image] of images.entries()) {
    const mimeType = imageMimeType(image);
    const extension = mimeType === 'image/jpeg' ? 'jpg' : mimeType.split('/')[1];
    const fileName = image.fileName ?? `product-${index + 1}.${extension}`;
    if (Platform.OS === 'web') {
      const response = await fetch(image.uri);
      const blob = await response.blob();
      formData.append('images[]', blob.slice(0, blob.size, mimeType), fileName);
    } else {
      formData.append('images[]', new File(image.uri), fileName);
    }
  }
  return request(`/products/${encodeURIComponent(id)}`, { method: 'PATCH', body: formData });
}

export function deleteProductImage(productId: string, imageId: string): Promise<{ id: string }> {
  return request(
    `/products/${encodeURIComponent(productId)}/images/${encodeURIComponent(imageId)}`,
    { method: 'DELETE' },
  );
}

export function deleteProduct(id: string): Promise<{ id: string }> {
  return request(`/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function setProductSold(id: string, isSold: boolean): Promise<ApiProduct> {
  return request(`/products/${encodeURIComponent(id)}/sold`, {
    method: 'POST',
    body: { isSold },
  });
}
