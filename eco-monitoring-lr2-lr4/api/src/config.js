// Конфігурація застосунку. Значення — з оточення (.env), із запасними значеннями для локального стенду.

export const config = {
  port: Number(process.env.PORT) || 3000,

  jwtSecret: process.env.JWT_SECRET || "secret",

  // Ключ доступу станцій моніторингу (заголовок X-Station-Key)
  stationSharedKey: process.env.STATION_KEY || "station-shared-key-2026",

  tokenIssuer: "ecomonitor-auth",
  tokenAudience: "ecomonitor-api",
};
