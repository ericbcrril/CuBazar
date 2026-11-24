import type { Role } from '../models';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
      };
      validated?: {
        body?: Record<string, unknown>;
        params?: Record<string, unknown>;
        query?: Record<string, unknown>;
      };
    }
  }
}

export {};
