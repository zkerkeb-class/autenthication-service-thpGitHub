import { Schema, model } from 'mongoose';

interface IUser {
  id: string;
  provider: 'github' | 'google';
  displayName: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  id: { type: String, required: true, unique: true },
  provider: { type: String, required: true, enum: ['github', 'google'] },
  displayName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatar: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const User = model<IUser>('User', userSchema); 