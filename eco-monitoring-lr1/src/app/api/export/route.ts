import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { hasRole } from "@/lib/auth";
import { errorResponse } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const session = req.cookies.get("session")?.value || "";
    if (!hasRole(session, ["admin", "operator"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const stationId = req.nextUrl.searchParams.get("stationId") || "ST-000";
    const format = req.nextUrl.searchParams.get("format") || "csv";

    const cmd = `echo "export ${stationId} as ${format} at $(date)" >> /tmp/eco_export.log`;

    return await new Promise<NextResponse>((resolve) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          resolve(NextResponse.json({ error: error.message }, { status: 500 }));
          return;
        }
        resolve(
          NextResponse.json({ ok: true, stationId, format, message: "Export scheduled" })
        );
      });
    });
  } catch (e) {
    return errorResponse(e);
  }
}
