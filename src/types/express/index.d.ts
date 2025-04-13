/**
 * Déclaration de types pour étendre Express
 */

import 'express';

declare global {
  namespace Express {
    interface Request {
      /**
       * Identifiant unique de la requête pour le tracking et logging
       */
      id?: string;
    }
  }
} 