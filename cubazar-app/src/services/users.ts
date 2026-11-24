import type { ApiActivity, MyProfile, PublicProfile } from '@/types/api';
import { request } from './api';

export function getMyProfile(accessToken?: string, signal?: AbortSignal): Promise<MyProfile> {
  if (!accessToken) return request('/users/me', { signal });

  return request('/users/me', {
    auth: false,
    headers: { Authorization: `Bearer ${accessToken}` },
    signal,
  });
}

export function updateAvailability(
  isAvailable: boolean,
): Promise<{ userId: string; isAvailable: boolean; updatedAt: string }> {
  return request('/users/me/availability', {
    method: 'PATCH',
    body: { isAvailable },
  });
}

export function getActivity(): Promise<ApiActivity> {
  return request('/users/me/activity');
}

export function getPublicProfile(userId: string): Promise<PublicProfile> {
  return request(`/users/${encodeURIComponent(userId)}`);
}
