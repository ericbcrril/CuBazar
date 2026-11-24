import type { ApiConversation, ApiMessage } from '@/types/api';
import { io, type Socket } from 'socket.io-client';
import { request, SOCKET_BASE_URL } from './api';
import { getAccessToken } from './session';

export function getChats(filter: 'ALL' | 'UNREAD' = 'ALL'): Promise<ApiConversation[]> {
  return request(`/chats?filter=${filter}`);
}

export function createChat(productId: string): Promise<ApiConversation> {
  return request('/chats', { method: 'POST', body: { productId } });
}

export function createDirectChat(userId: string): Promise<ApiConversation> {
  return request('/chats', { method: 'POST', body: { userId } });
}

export function deleteChat(conversationId: string): Promise<{ id: string }> {
  return request(`/chats/${encodeURIComponent(conversationId)}`, { method: 'DELETE' });
}

export function getMessages(conversationId: string): Promise<{
  messages: ApiMessage[];
  pagination: { page: number; limit: number; total: number; pages: number };
}> {
  return request(`/chats/${encodeURIComponent(conversationId)}/messages`);
}

export async function connectChatSocket(): Promise<Socket> {
  const token = await getAccessToken();
  if (!token) throw new Error('Inicia sesión para usar el chat.');
  return io(SOCKET_BASE_URL, {
    auth: { token },
    transports: ['websocket'],
    autoConnect: false,
  });
}

export interface NewMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface SocketFailure {
  message: string;
}

export interface TransactionUpdate {
  transactionId: string;
  status: 'PENDING_CONFIRMATION' | 'MUTUAL_CONFIRMED' | 'CANCELLED';
  buyerConfirmed: boolean | null;
  sellerConfirmed: boolean | null;
  canRate: boolean;
}

export interface PurchaseConfirmationState {
  messageCount: number;
  buyerConfirmed: boolean | null;
  sellerConfirmed: boolean | null;
  status: 'PENDING_CONFIRMATION' | 'MUTUAL_CONFIRMED' | 'CANCELLED';
}

