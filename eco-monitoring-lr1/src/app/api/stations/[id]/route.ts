import { NextRequest, NextResponse } from "next/server";
import { getStationById } from "@/lib/store";
import { errorResponse } from "@/lib/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const station = getStationById(params.id);
    if (!station) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ station });
  } catch (e) {
    return errorResponse(e);
  }
}
