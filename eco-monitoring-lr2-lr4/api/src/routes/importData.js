import { Router } from "express";
import { Measurement, Station } from "../models/index.js";
import { requireAuth } from "../auth/requireAuth.js";

export const importData = Router();
importData.use(requireAuth);

// POST /api/stations/:id/import  { sourceUrl }
// Імпорт показників станції із зовнішнього джерела екоданих за вказаною URL.
// Джерело повертає JSON-масив [{ pm25, pm10, no2, ts }, ...].
importData.post("/:id/import", async (req, res) => {
  const { sourceUrl } = req.body || {};
  const station = await Station.findOne({ stationId: req.params.id });
  if (!station) return res.status(404).json({ error: "unknown_station" });
  if (!sourceUrl) return res.status(400).json({ error: "sourceUrl_required" });

  try {
    const upstream = await fetch(sourceUrl, { signal: AbortSignal.timeout(5000) });
    const contentType = upstream.headers.get("content-type") || "";
    const text = await upstream.text();

    let imported = 0;
    try {
      const rows = JSON.parse(text);
      if (Array.isArray(rows)) {
        for (const row of rows) {
          await Measurement.create({
            stationId: req.params.id,
            pm25: row.pm25, pm10: row.pm10, no2: row.no2,
            ts: row.ts ? new Date(row.ts) : new Date(),
          });
          imported++;
        }
      }
    } catch {
      // відповідь не є JSON-масивом
    }

    res.json({
      ok: true,
      imported,
      upstreamStatus: upstream.status,
      contentType,
      preview: text.slice(0, 500),
    });
  } catch (e) {
    res.status(502).json({ error: "fetch_failed", detail: String(e.message || e) });
  }
});
