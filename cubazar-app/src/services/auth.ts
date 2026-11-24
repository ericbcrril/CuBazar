import type { AuthResponse, ApiUser } from '@/types/api';
import { request } from './api';

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  fullName: string;
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', { method: 'POST', body: input, auth: false });
}

export async function register(input: RegisterInput): Promise<{ userId: string; email: string }> {
  return request('/auth/register', { method: 'POST', body: input, auth: false });
}

export function signInWithGoogle(idToken: string): Promise<AuthResponse> {
  return request('/auth/google', { method: 'POST', body: { idToken }, auth: false });
}

export type { ApiUser };
