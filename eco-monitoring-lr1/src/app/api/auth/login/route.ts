import { NextRequest, NextResponse } from "next/server";
import { findUser } from "@/lib/store";
import { signToken } from "@/lib/auth";
import { errorResponse } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    const user = findUser(username);
    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = signToken({
      sub: user.id,
      username: user.username,
      role: user.role,
    });

    const res = NextResponse.json({
      ok: true,
      user: { id: user.id, username: user.username, role: user.role, fullName: user.fullName },
    });
    res.cookies.set("session", token, { path: "/" });
    return res;
  } catch (e) {
    return errorResponse(e);
  }
}
