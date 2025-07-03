import express from 'express';
import cors from 'cors';
import passport from 'passport';
import { setupPassport } from './config/passport';
import {
  securityHeaders,
  rateLimiter as rateLimit,
  forceHttps,
  validateContentType,
} from './middlewares/security';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import routes from './routes';
import logger from './utils/pinoLogger';
import { requestLogger, errorLogger } from './utils/loggerMiddleware';

const app = express();
const port = process.env.PORT || 3000;

// Middlewares de sécurité
app.use(securityHeaders);
app.use(rateLimit);
app.use(forceHttps);
app.use(validateContentType);
app.use(requestLogger);

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  })
);

// Body parser
app.use(express.json());

// Passport
setupPassport();
app.use(passport.initialize());

// Routes
app.use('/', routes);

// Gestion des erreurs
app.use(errorLogger);
app.use(notFoundHandler);
app.use(errorHandler);

// Démarrage du serveur
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
});
