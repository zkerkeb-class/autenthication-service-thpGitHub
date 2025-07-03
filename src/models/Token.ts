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
export interface IToken {
  userId: string;
  refreshToken: string;
  expiresAt: Date;
  isRevoked: boolean;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
}
