import { NextResponse } from "next/server";
import { getStations } from "@/lib/store";
import { errorResponse } from "@/lib/errors";

export async function GET() {
  try {
    const stations = getStations();
    return NextResponse.json({ stations });
  } catch (e) {
    return errorResponse(e);
  }
}
