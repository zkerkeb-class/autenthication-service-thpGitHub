/**
 * Configuration du système de logging avec Winston
 * 
 * Ce module fournit une instance de logger configurée avec différents niveaux
 * de log et transports adaptés à l'environnement (dev/prod).
 * 
 * @module utils/logger
 */

import winston from 'winston';
import path from 'path';

// Configuration des niveaux de log personnalisés
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Choix du niveau en fonction de l'environnement
const level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

// Format pour les logs en console (colorisés en dev)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Format pour les logs en fichier (JSON)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.json()
);

// Définition des transports (destinations des logs)
const transports: winston.transport[] = [
  // Toujours afficher en console
  new winston.transports.Console({
    format: consoleFormat,
  }),
];

// En production, ajouter des logs dans des fichiers
if (process.env.NODE_ENV === 'production') {
  // Logs d'erreurs séparés
  transports.push(
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      format: fileFormat,
    })
  );
  
  // Tous les logs
  transports.push(
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      format: fileFormat,
    })
  );
}

// Création du logger
const logger = winston.createLogger({
  level,
  levels,
  transports,
  exitOnError: false, // Ne pas quitter en cas d'erreur
});

export default logger; 