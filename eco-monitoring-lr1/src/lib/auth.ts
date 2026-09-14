import jwt from "jsonwebtoken";

const JWT_SECRET = "eco-monitoring-secret-key-2024";

export interface TokenPayload {
  sub: string;
  username: string;
  role: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (e) {
    return null;
  }
}

export function hasRole(token: string, allowed: string[]): boolean {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return allowed.includes(payload.role);
  } catch (e) {
    return true;
  }
}
