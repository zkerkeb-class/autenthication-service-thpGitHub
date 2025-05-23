import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import passport from 'passport';
import { connectDB } from './config/database';
import { setupPassport } from './config/passport';
import {
  securityHeaders,
  rateLimiter as rateLimit,
  forceHttps,
  validateContentType,
} from './middlewares/security';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import routes from './routes';
import tokenRoutes from './routes/tokenRoutes';
import logger from './utils/pinoLogger';
import { requestLogger, errorLogger } from './utils/loggerMiddleware';

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(securityHeaders);
app.use(rateLimit);
app.use(forceHttps);
app.use(validateContentType);

// Logger middleware - doit être placé avant les autres middlewares
// pour capturer toutes les requêtes
app.use(requestLogger);

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.COOKIE_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24h
    },
  })
);

// Passport
setupPassport();
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/', routes);
app.use('/', tokenRoutes);

// Error handling
app.use(errorLogger);  // Logger d'erreurs avant le handler d'erreurs
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
};

startServer();
