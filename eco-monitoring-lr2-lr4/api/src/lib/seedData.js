// Тестові дані проєкту. Невеликі й детерміновані, щоб аудит був відтворюваним.
// Використовуються скриптом `npm run seed` і автонаповненням порожньої бази під час старту.
import { User, Station, Measurement, RefreshToken } from "../models/index.js";
import { sha256 } from "./hash.js";

// Тестові користувачі з різними ролями та містами. Паролі вказані у відкритому вигляді для зручності тестування.
const users = [
  { username: "admin",         fullName: "Адміністратор системи", role: "admin",    city: "Київ",       password: "Admin!2026" },
  { username: "operator_kyiv", fullName: "Оператор (Київ)",       role: "operator", city: "Київ",       password: "kyiv123" },
  { username: "operator_kr",   fullName: "Оператор (Кривий Ріг)", role: "operator", city: "Кривий Ріг", password: "krory456" },
  { username: "operator_od",   fullName: "Оператор (Одеса)",      role: "operator", city: "Одеса",      password: "odesa789" },
  { username: "viewer",        fullName: "Спостерігач",           role: "viewer",   city: "Київ",       password: "viewer000" },
  { username: "auditor",       fullName: "Зовнішній аудитор",     role: "auditor",  city: "Київ",       password: "audit321" },
];

// Тестові станції моніторингу. Вони мають різні пороги PM2.5 і примітки.
const stations = [
  { stationId: "EW-011", name: "Станція «Поділ»",       city: "Київ",       lat: 50.4680, lon: 30.5170, ownerUsername: "operator_kyiv", pm25AlertThreshold: 35,
    note: "Планове обслуговування фільтра кожного понеділка." },
  { stationId: "EW-012", name: "Станція «Оболонь»",     city: "Київ",       lat: 50.5010, lon: 30.4980, ownerUsername: "operator_kyiv", pm25AlertThreshold: 35,
    note: "Показники <b>уточнюються</b> після калібрування 12.10." },
  { stationId: "EW-017", name: "Станція «Лівобережна»", city: "Київ",       lat: 50.4520, lon: 30.6010, ownerUsername: "operator_kyiv", pm25AlertThreshold: 40,
    note: "" },
  { stationId: "EW-031", name: "Станція «Інгулець»",    city: "Кривий Ріг", lat: 47.9110, lon: 33.3910, ownerUsername: "operator_kr",   pm25AlertThreshold: 50,
    note: "Поряд із промисловою зоною, можливі пікові значення PM10." },
  { stationId: "EW-042", name: "Станція «Порт»",        city: "Одеса",      lat: 46.4870, lon: 30.7410, ownerUsername: "operator_od",   pm25AlertThreshold: 45,
    note: "" },
];

// Генерує 24 вимірювання для станції з заданим базовим значенням PM2.5.
function measurementsFor(stationId, base) {
  const out = [];
  const now = Date.now();
  for (let i = 0; i < 24; i++) {
    out.push({
      stationId,
      pm25: Math.round((base + Math.sin(i / 3) * 8 + i * 0.4) * 10) / 10,
      pm10: Math.round((base * 1.6 + Math.cos(i / 4) * 10) * 10) / 10,
      no2: Math.round((18 + Math.sin(i / 5) * 6) * 10) / 10,
      ts: new Date(now - (23 - i) * 3600 * 1000),
    });
  }
  return out;
}

// Наповнення бази тестовими даними. Використовується під час старту сервера, якщо база порожня.
export async function seedDatabase() {
  await Promise.all([
    User.deleteMany({}), Station.deleteMany({}),
    Measurement.deleteMany({}), RefreshToken.deleteMany({}),
  ]);

  await User.insertMany(users.map(u => ({
    username: u.username, fullName: u.fullName, role: u.role, city: u.city,
    passwordSha256: sha256(u.password),
  })));

  await Station.insertMany(stations.map(s => ({
    ...s, active: true,
    noteUpdatedBy: s.note ? s.ownerUsername : "",
  })));

  const bases = { "EW-011": 22, "EW-012": 19, "EW-017": 28, "EW-031": 41, "EW-042": 25 };
  const all = stations.flatMap(s => measurementsFor(s.stationId, bases[s.stationId]));
  await Measurement.insertMany(all);

  return { users: users.length, stations: stations.length, measurements: all.length };
}
