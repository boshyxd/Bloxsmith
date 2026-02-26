import { NextResponse } from "next/server";
import { createSession } from "@/lib/studio/session-store";

export async function POST() {
  const code = createSession();
  return NextResponse.json({ code }, { status: 201 });
}
