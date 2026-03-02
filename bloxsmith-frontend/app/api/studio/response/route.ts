import { NextRequest, NextResponse } from "next/server";
import { getSession, setResponse } from "@/lib/studio/session-store";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { code, requestId, data, error } = body as {
    code: string;
    requestId: string;
    data?: unknown;
    error?: string;
  };

  const session = await getSession(code);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  await setResponse(code, requestId, { requestId, data, error });

  return NextResponse.json({ success: true });
}
