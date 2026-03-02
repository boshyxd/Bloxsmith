import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSession, addCommand, getResponse } from "@/lib/studio/session-store";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const requestId = request.nextUrl.searchParams.get("requestId");
  if (!code || !requestId) {
    return NextResponse.json({ error: "Missing code or requestId" }, { status: 400 });
  }

  const session = await getSession(code);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const response = await getResponse(code, requestId);
  if (!response) {
    return NextResponse.json({ response: null });
  }
  return NextResponse.json({
    response: response.data ?? null,
    error: response.error ?? null,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { code, type, data } = body as {
    code: string;
    type: string;
    data: Record<string, unknown>;
  };

  const session = await getSession(code);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const requestId = crypto.randomUUID();

  await addCommand(code, {
    id: requestId,
    type,
    data,
    createdAt: Date.now(),
  });

  return NextResponse.json({ requestId });
}
