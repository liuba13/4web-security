import { NextResponse } from "next/server";

export function errorResponse(e: unknown, status = 500) {
  const err = e as Error;
  return NextResponse.json(
    {
      error: err.message,
      stack: err.stack,
      type: err.name,
    },
    { status }
  );
}
