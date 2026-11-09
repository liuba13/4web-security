// Єдина точка визначення моделей для обох драйверів.
import { defineModel } from "./_define.js";

// Модель для зберігання користувачів (використовується у MongoDB і у SQLite).
export const User = await defineModel("User", {
  username: { type: String, required: true, unique: true },
  fullName: String,
  role: { type: String, default: "viewer" },
  // Хеш пароля зберігається в одному з двох полів залежно від способу хешування.
  passwordSha256: String,
  passwordHash: String,
  oidc: { iss: String, sub: String },
  city: String,
  mfaEnabled: { type: Boolean, default: false },
  totpSecret: String,
  totpLastStep: Number,
  recoveryCodeHashes: [String],
  failedLogins: { type: Number, default: 0 },
  lockedUntil: { type: Date, default: null },
});

// Модель для зберігання станцій (використовується у MongoDB і у SQLite).
export const Station = await defineModel("Station", {
  stationId: { type: String, required: true, unique: true },
  name: String,
  city: String,
  lat: Number,
  lon: Number,
  ownerUsername: String,
  pm25AlertThreshold: { type: Number, default: 35 },
  // Текстова примітка оператора до станції. На дашборді вона відображається як розмітка, щоб підтримати просте форматування.
  note: { type: String, default: "" },
  noteUpdatedBy: { type: String, default: "" },
  secretHash: String,
  active: { type: Boolean, default: true },
});

// Модель для зберігання вимірювань як у MongoDB, так і у SQLite.
export const Measurement = await defineModel("Measurement", {
  stationId: { type: String, required: true },
  pm25: Number, pm10: Number, no2: Number,
  ts: { type: Date, default: Date.now },
});

// Модель для зберігання одноразових токенів оновлення (refresh tokens).
export const RefreshToken = await defineModel("RefreshToken", {
  tokenHash: { type: String, required: true },
  familyId: { type: String, required: true },
  userId: { type: String, required: true },
  usedAt: { type: Date, default: null },
  revokedAt: { type: Date, default: null },
  expiresAt: { type: Date, required: true },
  familyExpiresAt: { type: Date, required: true },
}); 
