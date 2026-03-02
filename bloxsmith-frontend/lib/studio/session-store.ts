import crypto from "node:crypto";
import { getSupabase } from "@/lib/supabase";
import type { PendingCommand, CommandResponse } from "@/lib/studio/types";

const SESSION_TTL_MS = 30 * 60 * 1000;
const CONNECTED_THRESHOLD_MS = 10 * 1000;

function generateCode(): string {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
}

export async function createSession(): Promise<string> {
  const db = getSupabase();

  // Clean up expired sessions
  await db
    .from("studio_sessions")
    .delete()
    .lt("created_at", new Date(Date.now() - SESSION_TTL_MS).toISOString());

  let code: string;
  let collision = true;
  while (collision) {
    code = generateCode();
    const { data } = await db
      .from("studio_sessions")
      .select("code")
      .eq("code", code)
      .maybeSingle();
    collision = data !== null;
  }

  const { error } = await db
    .from("studio_sessions")
    .insert({ code: code!, last_ping: null });

  if (error) throw new Error(`Failed to create session: ${error.message}`);
  return code!;
}

export async function getSession(
  code: string,
): Promise<{ code: string; created_at: string; last_ping: string | null } | null> {
  const { data } = await getSupabase()
    .from("studio_sessions")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (!data) return null;

  const age = Date.now() - new Date(data.created_at).getTime();
  if (age > SESSION_TTL_MS) {
    await getSupabase().from("studio_sessions").delete().eq("code", code);
    return null;
  }

  return data;
}

export async function touchSession(code: string): Promise<void> {
  const { error } = await getSupabase()
    .from("studio_sessions")
    .update({ last_ping: new Date().toISOString() })
    .eq("code", code);

  if (error) throw new Error(`Failed to touch session: ${error.message}`);
}

export async function addCommand(
  code: string,
  command: PendingCommand,
): Promise<void> {
  const { error } = await getSupabase().from("studio_commands").insert({
    request_id: command.id,
    session_code: code,
    type: command.type,
    data: command.data ?? {},
  });

  if (error) throw new Error(`Failed to add command: ${error.message}`);
}

export async function getPendingCommand(
  code: string,
): Promise<PendingCommand | null> {
  const db = getSupabase();

  const { data, error } = await db
    .from("studio_commands")
    .select("*")
    .eq("session_code", code)
    .eq("claimed", false)
    .is("response", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  await db
    .from("studio_commands")
    .update({ claimed: true })
    .eq("request_id", data.request_id);

  return {
    id: data.request_id,
    type: data.type,
    data: data.data as Record<string, unknown>,
    createdAt: new Date(data.created_at).getTime(),
  };
}

export async function setResponse(
  code: string,
  requestId: string,
  response: CommandResponse,
): Promise<void> {
  const { error } = await getSupabase()
    .from("studio_commands")
    .update({ response })
    .eq("request_id", requestId)
    .eq("session_code", code);

  if (error) throw new Error(`Failed to set response: ${error.message}`);
}

export async function getResponse(
  code: string,
  requestId: string,
): Promise<CommandResponse | null> {
  const { data } = await getSupabase()
    .from("studio_commands")
    .select("response")
    .eq("request_id", requestId)
    .eq("session_code", code)
    .not("response", "is", null)
    .maybeSingle();

  if (!data?.response) return null;
  return data.response as CommandResponse;
}

export async function isConnected(code: string): Promise<boolean> {
  const session = await getSession(code);
  if (!session || !session.last_ping) return false;
  return Date.now() - new Date(session.last_ping).getTime() < CONNECTED_THRESHOLD_MS;
}
