"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      router.push("/dashboard");
    } else {
      setError("Невірний логін або пароль");
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: "80px auto", background: "#fff", padding: 24, borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
      <h2 style={{ marginTop: 0 }}>ЕкоМоніторинг — вхід</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input
          placeholder="Логін"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: 8 }}
        />
        <input
          placeholder="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 8 }}
        />
        <button onClick={submit} style={{ padding: 10, background: "#2563eb", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
          Увійти
        </button>
        {error && <p style={{ color: "#dc2626", margin: 0 }}>{error}</p>}
      </div>
    </div>
  );
}
