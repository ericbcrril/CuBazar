import mongoose from 'mongoose';
import { env } from './env';
import { AppError } from '../shared/errors/AppError';

function errorCode(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    return String(error.code);
  }
  if (error instanceof Error) return error.name;
  return 'UNKNOWN';
}

export function createNotSrvUri(): string {
  if (!env.URI_NOT_SRV0 || !env.URI_NOT_SRV1) {
    throw new AppError(
      503,
      'La conexión notSRV no está configurada',
      'MONGODB_FALLBACK_NOT_CONFIGURED',
      [{ required: ['URI_NOT_SRV0', 'URI_NOT_SRV1'] }],
    );
  }
  const prefix = env.URI_NOT_SRV0.replace(/\/+$/, '');
  const suffix = env.URI_NOT_SRV1.startsWith('?')
    ? env.URI_NOT_SRV1
    : `?${env.URI_NOT_SRV1}`;
  return `${prefix}/${encodeURIComponent(env.MONGODB_DATABASE)}${suffix}`;
}

export async function connectToDatabase(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10_000,
    });
    console.info('Conexión a MongoDB establecida usando la URI principal');
    return;
  } catch (primaryError) {
    console.warn('Falló la conexión principal a MongoDB; se intentará el modo notSRV');
    let fallbackUri: string;
    try {
      fallbackUri = createNotSrvUri();
    } catch (configurationError) {
      throw new AppError(
        503,
        'Fallaron la conexión principal y la configuración notSRV de MongoDB',
        'MONGODB_CONNECTION_FAILED',
        [
          { attempt: 'primary', code: errorCode(primaryError) },
          {
            attempt: 'notSRV',
            code: errorCode(configurationError),
          },
        ],
      );
    }

    try {
      await mongoose.connect(fallbackUri, {
        serverSelectionTimeoutMS: 10_000,
      });
      console.info('Conexión a MongoDB establecida usando el modo notSRV');
    } catch (fallbackError) {
      throw new AppError(
        503,
        'No se pudo conectar a MongoDB con la URI principal ni con notSRV',
        'MONGODB_CONNECTION_FAILED',
        [
          { attempt: 'primary', code: errorCode(primaryError) },
          { attempt: 'notSRV', code: errorCode(fallbackError) },
        ],
      );
    }
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  await mongoose.disconnect();
}
