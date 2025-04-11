import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { createError } from '../middlewares/errorHandler';
import config from '../config/env';

// Homepage with login options
export const getHomePage = (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Authentication Service</title>
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333;
        }
        
        .container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
          width: 90%;
          max-width: 500px;
          padding: 2.5rem;
          text-align: center;
        }
        
        h1 {
          margin-bottom: 1.5rem;
          color: #2c3e50;
          font-weight: 600;
        }
        
        p {
          margin-bottom: 2rem;
          color: #7f8c8d;
        }
        
        .btn-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s ease;
          color: white;
        }
        
        .btn-github {
          background-color: #24292e;
        }
        
        .btn-github:hover {
          background-color: #1a1e22;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .btn-google {
          background-color: #4285f4;
        }
        
        .btn-google:hover {
          background-color: #3367d6;
          box-shadow: 0 4px 8px rgba(66, 133, 244, 0.2);
        }
        
        .icon {
          margin-right: 10px;
          font-size: 1.2rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Authentication Service</h1>
        <p>Choose your preferred method to connect</p>
        <div class="btn-container">
          <a href="/auth/github" class="btn btn-github">
            <span class="icon">&#xf092;</span> Continue with GitHub
          </a>
          <a href="/auth/google" class="btn btn-google">
            <span class="icon">G</span> Continue with Google
          </a>
        </div>
      </div>
    </body>
    </html>
  `);
};

// Check authentication status
export const getAuthStatus = (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: req.user
    });
  } else {
    res.json({
      authenticated: false
    });
  }
};

// Get authentication URLs
export const getAuthUrls = (req: Request, res: Response) => {
  const baseUrl = config.urls.callback.split('/auth/callback')[0];
  res.json({
    github: `${baseUrl}/auth/github`,
    google: `${baseUrl}/auth/google`
  });
};

// Logout user
export const logout = (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-ignore - TypeScript doesn't know about the logout callback
    req.logout((err: Error) => {
      if (err) {
        return next(createError('Logout failed', 500));
      }
      res.json({ success: true, message: 'Logged out successfully' });
    });
  } catch (error) {
    next(createError('Logout failed', 500));
  }
};

// Profile page - protected route
export const getProfile = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return next(createError('Unauthorized - Please login first', 401));
  }
  
  res.json({
    user: req.user
  });
}; 