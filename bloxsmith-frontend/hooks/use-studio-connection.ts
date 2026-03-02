"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface UseStudioConnectionReturn {
  code: string | null;
  connected: boolean;
  connecting: boolean;
  error: string | null;
  startSession: () => Promise<void>;
  disconnect: () => void;
  sendCommand: (type: string, data?: Record<string, unknown>) => Promise<unknown>;
}

const STATUS_POLL_MS = 2000;
const RESPONSE_POLL_MS = 500;
const COMMAND_TIMEOUT_MS = 60000;

export function useStudioConnection(): UseStudioConnectionReturn {
  const [code, setCode] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const statusIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const responseIntervalsRef = useRef<Set<ReturnType<typeof setInterval>>>(new Set());

  const clearAllIntervals = useCallback(() => {
    if (statusIntervalRef.current) {
      clearInterval(statusIntervalRef.current);
      statusIntervalRef.current = null;
    }
    for (const id of responseIntervalsRef.current) {
      clearInterval(id);
    }
    responseIntervalsRef.current.clear();
  }, []);

  const pollStatus = useCallback(
    (sessionCode: string) => {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
      }
      statusIntervalRef.current = setInterval(async () => {
        const res = await fetch(`/api/studio/status?code=${sessionCode}`);
        if (!res.ok) return;
        const body = await res.json();
        if (body.connected) {
          setConnected(true);
          setConnecting(false);
        }
      }, STATUS_POLL_MS);
    },
    [],
  );

  const startSession = useCallback(async () => {
    if (connecting || code) return;
    setError(null);
    setConnecting(true);
    try {
      const res = await fetch("/api/studio/session", { method: "POST" });
      if (!res.ok) throw new Error("Failed to create session");
      const body = await res.json();
      setCode(body.code);
      pollStatus(body.code);
    } catch (e) {
      setConnecting(false);
      setError(e instanceof Error ? e.message : "Connection failed");
    }
  }, [connecting, code, pollStatus]);

  const disconnect = useCallback(() => {
    clearAllIntervals();
    setCode(null);
    setConnected(false);
    setConnecting(false);
    setError(null);
  }, [clearAllIntervals]);

  const sendCommand = useCallback(
    async (type: string, data?: Record<string, unknown>): Promise<unknown> => {
      if (!code || !connected) throw new Error("Not connected");

      const sendRes = await fetch("/api/studio/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, type, data }),
      });
      if (!sendRes.ok) throw new Error("Failed to send command");
      const { requestId } = await sendRes.json();

      const deadline = Date.now() + COMMAND_TIMEOUT_MS;

      return new Promise((resolve, reject) => {
        const intervalId = setInterval(async () => {
          if (Date.now() > deadline) {
            clearInterval(intervalId);
            responseIntervalsRef.current.delete(intervalId);
            reject(new Error("Command timed out (60s). The plugin may not have received the command, or the code was too large to execute."));
            return;
          }

          let checkRes: Response;
          try {
            checkRes = await fetch(
              `/api/studio/command?code=${code}&requestId=${requestId}`,
            );
          } catch {
            return;
          }

          if (!checkRes.ok) {
            const errBody = await checkRes.json().catch(() => ({ error: "Unknown error" }));
            clearInterval(intervalId);
            responseIntervalsRef.current.delete(intervalId);
            reject(new Error(errBody.error ?? `Server error (${checkRes.status})`));
            return;
          }

          const body = await checkRes.json();

          if (body.error) {
            clearInterval(intervalId);
            responseIntervalsRef.current.delete(intervalId);
            reject(new Error(body.error));
            return;
          }

          if (body.response !== null && body.response !== undefined) {
            clearInterval(intervalId);
            responseIntervalsRef.current.delete(intervalId);
            resolve(body.response);
          }
        }, RESPONSE_POLL_MS);
        responseIntervalsRef.current.add(intervalId);
      });
    },
    [code, connected],
  );

  useEffect(() => {
    return () => {
      clearAllIntervals();
    };
  }, [clearAllIntervals]);

  return { code, connected, connecting, error, startSession, disconnect, sendCommand };
}
