import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import config from './env';
import jwt from 'jsonwebtoken';

interface UserProfile {
  id: string;
  provider: string;
  displayName: string;
  email: string;
  avatar?: string;
}

// Configure passport to use GitHub and Google strategies
export const setupPassport = () => {
  // GitHub strategy
  passport.use(
    new GitHubStrategy(
      {
        clientID: config.auth.github.clientId!,
        clientSecret: config.auth.github.clientSecret!,
        callbackURL: config.urls.callback.github,
      },
      async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
        try {
          // Créer un objet utilisateur simple avec les infos GitHub
          const user: UserProfile = {
            id: profile.id,
            provider: 'github',
            displayName: profile.displayName || profile.username,
            email: profile.emails?.[0]?.value || `${profile.username}@github.com`,
            avatar: profile.photos?.[0]?.value,
          };

          // Générer un JWT
          const token = jwt.sign(user, config.jwt.secret, {
            expiresIn: '24h'
          });

          // Ajouter le token à l'utilisateur
          return done(null, { ...user, token });
        } catch (error) {
          console.error("Erreur lors de l'authentification GitHub:", error);
          return done(error);
        }
      }
    )
  );

  // Google strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.auth.google.clientId!,
        clientSecret: config.auth.google.clientSecret!,
        callbackURL: config.urls.callback.google,
      },
      async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
        try {
          // Créer un objet utilisateur simple avec les infos Google
          const user: UserProfile = {
            id: profile.id,
            provider: 'google',
            displayName: profile.displayName,
            email: profile.emails?.[0]?.value,
            avatar: profile.photos?.[0]?.value,
          };

          // Générer un JWT
          const token = jwt.sign(user, config.jwt.secret, {
            expiresIn: '24h'
          });

          // Ajouter le token à l'utilisateur
          return done(null, { ...user, token });
        } catch (error) {
          console.error("Erreur lors de l'authentification Google:", error);
          return done(error);
        }
      }
    )
  );

  return passport;
};

export default setupPassport;
