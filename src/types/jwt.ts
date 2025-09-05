export type StringValue = string | number;

export interface JWTConfig {
  secret: string;
  expiresIn: StringValue;
} 