"use client";
import { useState } from "react";

// Пошук станцій за назвою. Значення пошуку відображається на сторінці так,
// як його повернув сервер у полі query.
export default function SearchForm() {
  const [q, setQ] = useState("");
  const [result, setResult] = useState<any>(null);

  async function run() {
    const r = await fetch(`/api/stations/search?name=${encodeURIComponent(q)}`);
    setResult(await r.json());
  }

  return (
    <section style={{ marginTop: 16 }}>
      <div style={{ display: "flex", gap: 8, maxWidth: 480 }}>
        <input value={q} onChange={e => setQ(e.target.value)}
          placeholder="Пошук станції за назвою" style={{ padding: 8, flex: 1 }} />
        <button onClick={run} style={{ padding: "8px 14px", cursor: "pointer" }}>Пошук</button>
      </div>
      {result && (
        <p style={{ marginTop: 8, color: "#5a6b63" }}>
          Знайдено за запитом «<span dangerouslySetInnerHTML={{ __html: String(result.query?.name ?? "") }} />»:
          {" "}{result.stations?.length ?? 0}
        </p>
      )}
    </section>
  );
}
