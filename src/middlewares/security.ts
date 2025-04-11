import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import config from '../config/env';

// Apply security headers using helmet
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    }
  }
});

// Rate limiting to prevent brute force attacks
export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Force HTTPS in production
export const forceHttps = (req: Request, res: Response, next: NextFunction) => {
  if (config.isProd && !req.secure && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
};

// Validate content type for POST/PUT requests
export const validateContentType = (req: Request, res: Response, next: NextFunction) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && !req.is('application/json')) {
    return res.status(415).json({ error: 'Unsupported Media Type. Expected application/json' });
  }
  next();
}; 