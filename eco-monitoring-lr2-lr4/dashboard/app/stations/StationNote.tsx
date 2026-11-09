"use client";
import { useState } from "react";

// Форма збереження примітки оператора. Запит змінює стан на сервері (PUT).
export default function StationNote({ stationId }: { stationId: string }) {
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");

  async function save() {
    setStatus("Збереження…");
    const r = await fetch(`/api/stations/${stationId}/note`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ note }),
    });
    setStatus(r.ok ? "Збережено. Оновіть сторінку." : "Помилка збереження.");
  }

  return (
    <div style={{ marginTop: 10, display: "grid", gap: 6, maxWidth: 480 }}>
      <input value={note} onChange={e => setNote(e.target.value)}
        placeholder="Нова примітка (підтримується форматування)"
        style={{ padding: 8 }} />
      <div>
        <button onClick={save} style={{ padding: "6px 12px", cursor: "pointer" }}>Зберегти примітку</button>
        {status && <span style={{ marginLeft: 10, color: "#5a6b63" }}>{status}</span>}
      </div>
    </div>
  );
}
