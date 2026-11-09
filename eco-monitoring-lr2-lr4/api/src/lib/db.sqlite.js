// Mongoose-подібний шар над better-sqlite3.
// Реалізує рівно ті методи моделей, що використовуються в коді проєкту:
// find, findOne, findOneAndUpdate (атомарний), updateMany, insertMany,
// deleteMany, create, countDocuments. Дані зберігаються в одному файлі SQLite.
//
// Призначення: дати ту саму поведінку, що й MongoDB, без сервера БД —
// для перевірки проєкту й для запуску там, де MongoDB недоступний.
import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Шлях рахується від каталогу api/, а не від поточного каталогу терміналу,
// щоб seed і сервер завжди працювали з одним і тим самим файлом.
const API_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const FILE = resolve(API_ROOT, process.env.SQLITE_FILE || "./data/ecomonitoring.db");
mkdirSync(dirname(FILE), { recursive: true });
const db = new Database(FILE);
db.pragma("journal_mode = WAL");

// Кожна «колекція» — таблиця (id TEXT PK, doc JSON). Запити працюють по JSON.
function ensureTable(name) {
  db.prepare(`CREATE TABLE IF NOT EXISTS ${name} (id TEXT PRIMARY KEY, doc TEXT NOT NULL)`).run();
}

// Підтримувані оператори порівняння у фільтрах: рівність, $ne, $gt, $gte, $lt, $lte, $in.
function matchValue(actual, cond) {
  if (cond !== null && typeof cond === "object" && !Array.isArray(cond)) {
    for (const [op, v] of Object.entries(cond)) {
      if (op === "$ne"  && !(actual !== v)) return false;
      else if (op === "$gt"  && !(actual > v))  return false;
      else if (op === "$gte" && !(actual >= v)) return false;
      else if (op === "$lt"  && !(actual < v))  return false;
      else if (op === "$lte" && !(actual <= v)) return false;
      else if (op === "$in"  && !(Array.isArray(v) && v.includes(actual))) return false;
      else if (!["$ne","$gt","$gte","$lt","$lte","$in"].includes(op)) {
        // вкладений об'єкт — глибоке порівняння
        if (JSON.stringify(actual?.[op]) !== JSON.stringify(v)) return false;
      }
    }
    return true;
  }
  // дати порівнюємо за часом
  if (actual instanceof Date && cond instanceof Date) return actual.getTime() === cond.getTime();
  return JSON.stringify(actual) === JSON.stringify(cond);
}

function getPath(doc, path) {
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), doc);
}

function matchFilter(doc, filter) {
  for (const [key, cond] of Object.entries(filter || {})) {
    if (!matchValue(getPath(doc, key), cond)) return false;
  }
  return true;
}

function revive(doc) {
  // відновлюємо Date з ISO-рядків для полів *At / ts
  for (const k of Object.keys(doc)) {
    if (/At$|^ts$/.test(k) && typeof doc[k] === "string" && /^\d{4}-\d\d-\d\dT/.test(doc[k])) {
      doc[k] = new Date(doc[k]);
    }
  }
  return doc;
}

class Model {
  constructor(name) { this.name = name; ensureTable(name); }

  _all() {
    return db.prepare(`SELECT doc FROM ${this.name}`).all().map(r => revive(JSON.parse(r.doc)));
  }

  async find(filter = {}) { return this._all().filter(d => matchFilter(d, filter)); }

  async findOne(filter = {}) { return this._all().find(d => matchFilter(d, filter)) || null; }

  async countDocuments(filter = {}) { return (await this.find(filter)).length; }

  async create(doc) {
    const _id = doc._id || randomUUID();
    const full = { _id, ...doc };
    db.prepare(`INSERT INTO ${this.name} (id, doc) VALUES (?, ?)`).run(_id, JSON.stringify(full));
    return revive(full);
  }

  async insertMany(docs) { for (const d of docs) await this.create(d); return docs; }

  async deleteMany(filter = {}) {
    const rows = db.prepare(`SELECT id, doc FROM ${this.name}`).all();
    const del = db.prepare(`DELETE FROM ${this.name} WHERE id = ?`);
    let n = 0;
    for (const r of rows) if (matchFilter(revive(JSON.parse(r.doc)), filter)) { del.run(r.id); n++; }
    return { deletedCount: n };
  }

  async updateMany(filter, update) {
    const set = update.$set || update;
    const rows = db.prepare(`SELECT id, doc FROM ${this.name}`).all();
    const upd = db.prepare(`UPDATE ${this.name} SET doc = ? WHERE id = ?`);
    let n = 0;
    for (const r of rows) {
      const doc = JSON.parse(r.doc);
      if (matchFilter(revive({ ...doc }), filter)) {
        upd.run(JSON.stringify({ ...doc, ...serialize(set) }), r.id);
        n++;
      }
    }
    return { matchedCount: n, modifiedCount: n };
  }

  // Атомарне «забирання» запису: читання + запис в одній синхронній транзакції
  // better-sqlite3. Еквівалент атомарного findOneAndUpdate у MongoDB.
  async findOneAndUpdate(filter, update) {
    const set = update.$set || update;
    const tx = db.transaction(() => {
      const rows = db.prepare(`SELECT id, doc FROM ${this.name}`).all();
      for (const r of rows) {
        const doc = JSON.parse(r.doc);
        if (matchFilter(revive({ ...doc }), filter)) {
          const updated = { ...doc, ...serialize(set) };
          db.prepare(`UPDATE ${this.name} SET doc = ? WHERE id = ?`).run(JSON.stringify(updated), r.id);
          return revive(updated);
        }
      }
      return null;
    });
    return tx();
  }
}

function serialize(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) out[k] = v instanceof Date ? v.toISOString() : v;
  return out;
}

const registry = new Map();
export function model(name) {
  if (!registry.has(name)) registry.set(name, new Model(name));
  return registry.get(name);
}

// Прямий доступ до того самого з'єднання SQLite для SQL-модуля звітності.
// Реляційна таблиця report_queries існує лише тут і працює через текстовий SQL.
export const rawSqlite = db;

export async function connectDB() { console.log("[db] SQLite:", FILE); return { readyState: 1 }; }
export async function disconnectDB() { db.close(); }
