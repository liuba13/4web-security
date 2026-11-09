import { cookies } from "next/headers";
import { API_BASE } from "../../../../lib/api";

// Проксі пошуку станцій: переносить сесійну cookie та рядок запиту до API.
export async function GET(req: Request) {
  const token = (await cookies()).get("accessToken")?.value || "";
  const qs = new URL(req.url).search;
  const upstream = await fetch(`${API_BASE}/api/stations/search${qs}`, {
    headers: { cookie: `accessToken=${token}` },
    cache: "no-store",
  });
  return new Response(await upstream.text(), {
    status: upstream.status,
    headers: { "content-type": "application/json" },
  });
}
