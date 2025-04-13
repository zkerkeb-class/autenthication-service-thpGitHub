/* eslint-disable @typescript-eslint/no-namespace */
import { Request } from 'express';

/**
 * Étendre l'interface Request d'Express pour rendre les tests plus faciles
 */
declare global {
  namespace Express {
    interface Request {
      isAuthenticated(): boolean;
      logout(callback: (err: Error | null) => void): void;
    }
  }
}

/**
 * Créer un mock de Request plus facile à utiliser dans les tests
 */
export function createMockRequest(overrides: Partial<Request> = {}): Request {
  const req: Partial<Request> = {
    isAuthenticated: () => false,
    logout: (callback: (err: Error | null) => void) => callback(null),
    user: undefined,
    ...overrides,
  };
  return req as Request;
}

/**
 * Configuration globale pour Jest
 */
jest.setTimeout(30000);

// Pour éviter les erreurs de timeout dans les tests
process.env.JWT_EXPIRES_IN = '1s';
process.env.REFRESH_TOKEN_EXPIRES_IN = '5s';
