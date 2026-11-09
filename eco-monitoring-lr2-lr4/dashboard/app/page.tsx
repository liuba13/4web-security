"use client";
import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("operator_kyiv");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function signIn() {
    setError("");
    const r = await fetch("/api/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!r.ok) { setError("Не вдалося увійти. Перевірте логін і пароль."); return; }
    window.location.href = "/stations";
  }

  return (
    <div>
      <h1 style={{ fontSize: 28, marginBottom: 4 }}>ЕкоМоніторинг</h1>
      <p style={{ color: "#5a6b63", marginTop: 0 }}>Моніторинг якості повітря — панель оператора</p>
      <div style={{ display: "grid", gap: 10, maxWidth: 320, marginTop: 24 }}>
        <label>Логін
          <input value={username} onChange={e => setUsername(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 4 }} />
        </label>
        <label>Пароль
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && signIn()}
            style={{ width: "100%", padding: 8, marginTop: 4 }} />
        </label>
        <button onClick={signIn} style={{ padding: "10px 16px", cursor: "pointer" }}>Увійти</button>
        {error && <p style={{ color: "#b4231f" }}>{error}</p>}
      </div>
    </div>
  );
}
