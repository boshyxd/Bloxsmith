"use client";

import { useState } from "react";
import type { UseStudioConnectionReturn } from "@/hooks/use-studio-connection";

function WaitingState({ code, onCancel }: { code: string; onCancel: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-center gap-1.5">
        <div className="h-2 w-2 rounded-full bg-amber-500" />
        <span className="text-xs text-muted-foreground">
          Waiting for Studio
        </span>
      </div>
      <button
        onClick={handleCopy}
        title="Copy code"
        className="font-mono text-sm font-medium tracking-[0.25em] text-foreground px-2 py-0.5 rounded-none hover:bg-accent transition-colors cursor-pointer"
      >
        {copied ? "Copied!" : `${code.slice(0, 3)} ${code.slice(3)}`}
      </button>
      <button
        onClick={onCancel}
        className="px-2 h-6 rounded-none border border-border text-xs text-muted-foreground hover:bg-accent transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}

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
          <span className="text-xs text-muted-foreground">
            Connected
          </span>
        </div>
        <button
          onClick={connection.disconnect}
          className="px-2 h-6 rounded-none border border-border text-xs text-muted-foreground hover:bg-accent transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  if (connection.connecting && connection.code) {
    return <WaitingState code={connection.code} onCancel={connection.disconnect} />;
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={connection.startSession}
        disabled={connection.connecting}
        className="px-2.5 h-7 rounded-none border border-border text-xs text-secondary-foreground hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Connect Studio
      </button>
      {connection.error && (
        <span className="text-xs text-red-500">{connection.error}</span>
      )}
    </div>
  );
}
