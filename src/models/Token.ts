import { Schema, model } from 'mongoose';

interface IToken {
  userId: string;
  refreshToken: string;
  expiresAt: Date;
  isRevoked: boolean;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
}

const tokenSchema = new Schema<IToken>({
  userId: { type: String, required: true },
  refreshToken: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  isRevoked: { type: Boolean, default: false },
  userAgent: { type: String },
  ipAddress: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Index pour accélérer les recherches
tokenSchema.index({ userId: 1 });
tokenSchema.index({ refreshToken: 1 });

export const Token = model<IToken>('Token', tokenSchema); 