// Допоміжні локальні сервіси проєкту. Запуск в окремому терміналі: npm run mock
//
// Обидва сервери слухають лише 127.0.0.1.
//
//   127.0.0.1:4100 — зовнішнє джерело екоданих.
//                    GET /readings.json → масив вимірювань у форматі імпорту.
//                    GET /redirect?to=... → переадресація (302) на вказану адресу.
//
//   127.0.0.1:4200 — внутрішній сервіс конфігурації мережі станцій.
//                    Призначений лише для внутрішніх сервісів. Значення ключів фіктивні.
import { createServer } from "node:http";

function json(res, status, body) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

const publicSource = createServer((req, res) => {
  const url = new URL(req.url, "http://127.0.0.1:4100");
  if (url.pathname === "/readings.json") {
    const now = Date.now();
    return json(res, 200, [0, 1, 2].map(i => ({
      pm25: 20 + i, pm10: 33 + i, no2: 17 + i,
      ts: new Date(now - i * 3600 * 1000).toISOString(),
    })));
  }
  if (url.pathname === "/redirect") {
    res.writeHead(302, { location: url.searchParams.get("to") || "/" });
    return res.end();
  }
  json(res, 404, { error: "not_found" });
});

const internalService = createServer((req, res) => {
  json(res, 200, {
    service: "ecomonitor-internal-config",
    internal_api_key: "FAKE-internal-key-for-lab-only",
    db_admin_url: "sqlite://internal/ecomonitoring-admin",
  });
});

publicSource.listen(4100, "127.0.0.1", () =>
  console.log("[mock] джерело екоданих:   http://127.0.0.1:4100/readings.json"));
internalService.listen(4200, "127.0.0.1", () =>
  console.log("[mock] внутрішній сервіс:  http://127.0.0.1:4200/"));
