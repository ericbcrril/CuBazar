import * as SecureStore from "expo-secure-store";
import { getActivity } from "./users";

const READ_AT_KEY = "cubazar_notifications_read_at";

export async function hasUnreadNotifications(): Promise<boolean> {
  const activity = await getActivity();
  const readAt = await SecureStore.getItemAsync(READ_AT_KEY);
  const readTime = readAt ? new Date(readAt).getTime() : 0;
  return [
    ...activity.likes.map((item) => item.createdAt),
    ...activity.conversations.map((item) => item.updatedAt),
  ].some((value) => Boolean(value) && new Date(value as string).getTime() > readTime);
}

export async function markNotificationsRead(): Promise<void> {
  await SecureStore.setItemAsync(READ_AT_KEY, new Date().toISOString());
}
