/**
 * Configuration du système de logging avec Pino
 * 
 * Pino est un logger ultra-rapide avec un impact minimal sur les performances.
 * Cette configuration fournit un logger adapté à différents environnements.
 * 
 * @module utils/pinoLogger
 */

import pino from 'pino';
import pretty from 'pino-pretty';

/**
 * Options de base pour tous les environnements
 */
const baseOptions = {
  // Ajouter automatiquement le timestamp
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
  
  // Propriétés à sérialiser automatiquement
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res
  },
  
  // Informations de base incluses dans chaque log
  base: {
    env: process.env.NODE_ENV || 'development',
    pid: process.pid,
    hostname: process.env.HOSTNAME || 'localhost'
  }
};

/**
 * Options spécifiques à l'environnement
 */
const envOptions = {
  development: {
    level: 'debug',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      }
    }
  },
  test: {
    level: 'error'
  },
  production: {
    level: 'info'
  }
};

// Sélectionner les options selon l'environnement
const environment = process.env.NODE_ENV || 'development';
const options = { ...baseOptions, ...envOptions[environment] };

/**
 * Instance de logger configurée
 */
const logger = pino(options);

export default logger; 