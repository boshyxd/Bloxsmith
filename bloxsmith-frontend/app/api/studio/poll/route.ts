import { NextRequest, NextResponse } from "next/server";
import {
  getSession,
  touchSession,
  getPendingCommand,
} from "@/lib/studio/session-store";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const session = getSession(code);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  touchSession(code);
  const command = getPendingCommand(code);

  return NextResponse.json({ command });
}
