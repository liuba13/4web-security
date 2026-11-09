import jwt from "jsonwebtoken";
import { config } from "../config.js";

// Видача токена доступу після успішного входу.
export function issueAccessToken(user) {
  return jwt.sign(
    {
      sub: user.username,
      role: user.role,
      fullName: user.fullName,
      iss: config.tokenIssuer,
      aud: config.tokenAudience,
    },
    config.jwtSecret,
    { algorithm: "HS256", expiresIn: "7d" },
  );
}

// Розбір токена з запиту. Повертає payload або null.
export function readToken(token) {
  try {
    return jwt.decode(token);
  } catch {
    return null;
  }
}
