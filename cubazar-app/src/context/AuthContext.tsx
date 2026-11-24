import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ApiError } from '@/services/api';
import { login, register, type LoginInput, type RegisterInput } from '@/services/auth';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/services/session';
import { getMyProfile } from '@/services/users';
import type { ApiUser } from '@/types/api';

const AUTH_INITIALIZATION_TIMEOUT_MS = 15_000;
const INITIALIZATION_TIMEOUT = Symbol('initialization-timeout');
let nextAuthProviderInstanceId = 0;

function startupErrorType(reason: unknown): string {
  if (reason instanceof ApiError) return `${reason.name} code=${reason.code} status=${reason.status}`;
  if (reason instanceof Error) return reason.name;
  return typeof reason;
}

interface AuthContextValue {
  user: ApiUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  signIn: (input: LoginInput) => Promise<void>;
  signUp: (input: RegisterInput) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const providerInstanceIdRef = useRef<number | null>(null);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (providerInstanceIdRef.current === null) {
      providerInstanceIdRef.current = ++nextAuthProviderInstanceId;
    }
    const providerId = providerInstanceIdRef.current;
    console.info(`[STARTUP-DIAG][auth-provider] mounted id=${providerId}`);
    return () => {
      console.info(`[STARTUP-DIAG][auth-provider] unmounted id=${providerId}`);
    };
  }, []);

  useEffect(() => {
    console.info(`[STARTUP-DIAG][auth-state] id=${providerInstanceIdRef.current} isLoading=${isLoading}`);
  }, [isLoading]);

  useEffect(() => {
    let active = true;
    let initializationTimedOut = false;
    let startupStage = 'secure storage';
    const initializationController = new AbortController();
    let startupTimeout: ReturnType<typeof setTimeout> | undefined;
    console.info(`[STARTUP-DIAG][auth] initialization effect started id=${providerInstanceIdRef.current}`);
    const timeoutPromise = new Promise<typeof INITIALIZATION_TIMEOUT>((resolve) => {
      startupTimeout = setTimeout(() => {
        initializationTimedOut = true;
        initializationController.abort();
        console.warn(`[STARTUP-DIAG][auth] watchdog fired at stage=${startupStage}`);
        resolve(INITIALIZATION_TIMEOUT);
      }, AUTH_INITIALIZATION_TIMEOUT_MS);
    });

    const restoreSession = async () => {
      try {
        console.info('[STARTUP-DIAG][auth] awaiting secure-storage token read');
        const savedToken = await getAccessToken();
        console.info(`[STARTUP-DIAG][auth] secure-storage read completed; tokenPresent=${Boolean(savedToken)}`);
        if (!active || initializationTimedOut) return;
        if (!savedToken) {
          console.info('[STARTUP-DIAG][auth] no saved session; profile request skipped');
          return;
        }
        startupStage = 'profile request';
        console.info('[STARTUP-DIAG][auth] awaiting GET /users/me');
        const profile = await getMyProfile(savedToken, initializationController.signal);
        console.info('[STARTUP-DIAG][auth] GET /users/me completed');
        if (active && !initializationTimedOut) {
          setToken(savedToken);
          setUser(profile);
        }
      } catch (reason) {
        if (!active || initializationTimedOut) return;

        const restoreError = reason instanceof Error ? reason.message : 'No se pudo restaurar la sesión.';
        console.warn(
          `[STARTUP-DIAG][auth] restore failed at stage=${startupStage}; error=${startupErrorType(reason)}`,
        );
        setToken(null);
        setUser(null);
        setError(restoreError);
        console.info('[STARTUP-DIAG][auth] starting session-token cleanup');
        void clearAccessToken().catch((storageError) => {
          console.warn(`[STARTUP-DIAG][auth] session-token cleanup failed; error=${startupErrorType(storageError)}`);
          if (active) {
            const cleanupError =
              storageError instanceof Error ? storageError.message : 'No se pudo borrar el token de sesión.';
            setError(`${restoreError} ${cleanupError}`);
          }
        }).then(() => {
          console.info('[STARTUP-DIAG][auth] session-token cleanup settled');
        });
      }
    };

    const initialize = async () => {
      try {
        console.info('[STARTUP-DIAG][auth] awaiting restore-session/watchdog race');
        const result = await Promise.race([restoreSession(), timeoutPromise]);
        console.info(
          `[STARTUP-DIAG][auth] initialization race settled; outcome=${
            result === INITIALIZATION_TIMEOUT ? 'watchdog' : 'restore-session'
          }`,
        );
        if (result === INITIALIZATION_TIMEOUT && active) {
          const timeoutError = 'La inicialización de sesión tardó demasiado; inicia sesión de nuevo.';
          console.warn(`[STARTUP-DIAG][auth] applying timeout fallback at stage=${startupStage}`);
          setToken(null);
          setUser(null);
          setError(timeoutError);
          console.info('[STARTUP-DIAG][auth] starting timeout session-token cleanup');
          void clearAccessToken().catch((storageError) => {
            console.warn(
              `[STARTUP-DIAG][auth] timeout cleanup failed; error=${startupErrorType(storageError)}`,
            );
            if (!active) return;
            const cleanupError =
              storageError instanceof Error ? storageError.message : 'No se pudo borrar el token de sesión.';
            setError(`${timeoutError} ${cleanupError}`);
          }).then(() => {
            console.info('[STARTUP-DIAG][auth] timeout session-token cleanup settled');
          });
        }
      } catch (reason) {
        if (!active) return;
        const initializationError =
          reason instanceof Error ? reason.message : 'No se pudo inicializar la sesión.';
        console.warn(`[STARTUP-DIAG][auth] initialization failed; error=${startupErrorType(reason)}`);
        setToken(null);
        setUser(null);
        setError(initializationError);
        console.info('[STARTUP-DIAG][auth] starting error session-token cleanup');
        void clearAccessToken().catch((storageError) => {
          console.warn(
            `[STARTUP-DIAG][auth] error cleanup failed; error=${startupErrorType(storageError)}`,
          );
          if (!active) return;
          const cleanupError =
            storageError instanceof Error ? storageError.message : 'No se pudo borrar el token de sesión.';
          setError(`${initializationError} ${cleanupError}`);
        }).then(() => {
          console.info('[STARTUP-DIAG][auth] error session-token cleanup settled');
        });
      } finally {
        console.info('[STARTUP-DIAG][auth] finally entered');
        if (startupTimeout !== undefined) clearTimeout(startupTimeout);
        if (active) {
          console.info('[STARTUP-DIAG][auth] requesting isLoading=false');
          setIsLoading(false);
        } else {
          console.info('[STARTUP-DIAG][auth] provider inactive; state update skipped');
        }
      }
    };

    console.info('[STARTUP-DIAG][auth] initialize invoked');
    void initialize();
    return () => {
      console.info(`[STARTUP-DIAG][auth] initialization effect cleanup id=${providerInstanceIdRef.current}`);
      active = false;
      if (startupTimeout !== undefined) clearTimeout(startupTimeout);
      initializationController.abort();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      error,
      clearError: () => setError(null),
      signIn: async (input) => {
        setError(null);
        const session = await login(input);
        await setAccessToken(session.accessToken);
        setToken(session.accessToken);
        setUser(session.user);
      },
      signUp: async (input) => {
        setError(null);
        await register(input);
        const session = await login({ email: input.email, password: input.password });
        await setAccessToken(session.accessToken);
        setToken(session.accessToken);
        setUser(session.user);
      },
      signOut: async () => {
        await clearAccessToken();
        setToken(null);
        setUser(null);
        setError(null);
      },
    }),
    [user, token, isLoading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider.');
  return context;
}
