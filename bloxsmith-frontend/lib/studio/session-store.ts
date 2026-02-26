import crypto from "node:crypto";
import type {
  StudioSession,
  PendingCommand,
  CommandResponse,
} from "@/lib/studio/types";

const SESSION_TTL_MS = 30 * 60 * 1000;
const CONNECTED_THRESHOLD_MS = 10 * 1000;

const sessions = new Map<string, StudioSession>();

function generateCode(): string {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
}

function isExpired(session: StudioSession): boolean {
  return Date.now() - session.lastPing > SESSION_TTL_MS;
}

function getValidSession(code: string): StudioSession | null {
  const session = sessions.get(code);
  if (!session) return null;
  if (isExpired(session)) {
    sessions.delete(code);
    return null;
  }
  return session;
}

export function createSession(): string {
  let code: string;
  do {
    code = generateCode();
  } while (sessions.has(code));

  sessions.set(code, {
    code,
    createdAt: Date.now(),
    lastPing: Date.now(),
    pending: [],
    responses: new Map(),
  });

  return code;
}

export function getSession(code: string): StudioSession | null {
  return getValidSession(code);
}

export function touchSession(code: string): void {
  const session = getValidSession(code);
  if (!session) throw new Error(`Session not found: ${code}`);
  session.lastPing = Date.now();
}

export function addCommand(code: string, command: PendingCommand): void {
  const session = getValidSession(code);
  if (!session) throw new Error(`Session not found: ${code}`);
  session.pending.push(command);
}

export function getPendingCommand(code: string): PendingCommand | null {
  const session = getValidSession(code);
  if (!session) throw new Error(`Session not found: ${code}`);
  return session.pending.shift() ?? null;
}

export function setResponse(
  code: string,
  requestId: string,
  response: CommandResponse
): void {
  const session = getValidSession(code);
  if (!session) throw new Error(`Session not found: ${code}`);
  session.responses.set(requestId, response);
}

export function getResponse(
  code: string,
  requestId: string
): CommandResponse | null {
  const session = getValidSession(code);
  if (!session) throw new Error(`Session not found: ${code}`);
  const response = session.responses.get(requestId);
  if (!response) return null;
  session.responses.delete(requestId);
  return response;
}

export function isConnected(code: string): boolean {
  const session = getValidSession(code);
  if (!session) return false;
  return Date.now() - session.lastPing < CONNECTED_THRESHOLD_MS;
}
