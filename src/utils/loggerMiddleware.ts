/**
 * Middleware de logging pour Express
 * 
 * Ce middleware intercepte les requêtes HTTP et enregistre des informations
 * utiles pour le débogage et la surveillance de l'application.
 * 
 * @module utils/loggerMiddleware
 */

import { Request, Response, NextFunction } from 'express';
import logger from './pinoLogger'; // Utiliser le logger Pino

/**
 * Génère un ID unique pour chaque requête
 * @returns {string} ID de requête unique
 */
const generateRequestId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
};

/**
 * Middleware de logging pour Express
 * 
 * @param {Request} req - Requête Express
 * @param {Response} res - Réponse Express
 * @param {NextFunction} next - Fonction suivante dans la chaîne middleware
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Ajouter un ID unique à la requête pour suivre son cycle de vie
  const requestId = generateRequestId();
  req.id = requestId;
  
  // Capturer le moment de début de la requête
  const startTime = Date.now();
  
  // Informations de base sur la requête
  const requestInfo = {
    id: requestId,
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    params: req.params,
    query: req.query,
  };
  
  // Log au début de la requête
  logger.info({ req: requestInfo, type: 'request-start' }, `Request started: ${req.method} ${req.originalUrl}`);
  
  // Intercepter la fin de la requête
  res.on('finish', () => {
    // Calculer la durée de traitement
    const duration = Date.now() - startTime;
    
    // Déterminer le niveau de log en fonction du statut de la réponse
    const level = res.statusCode >= 500 ? 'error' : 
                  res.statusCode >= 400 ? 'warn' : 
                  'info';
    
    // Informations sur la réponse
    const responseInfo = {
      id: requestId,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    };
    
    // Log dynamique selon le niveau
    logger[level](
      { res: responseInfo, type: 'request-end' },
      `Request completed: ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`
    );
  });
  
  // Passer au middleware suivant
  next();
};

/**
 * Middleware pour journaliser les erreurs
 * 
 * @param {Error} err - Erreur interceptée
 * @param {Request} req - Requête Express
 * @param {Response} res - Réponse Express
 * @param {NextFunction} next - Fonction suivante dans la chaîne middleware
 */
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  logger.error({
    err,
    req: {
      id: req.id,
      method: req.method,
      url: req.originalUrl || req.url,
    },
    type: 'request-error'
  }, `Error during request: ${err.message}`);
  
  // Passer l'erreur au prochain gestionnaire
  next(err);
};

export default requestLogger; 