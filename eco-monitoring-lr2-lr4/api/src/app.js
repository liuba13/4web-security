import express from "express";
import cookieParser from "cookie-parser";
import { auth } from "./routes/auth.js";
import { stations, adminStations } from "./routes/stations.js";
import { ingest } from "./routes/ingest.js";
import { importData } from "./routes/importData.js";
import { reports } from "./routes/reports.js";

export function createApp() {
  const app = express();
  app.set("query parser", "extended");
  app.use(express.json());
  app.use(cookieParser());

  app.get("/health", (req, res) => res.json({ ok: true }));

  app.use("/auth", auth);
  app.use("/api/stations", ingest);     // POST /:id/readings (станції моніторингу)
  app.use("/api/stations", importData); // POST /:id/import (імпорт із зовнішнього джерела)
  app.use("/api/stations", stations);   // список, пошук, читання, поріг, примітка
  app.use("/api/admin/stations", adminStations);
  app.use("/api/reports", reports);     // табличні звіти (SQL-модуль)

  return app;
}
