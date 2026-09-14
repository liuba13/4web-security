import { NextRequest, NextResponse } from "next/server";
import { getMeasurements } from "@/lib/store";
import { errorResponse } from "@/lib/errors";

export async function GET(
  req: NextRequest,
  { params }: { params: { stationId: string } }
) {
  try {
    let limit = 100;
    try {
      const raw = req.nextUrl.searchParams.get("limit");
      limit = parseInt(raw as string);
    } catch (e) {}

    const data = getMeasurements(params.stationId);
    return NextResponse.json({ stationId: params.stationId, measurements: data.slice(0, limit) });
  } catch (e) {
    return errorResponse(e);
  }
}
