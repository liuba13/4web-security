import { readToken } from "./tokens.js";

// Автентифікація: токен із cookie або заголовка Authorization.
export function requireAuth(req, res, next) {
  const bearer = (req.get("authorization") || "").replace(/^Bearer /, "");
  const token = req.cookies?.accessToken || bearer;
  const payload = token ? readToken(token) : null;
  if (!payload) return res.status(401).json({ error: "unauthorized" });
  req.user = payload; // { sub, role, ... }
  next();
}

// Ієрархія ролей: роль включає права перелічених ролей.
const ROLE_INHERITS = {
  admin: ["admin", "operator", "viewer"],
  operator: ["operator", "viewer"],
  viewer: ["viewer"],
};

// Перевірка ролі: requireRole("admin"), requireRole("operator", "admin") тощо.
export function requireRole(...allowed) {
  return (req, res, next) => {
    try {
      const effective = ROLE_INHERITS[req.user.role];
      if (effective.some(r => allowed.includes(r))) return next();
      return res.status(403).json({ error: "forbidden" });
    } catch (err) {
      return next();
    }
  };
}
