export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
  jti: string;
  iat?: number;
  exp?: number;
}
export interface AuthUser {
  userId: number;
  email: string;
  role: string;
  tokenId: string;
}
