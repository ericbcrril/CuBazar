import { Platform } from 'react-native';
import { fetch as expoFetch } from 'expo/fetch';
import type { ApiEnvelope, ApiErrorBody } from '@/types/api';
import { getAccessToken } from './session';

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const localApiUrl =
  Platform.OS === 'android' ? 'http://10.0.2.2:3000/api/v1' : 'http://192.168.100.88:3000/api/v1';
const API_REQUEST_TIMEOUT_MS = 10_000;

export const API_BASE_URL = (configuredApiUrl || localApiUrl).replace(/\/+$/, '');
export const SOCKET_BASE_URL = API_BASE_URL.replace(/\/api\/v1$/, '');

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  auth?: boolean;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, body, headers: extraHeaders, ...init } = options;
  if (!configuredApiUrl && !__DEV__) {
    throw new ApiError(0, 'API_CONFIGURATION_ERROR', 'Configura EXPO_PUBLIC_API_URL para producción.');
  }

  const headers = new Headers(extraHeaders);
  const token = auth ? await getAccessToken() : null;
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let payload: BodyInit | undefined;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
    payload = JSON.stringify(body);
  }

  const externalSignal = init.signal;
  const controller = new AbortController();
  let didTimeout = false;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      didTimeout = true;
      controller.abort();
      reject(new ApiError(0, 'REQUEST_TIMEOUT', 'El servidor tardó demasiado en responder. Inténtalo de nuevo.'));
    }, API_REQUEST_TIMEOUT_MS);
  });
  const abortFromCaller = () => controller.abort();

  if (externalSignal) {
    if (externalSignal.aborted) {
      abortFromCaller();
    } else {
      externalSignal.addEventListener('abort', abortFromCaller, { once: true });
    }
  }

  try {
    const fetchRequest = body instanceof FormData ? expoFetch : fetch;
    const requestPromise = (async (): Promise<T> => {
      const response = await fetchRequest(`${API_BASE_URL}${path}`, {
        ...init,
        headers,
        body: payload,
        signal: controller.signal,
      });

      if (response.status === 204) return undefined as T;

      let responseBody: unknown;
      try {
        responseBody = await response.json();
      } catch (reason) {
        if (didTimeout) throw reason;
        throw new ApiError(response.status, 'INVALID_RESPONSE', 'El servidor devolvió una respuesta inválida.');
      }

      if (!response.ok) {
        const errorBody = responseBody as Partial<ApiErrorBody>;
        throw new ApiError(
          response.status,
          errorBody.error?.code ?? 'HTTP_ERROR',
          errorBody.error?.message ?? 'No se pudo completar la solicitud.',
          errorBody.error?.details,
        );
      }

      const envelope = responseBody as Partial<ApiEnvelope<T>>;
      if (envelope.success !== true || !('data' in envelope)) {
        throw new ApiError(response.status, 'INVALID_RESPONSE', 'La respuesta del servidor no tiene el formato esperado.');
      }
      return envelope.data as T;
    })();

    return await Promise.race([requestPromise, timeoutPromise]);
  } catch (reason) {
    if (reason instanceof ApiError) throw reason;
    if (didTimeout) {
      throw new ApiError(0, 'REQUEST_TIMEOUT', 'El servidor tardó demasiado en responder. Inténtalo de nuevo.');
    }

    const detail = reason instanceof Error ? reason.message : 'Error de red desconocido';
    const message = 'No se pudo conectar con el servidor. Revisa la URL del API y tu conexión.';
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      __DEV__ ? `${message} (${API_BASE_URL}; ${detail})` : message,
    );
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
    externalSignal?.removeEventListener('abort', abortFromCaller);
  }
}
