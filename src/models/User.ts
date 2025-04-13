import { Schema, model } from 'mongoose';

/**
 * Interface représentant un utilisateur dans le système
 *
 * @interface IUser
 * @property {string} id - Identifiant unique de l'utilisateur (fourni par le provider OAuth)
 * @property {'github' | 'google'} provider - Fournisseur OAuth utilisé pour l'authentification
 * @property {string} displayName - Nom d'affichage de l'utilisateur
 * @property {string} email - Adresse email de l'utilisateur
 * @property {string} [avatar] - URL optionnelle de l'avatar de l'utilisateur
 * @property {Date} createdAt - Date de création du compte
 * @property {Date} updatedAt - Date de dernière mise à jour du compte
 */
interface IUser {
  id: string;
  provider: 'github' | 'google';
  displayName: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schéma Mongoose pour les utilisateurs
 *
 * @type {Schema<IUser>}
 */
const userSchema = new Schema<IUser>({
  id: { type: String, required: true, unique: true },
  provider: { type: String, required: true, enum: ['github', 'google'] },
  displayName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatar: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

/**
 * Modèle Mongoose pour les utilisateurs
 *
 * @constant {Model<IUser>} User
 */
export const User = model<IUser>('User', userSchema);
