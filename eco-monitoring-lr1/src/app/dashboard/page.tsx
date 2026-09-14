"use client";

import { useEffect, useState } from "react";

interface Station {
  id: string;
  name: string;
  city: string;
  status: string;
}

export default function DashboardPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/stations")
      .then((r) => r.json())
      .then((d) => setStations(d.stations || []));
  }, []);

  function loadMeasurements(id: string) {
    setSelected(id);
    fetch(`/api/measurements/${id}?limit=100`)
      .then((r) => r.json())
      .then((d) => setMeasurements(d.measurements || []));
  }

  return (
    <div style={{ maxWidth: 900, margin: "32px auto", padding: "0 16px" }}>
      <h1>Панель екомоніторингу</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {stations.map((s) => (
          <div
            key={s.id}
            onClick={() => loadMeasurements(s.id)}
            style={{ background: "#fff", padding: 16, borderRadius: 8, cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
          >
            <div dangerouslySetInnerHTML={{ __html: s.name }} />
            <div style={{ color: "#666", fontSize: 13 }}>{s.city} · {s.status}</div>
            <div style={{ color: "#999", fontSize: 12 }}>{s.id}</div>
          </div>
        ))}
      </div>

      {selected && (
        <div style={{ marginTop: 24 }}>
          <h3>Вимірювання: {selected}</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #eee" }}>Час</th>
                <th style={{ padding: 8, borderBottom: "1px solid #eee" }}>PM2.5</th>
                <th style={{ padding: 8, borderBottom: "1px solid #eee" }}>PM10</th>
                <th style={{ padding: 8, borderBottom: "1px solid #eee" }}>NO₂</th>
              </tr>
            </thead>
            <tbody>
              {measurements.map((m, i) => (
                <tr key={i}>
                  <td style={{ padding: 8 }}>{m.ts}</td>
                  <td style={{ padding: 8, textAlign: "center" }}>{m.pm25}</td>
                  <td style={{ padding: 8, textAlign: "center" }}>{m.pm10}</td>
                  <td style={{ padding: 8, textAlign: "center" }}>{m.no2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
