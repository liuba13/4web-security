import { API_BASE } from "../../../lib/api";

// Проксі входу: приймає логін/пароль, звертається до API, переносить cookie
// з відповіді API у відповідь браузеру.
export async function POST(req: Request) {
  const body = await req.text();
  const upstream = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
  const res = new Response(await upstream.text(), {
    status: upstream.status,
    headers: { "content-type": "application/json" },
  });
  // Кожну cookie переносимо окремим заголовком (access і refresh).
  for (const c of upstream.headers.getSetCookie()) res.headers.append("set-cookie", c);
  return res;
}
