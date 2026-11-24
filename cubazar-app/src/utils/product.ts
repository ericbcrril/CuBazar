import type { ApiProduct, ApiProductCondition } from '@/types/api';
import type { Product } from '@/types/navigation';
import { API_BASE_URL } from '@/services/api';

const placeholderImage = require('../assets/images/download.jpg');

export function toCardProduct(product: ApiProduct): Product {
  const seller = product.seller && typeof product.seller === 'object' ? product.seller.fullName : '';
  const imageUrl = normalizeImageUrl(product.images?.[0]?.imageUrl);
  return {
    id: product.id ?? product._id ?? '',
    title: product.title,
    price: product.price,
    seller,
    rating: 0,
    reviews: 0,
    description: product.description,
    image: imageUrl ? { uri: imageUrl } : placeholderImage,
  };
}

export function conditionLabel(condition: ApiProductCondition): string {
  const labels: Record<ApiProductCondition, string> = {
    NUEVO: 'Nuevo',
    USADO_COMO_NUEVO: 'Usado como nuevo',
    USADO_BUEN_ESTADO: 'Usado en buen estado',
    USADO_ACEPTABLE: 'Usado aceptable',
  };
  return labels[condition];
}

export function conditionValue(label: string): ApiProductCondition | undefined {
  const values: Record<string, ApiProductCondition> = {
    Nuevo: 'NUEVO',
    'Usado como nuevo': 'USADO_COMO_NUEVO',
    'Usado en buen estado': 'USADO_BUEN_ESTADO',
    'Usado aceptable': 'USADO_ACEPTABLE',
  };
  return values[label];
}

export function normalizeImageUrl(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed) || /^data:/i.test(trimmed) || /^blob:/i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  if (trimmed.startsWith('/')) {
    return `${API_BASE_URL.replace(/\/api\/v1$/, '')}${trimmed}`;
  }
  return `${API_BASE_URL.replace(/\/api\/v1$/, '')}/${trimmed.replace(/^\/+/, '')}`;
}
