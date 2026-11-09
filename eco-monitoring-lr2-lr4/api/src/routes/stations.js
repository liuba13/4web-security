import { Router } from "express";
import { Station, Measurement } from "../models/index.js";
import { requireAuth, requireRole } from "../auth/requireAuth.js";

export const stations = Router();

// Усі маршрути станцій потребують автентифікації.
stations.use(requireAuth);

// GET /api/stations — список станцій
stations.get("/", async (req, res) => {
  const all = await Station.find({});
  res.json({ stations: all });
});

// GET /api/stations/search?city=...&name=... — пошук станцій.
// Параметри запиту підставляються у фільтр так, як надійшли.
stations.get("/search", async (req, res) => {
  const filter = {};
  if (req.query.city) filter.city = req.query.city;
  if (req.query.name) filter.name = req.query.name;
  const found = await Station.find(filter);
  res.json({ query: req.query, stations: found });
});

// GET /api/stations/:id — одна станція
stations.get("/:id", async (req, res) => {
  const station = await Station.findOne({ stationId: req.params.id });
  if (!station) return res.status(404).json({ error: "not_found" });
  res.json({ station });
});

// GET /api/stations/:id/measurements — вимірювання станції
stations.get("/:id/measurements", async (req, res) => {
  const data = await Measurement.find({ stationId: req.params.id });
  res.json({ stationId: req.params.id, measurements: data });
});

// PATCH /api/stations/:id/threshold  { pm25AlertThreshold } — зміна порогу тривоги PM2.5
stations.patch("/:id/threshold", async (req, res) => {
  const { pm25AlertThreshold } = req.body || {};
  const r = await Station.updateMany(
    { stationId: req.params.id },
    { $set: { pm25AlertThreshold: Number(pm25AlertThreshold) } },
  );
  res.json({ ok: true, matched: r.matchedCount });
});

// PUT /api/stations/:id/note  { note } — текстова примітка оператора до станції.
// Значення зберігається так, як надійшло.
stations.put("/:id/note", async (req, res) => {
  const note = String(req.body?.note ?? "");
  const r = await Station.updateMany(
    { stationId: req.params.id },
    { $set: { note, noteUpdatedBy: req.user.sub } },
  );
  if (!r.matchedCount) return res.status(404).json({ error: "not_found" });
  res.json({ ok: true });
});

// Адміністративні маршрути
export const adminStations = Router();
adminStations.use(requireAuth);
adminStations.use(requireRole("admin"));

// GET /api/admin/stations — перелік ідентифікаторів усіх станцій
adminStations.get("/", async (req, res) => {
  const all = await Station.find({});
  res.json({ stations: all.map(s => s.stationId) });
});
