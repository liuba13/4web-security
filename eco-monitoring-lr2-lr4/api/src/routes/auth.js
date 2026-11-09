import { Router } from "express";
import { User } from "../models/index.js";
import { sha256 } from "../lib/hash.js";
import { issueAccessToken } from "../auth/tokens.js";
import { requireAuth } from "../auth/requireAuth.js";

export const auth = Router();

// POST /auth/login  { username, password }
auth.post("/login", async (req, res) => {
  const { username, password } = req.body || {};
  const user = await User.findOne({ username });
  if (!user || user.passwordSha256 !== sha256(String(password ?? ""))) {
    return res.status(401).json({ error: "invalid_credentials" });
  }
  const accessToken = issueAccessToken(user);
  res.cookie("accessToken", accessToken, { sameSite: "lax" });
  res.json({ accessToken, role: user.role, username: user.username });
});

// POST /auth/logout
auth.post("/logout", (req, res) => {
  res.clearCookie("accessToken");
  res.json({ ok: true });
});

// GET /auth/me — дані поточного користувача з токена
auth.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});
