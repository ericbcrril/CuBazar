import type { ApiTransaction } from '@/types/api';
import { request } from './api';

export function getMyTransactions(): Promise<ApiTransaction[]> {
  return request('/transactions/me');
}

export function confirmTransaction(
  conversationId: string,
  confirmed: boolean | null,
): Promise<{
  transactionId: string;
  status: ApiTransaction['status'];
  buyerConfirmed: boolean | null;
  sellerConfirmed: boolean | null;
  canRate: boolean;
}> {
  return request('/transactions/confirm', {
    method: 'POST',
    body: { conversationId, confirmed },
  });
}

export function createReview(
  transactionId: string,
  rating: number,
  comment?: string,
  targetType: 'BUYER' | 'SELLER' | 'PRODUCT' = 'SELLER',
): Promise<{ rating: number; comment: string | null }> {
  return request(`/transactions/${encodeURIComponent(transactionId)}/review`, {
    method: 'POST',
    body: { rating, targetType, ...(comment ? { comment } : {}) },
  });
}
