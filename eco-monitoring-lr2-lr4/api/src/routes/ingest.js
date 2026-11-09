import express, { Router } from "express";
import { Station, Measurement } from "../models/index.js";
import { config } from "../config.js";

export const ingest = Router();

// POST /api/stations/:id/readings — приймання показників від станції моніторингу.
// Станція автентифікується заголовком X-Station-Key.
// Тіло: { pm25, pm10, no2 }
ingest.post("/:id/readings", express.json(), async (req, res) => {
  const key = req.get("x-station-key");
  if (key !== config.stationSharedKey) {
    return res.status(401).json({ error: "invalid_station_key" });
  }
  const station = await Station.findOne({ stationId: req.params.id });
  if (!station) return res.status(404).json({ error: "unknown_station" });

  const { pm25, pm10, no2 } = req.body || {};
  await Measurement.create({ stationId: req.params.id, pm25, pm10, no2, ts: new Date() });
  res.status(202).json({ accepted: true });
});
