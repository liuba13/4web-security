import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_BASE } from "../../lib/api";
import StationNote from "./StationNote";
import SearchForm from "./SearchForm";

type Station = {
  stationId: string;
  name: string;
  city: string;
  pm25AlertThreshold: number;
  note: string;
  noteUpdatedBy: string;
};

async function loadStations(): Promise<Station[]> {
  const token = (await cookies()).get("accessToken")?.value;
  if (!token) redirect("/");
  const r = await fetch(`${API_BASE}/api/stations`, {
    headers: { cookie: `accessToken=${token}` },
    cache: "no-store",
  });
  if (r.status === 401) redirect("/");
  const data = await r.json();
  return data.stations as Station[];
}

export default async function StationsPage() {
  const stations = await loadStations();
  return (
    <div>
      <h1 style={{ fontSize: 24 }}>Станції</h1>

      <SearchForm />

      <div style={{ display: "grid", gap: 16, marginTop: 24 }}>
        {stations.map(s => (
          <section key={s.stationId}
            style={{ border: "1px solid #d6ddd8", borderRadius: 8, padding: 16, background: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>{s.stationId} — {s.name}</strong>
              <span style={{ color: "#5a6b63" }}>{s.city}</span>
            </div>
            <p style={{ margin: "6px 0", color: "#5a6b63" }}>Поріг PM2.5: {s.pm25AlertThreshold}</p>

            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 13, color: "#5a6b63", marginBottom: 4 }}>Примітка оператора:</div>
              <div
                style={{ padding: "8px 10px", background: "#f2f6f4", borderRadius: 6, minHeight: 20 }}
                dangerouslySetInnerHTML={{ __html: s.note || "<span style='color:#9aa'>немає</span>" }}
              />
            </div>

            <StationNote stationId={s.stationId} />
          </section>
        ))}
      </div>
    </div>
  );
}
