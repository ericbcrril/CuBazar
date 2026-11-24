import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'cubazar.accessToken';
let webAccessToken: string | null = null;
const STORAGE_TIMEOUT_MS = 5_000;

function storageErrorType(reason: unknown): string {
  return reason instanceof Error ? reason.name : typeof reason;
}

function withStorageTimeout<T>(stage: string, operation: Promise<T>): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(
      () => {
        console.warn(`[STARTUP-DIAG][storage] ${stage} timed out`);
        reject(new Error('El almacenamiento seguro tardó demasiado.'));
      },
      STORAGE_TIMEOUT_MS,
    );
  });

  return Promise.race([operation, timeout])
    .then((result) => {
      console.info(`[STARTUP-DIAG][storage] ${stage} completed`);
      return result;
    })
    .catch((reason: unknown) => {
      console.warn(`[STARTUP-DIAG][storage] ${stage} failed; error=${storageErrorType(reason)}`);
      throw reason;
    })
    .finally(() => {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      console.info(`[STARTUP-DIAG][storage] ${stage} settled`);
    });
}

export function getAccessToken(): Promise<string | null> {
  console.info('[STARTUP-DIAG][storage] token read started');
  if (Platform.OS === 'web') {
    console.info('[STARTUP-DIAG][storage] token read completed from web memory');
    return Promise.resolve(webAccessToken);
  }
  return withStorageTimeout('token read', SecureStore.getItemAsync(TOKEN_KEY));
}

export async function setAccessToken(token: string): Promise<void> {
  console.info('[STARTUP-DIAG][storage] token write started');
  if (Platform.OS === 'web') {
    webAccessToken = token;
    console.info('[STARTUP-DIAG][storage] token write completed in web memory');
    return;
  }
  await withStorageTimeout('token write', SecureStore.setItemAsync(TOKEN_KEY, token));
}

export async function clearAccessToken(): Promise<void> {
  console.info('[STARTUP-DIAG][storage] token deletion started');
  if (Platform.OS === 'web') {
    webAccessToken = null;
    console.info('[STARTUP-DIAG][storage] token deletion completed in web memory');
    return;
  }
  await withStorageTimeout('token deletion', SecureStore.deleteItemAsync(TOKEN_KEY));
}
