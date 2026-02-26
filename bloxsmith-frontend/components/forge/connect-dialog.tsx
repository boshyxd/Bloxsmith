"use client";

import type { UseStudioConnectionReturn } from "@/hooks/use-studio-connection";

export function ConnectDialog({
  connection,
}: {
  connection: UseStudioConnectionReturn;
}) {
  if (connection.connected) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-xs text-neutral-600 dark:text-neutral-400">
            Connected
          </span>
        </div>
        <button
          onClick={connection.disconnect}
          className="px-2 h-6 rounded-md border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  if (connection.connecting && connection.code) {
    return (
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Waiting for Studio...
          </span>
        </div>
        <span className="font-mono text-sm font-medium tracking-[0.25em] text-neutral-900 dark:text-neutral-100">
          {connection.code.slice(0, 3)}
          {" "}
          {connection.code.slice(3)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={connection.startSession}
        disabled={connection.connecting}
        className="px-2.5 h-7 rounded-md border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Connect Studio
      </button>
      {connection.error && (
        <span className="text-xs text-red-500">{connection.error}</span>
      )}
    </div>
  );
}
