import { cookies } from "next/headers";
import { API_BASE } from "../../../../../lib/api";

// Проксі імпорту: переносить сесійну cookie до API.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = (await cookies()).get("accessToken")?.value || "";
  const body = await req.text();
  const upstream = await fetch(`${API_BASE}/api/stations/${id}/import`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie: `accessToken=${token}` },
    body,
  });
  return new Response(await upstream.text(), {
    status: upstream.status,
    headers: { "content-type": "application/json" },
  });
}
