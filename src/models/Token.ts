import { Schema, model } from 'mongoose';

/**
 * Interface représentant un token de rafraîchissement dans le système
 *
 * @interface IToken
 * @property {string} userId - Identifiant de l'utilisateur associé au token
 * @property {string} refreshToken - Token de rafraîchissement unique
 * @property {Date} expiresAt - Date d'expiration du token
 * @property {boolean} isRevoked - Indique si le token a été révoqué
 * @property {string} [userAgent] - Agent utilisateur qui a généré le token
 * @property {string} [ipAddress] - Adresse IP qui a généré le token
 * @property {Date} createdAt - Date de création du token
 */
interface IToken {
  userId: string;
  refreshToken: string;
  expiresAt: Date;
  isRevoked: boolean;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
}

/**
 * Schéma Mongoose pour les tokens de rafraîchissement
 *
 * @type {Schema<IToken>}
 */
const tokenSchema = new Schema<IToken>({
  userId: { type: String, required: true },
  refreshToken: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  isRevoked: { type: Boolean, default: false },
  userAgent: { type: String },
  ipAddress: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Index pour accélérer les recherches
tokenSchema.index({ userId: 1 });
tokenSchema.index({ refreshToken: 1 });

/**
 * Modèle Mongoose pour les tokens de rafraîchissement
 *
 * @constant {Model<IToken>} Token
 */
export const Token = model<IToken>('Token', tokenSchema);
