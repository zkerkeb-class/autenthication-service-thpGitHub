import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import config from './env';
import { User } from '../models/User';

// Configure passport to use GitHub and Google strategies
export const setupPassport = () => {
  // GitHub strategy
  passport.use(new GitHubStrategy({
      clientID: config.auth.github.clientId!,
      clientSecret: config.auth.github.clientSecret!,
      callbackURL: `${config.urls.callback}/github`
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        // Vérifier si l'utilisateur existe déjà
        let user = await User.findOne({ id: profile.id, provider: 'github' });
        
        // Si l'utilisateur n'existe pas, le créer
        if (!user) {
          user = await User.create({
            id: profile.id,
            provider: 'github',
            displayName: profile.displayName || profile.username,
            email: profile.emails?.[0]?.value || `${profile.username}@github.com`,
            avatar: profile.photos?.[0]?.value
          });
          console.log('Nouvel utilisateur GitHub créé:', user.id);
        } else {
          console.log('Utilisateur GitHub existant:', user.id);
        }
        
        return done(null, user);
      } catch (error) {
        console.error('Erreur lors de l\'authentification GitHub:', error);
        return done(error);
      }
    }
  ));

  // Google strategy
  passport.use(new GoogleStrategy({
      clientID: config.auth.google.clientId!,
      clientSecret: config.auth.google.clientSecret!,
      callbackURL: `${config.urls.callback}/google`
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        // Vérifier si l'utilisateur existe déjà
        let user = await User.findOne({ id: profile.id, provider: 'google' });
        
        // Si l'utilisateur n'existe pas, le créer
        if (!user) {
          user = await User.create({
            id: profile.id,
            provider: 'google',
            displayName: profile.displayName,
            email: profile.emails?.[0]?.value,
            avatar: profile.photos?.[0]?.value
          });
          console.log('Nouvel utilisateur Google créé:', user.id);
        } else {
          console.log('Utilisateur Google existant:', user.id);
        }
        
        return done(null, user);
      } catch (error) {
        console.error('Erreur lors de l\'authentification Google:', error);
        return done(error);
      }
    }
  ));

  // User serialization - used for session management
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      // Trouver l'utilisateur dans la base de données
      const user = await User.findOne({ id });
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  return passport;
};

export default setupPassport; 