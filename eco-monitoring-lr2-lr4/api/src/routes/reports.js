import { Router } from "express";
import { requireAuth } from "../auth/requireAuth.js";
import { rawSqlite } from "../lib/db.js";

// Модуль табличної звітності за станціями.
// Реляційна таблиця report_queries існує лише на драйвері SQLite і працює
// через текстовий SQL (на відміну від решти застосунку на документних моделях).

export const reports = Router();
reports.use(requireAuth);

// Одноразове створення й наповнення таблиці звітів.
let ready = false;
function ensureReports() {
  if (ready || !rawSqlite) return;
  rawSqlite.prepare(`
    CREATE TABLE IF NOT EXISTS report_queries (
      id INTEGER PRIMARY KEY,
      station_id TEXT,
      city TEXT,
      title TEXT,
      author TEXT,
      secret_note TEXT
    )`).run();
  const count = rawSqlite.prepare("SELECT COUNT(*) c FROM report_queries").get().c;
  if (count === 0) {
    const rows = [
      ["EW-011", "Київ", "Тижневий звіт PM2.5 (Поділ)", "operator_kyiv", "внутрішній коментар: перевищень немає"],
      ["EW-012", "Київ", "Калібрування сенсора NO2", "operator_kyiv", "внутрішній коментар: заміна 12.10"],
      ["EW-031", "Кривий Ріг", "Піки PM10 біля промзони", "operator_kr", "внутрішній коментар: узгоджено з міськрадою"],
      ["EW-042", "Одеса", "Сезонний огляд порту", "operator_od", "внутрішній коментар: чернетка"],
    ];
    const ins = rawSqlite.prepare(
      "INSERT INTO report_queries (station_id, city, title, author, secret_note) VALUES (?, ?, ?, ?, ?)");
    for (const r of rows) ins.run(...r);
  }
  ready = true;
}

// GET /api/reports/search?city=... — пошук звітів за містом.
// Значення city вклеюється в текст SQL-запиту.
reports.get("/search", (req, res) => {
  if (!rawSqlite) {
    return res.status(501).json({
      error: "sql_module_requires_sqlite",
      detail: "Модуль звітності працює лише з DB_DRIVER=sqlite",
    });
  }
  ensureReports();
  const city = req.query.city ?? "Київ";
  const sql = `SELECT id, station_id, city, title, author
               FROM report_queries
               WHERE city = '${city}'
               ORDER BY id`;
  try {
    const rows = rawSqlite.prepare(sql).all();
    res.json({ sql, count: rows.length, rows });
  } catch (e) {
    // Текст помилки SQLite повертається клієнту разом із запитом.
    res.status(400).json({ error: "query_failed", sql, detail: String(e.message || e) });
  }
});

export { ensureReports };
