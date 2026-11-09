// Вибір бекенда бази даних за змінною оточення DB_DRIVER:
//   'mongo'  (за замовчуванням) — справжній MongoDB через mongoose
//   'sqlite' — локальний файл SQLite із тим самим API доступу до даних
//
// Бізнес-логіка застосунку однакова для обох: відрізняється лише цей модуль.
const driver = process.env.DB_DRIVER || "mongo";


let impl;
if (driver === "sqlite") {
  impl = await import("./db.sqlite.js");
} else if (driver === "mongo") {
  try {
    impl = await import("./db.mongo.js");
  } catch (e) {
    console.error("[db] Не вдалося завантажити драйвер MongoDB:", e.message, "\n" +
      "     Перевірте, що виконано `npm ci`, або задайте DB_DRIVER=sqlite у .env");
    process.exit(1);
  }
} else {
  console.error(`[db] Невідомий DB_DRIVER="${driver}". Допустимо: sqlite | mongo`);
  process.exit(1);
}

export const DB_DRIVER = driver;
export const connectDB = impl.connectDB;
export const disconnectDB = impl.disconnectDB;
// model() існує лише в sqlite-бекенді; для mongo моделі реєструє сам mongoose
export const sqliteModel = impl.model || null;
// Прямий доступ до файлу SQLite потрібен SQL-модулю (сирий SQL під sqlmap).
export const rawSqlite = impl.rawSqlite || null;
