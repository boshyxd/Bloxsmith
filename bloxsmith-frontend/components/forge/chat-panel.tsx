"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { getSupabase } from "@/lib/supabase";
import type { SerializedInstance } from "@/lib/studio/types";
import { MODELS, DEFAULT_MODEL, COST_PER_FRAME_CENTS, TOKEN_MARKUP } from "@/lib/billing";
import { parseLuauToTrees } from "@/lib/studio/luau-to-tree";
import { serializeToRbxmx } from "@/lib/studio/rbxmx-serializer";
import { condenseTrees, estimateTokens } from "@/lib/studio/styles/registry";

interface Message {
  role: "user" | "assistant";
  content: string;
}

type SendStatus = "idle" | "generating" | "sending" | "sent" | "error";

interface DisplayMessage {
  role: "user" | "assistant";
  text: string;
  sendStatus: SendStatus;
  sendError?: string;
  elapsedMs?: number;
  startedAt?: number;
  costCents?: number;
}

const CODE_BLOCK_RE = /```(?:\w*)\n([\s\S]*?)```/g;
const PARTIAL_CODE_BLOCK_RE = /```(?:\w*)\n([\s\S]+)$/;

function extractCode(content: string): string | null {
  CODE_BLOCK_RE.lastIndex = 0;
  const match = CODE_BLOCK_RE.exec(content);
  if (match) return match[1];

  const partial = PARTIAL_CODE_BLOCK_RE.exec(content);
  if (partial) return partial[1];

  return null;
}

function triggerDownload(filename: string, content: string) {
  const blob = new Blob([content], { type: "application/xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}


function formatElapsed(ms: number): string {
  const seconds = ms / 1000;
  return seconds < 10 ? `${seconds.toFixed(1)}s` : `${Math.round(seconds)}s`;
}

function StatusPill({ status, error, startedAt, elapsedMs, studioConnected, costCents }: { status: SendStatus; error?: string; startedAt?: number; elapsedMs?: number; studioConnected: boolean; costCents?: number }) {
  const [liveMs, setLiveMs] = useState(0);

  useEffect(() => {
    if (status !== "generating" || !startedAt) return;
    const interval = setInterval(() => setLiveMs(Date.now() - startedAt), 100);
    return () => clearInterval(interval);
  }, [status, startedAt]);

  if (status === "idle") return null;

  const labels: Record<Exclude<SendStatus, "idle">, string> = {
    generating: "Generating",
    sending: studioConnected ? "Sending to Studio" : "Preparing download",
    sent: studioConnected ? "Sent to Studio" : "Downloaded .rbxmx",
    error: error ?? "Failed",
  };

  const isActive = status === "generating" || status === "sending";
  const isError = status === "error";
  const displayMs = elapsedMs ?? (status === "generating" ? liveMs : 0);

  return (
    <span className={`text-xs ${isError ? "text-red-500" : "text-muted-foreground"}`}>
      {isActive && (
        <span className="inline-flex gap-0.5 mr-1.5 align-middle">
          <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground animate-[pulse_1.4s_ease-in-out_infinite]" />
          <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground animate-[pulse_1.4s_ease-in-out_0.2s_infinite]" />
          <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground animate-[pulse_1.4s_ease-in-out_0.4s_infinite]" />
        </span>
      )}
      {labels[status]}
      {displayMs > 0 && (
        <span className="ml-1.5 tabular-nums">{formatElapsed(displayMs)}</span>
      )}
      {status === "sent" && costCents !== undefined && (
        <span className="ml-1.5 tabular-nums">
          {costCents === 0 ? "Free" : `$${(costCents / 100).toFixed(2)}`}
        </span>
      )}
    </span>
  );
}

export function ChatPanel({
  trees,
  studioConnected,
  onSendToStudio,
  balanceCents,
  freeGensRemaining,
  onGenerationComplete,
  styleId,
}: {
  trees: SerializedInstance[];
  studioConnected: boolean;
  onSendToStudio: (code: string) => Promise<void>;
  balanceCents: number;
  freeGensRemaining: number;
  onGenerationComplete: () => Promise<void>;
  styleId: string;
}) {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pendingSendRef = useRef(false);
  const model = MODELS[selectedModel];
  const outOfCredits = freeGensRemaining <= 0 && balanceCents < 1;
  const isAdaptive = styleId === "adaptive";

  const adaptiveContext = useMemo(() => {
    if (!isAdaptive || trees.length === 0) return { tokens: 0, costCents: 0 };
    const condensed = condenseTrees(trees);
    const tokens = estimateTokens(JSON.stringify(condensed));
    const costCents = Math.ceil((tokens / 1_000_000) * model.inputCostPerMillionTokens * 100);
    return { tokens, costCents };
  }, [isAdaptive, trees, model.inputCostPerMillionTokens]);

  const [modelDropupOpen, setModelDropupOpen] = useState(false);
  const modelDropupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!modelDropupOpen) return;
    function handleClick(e: MouseEvent) {
      if (modelDropupRef.current && !modelDropupRef.current.contains(e.target as Node)) {
        setModelDropupOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [modelDropupOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || streaming) return;
    if (outOfCredits) return;

    const { data: { session } } = await getSupabase().auth.getSession();
    if (!session) return;

    const startedAt = Date.now();
    const userDisplay: DisplayMessage = { role: "user", text, sendStatus: "idle" };
    const assistantDisplay: DisplayMessage = { role: "assistant", text: "", sendStatus: "generating", startedAt };
    const newMessages = [...messages, userDisplay, assistantDisplay];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);
    pendingSendRef.current = false;

    const apiMessages: Message[] = newMessages
      .filter((m): m is DisplayMessage & { role: "user" | "assistant" } => true)
      .map((m) => ({ role: m.role, content: m.text }))
      .slice(0, -1);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ messages: apiMessages, trees, model: selectedModel, styleId }),
      });

      if (!res.ok) {
        const err = await res.json();
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", text: `Error: ${err.error}`, sendStatus: "idle" };
          return updated;
        });
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullContent += delta;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  text: fullContent,
                };
                return updated;
              });
            }
          } catch {
            // skip malformed chunks
          }
        }
      }

      const balanceSnapshot = balanceCents;
      const isFree = freeGensRemaining > 0;
      await onGenerationComplete();

      let costCents: number | undefined;
      if (isFree) {
        costCents = 0;
      } else {
        const { data: { session: freshSession } } = await getSupabase().auth.getSession();
        if (freshSession) {
          const balanceRes = await fetch("/api/billing/balance", {
            headers: { Authorization: `Bearer ${freshSession.access_token}` },
          });
          if (balanceRes.ok) {
            const { balanceCents: newBalance } = await balanceRes.json();
            costCents = Math.max(0, balanceSnapshot - newBalance);
          }
        }
      }

      const code = extractCode(fullContent);
      const elapsedMs = Date.now() - startedAt;

      if (!code) {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            text: fullContent || "No response received",
            sendStatus: fullContent ? "idle" : "error",
            sendError: fullContent ? undefined : "Empty response from AI",
            elapsedMs,
            costCents,
          };
          return updated;
        });
      } else if (studioConnected) {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", text: fullContent, sendStatus: "sending", elapsedMs };
          return updated;
        });

        try {
          await onSendToStudio(code);
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", text: fullContent, sendStatus: "sent", elapsedMs, costCents };
            return updated;
          });
        } catch (e) {
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              text: fullContent,
              sendStatus: "error",
              sendError: e instanceof Error ? e.message : "Send failed",
              elapsedMs,
            };
            return updated;
          });
        }
      } else {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", text: fullContent, sendStatus: "sending", elapsedMs };
          return updated;
        });

        try {
          const parsedTrees = parseLuauToTrees(code);
          if (parsedTrees.length === 0) {
            throw new Error("Could not parse UI from generated code");
          }
          const xml = serializeToRbxmx(parsedTrees);
          const rootName = parsedTrees[0].name.replace(/\s+/g, "-").toLowerCase();
          triggerDownload(`${rootName}.rbxmx`, xml);
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", text: fullContent, sendStatus: "sent", elapsedMs, costCents };
            return updated;
          });
        } catch (e) {
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              text: fullContent,
              sendStatus: "error",
              sendError: e instanceof Error ? e.message : "Export failed",
              elapsedMs,
            };
            return updated;
          });
        }
      }
    } catch (e) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          text: `Error: ${e instanceof Error ? e.message : "Request failed"}`,
          sendStatus: "idle",
        };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="relative flex flex-col bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background">
        <span className="text-xs font-medium text-foreground">Agent</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-2">
            {outOfCredits ? (
              <>
                <span className="text-sm text-muted-foreground">No credits remaining.</span>
                <a href="/profile" className="text-xs text-foreground hover:underline">
                  Add credits
                </a>
              </>
            ) : (
              <>
                <span className="text-sm text-muted-foreground">Describe the UI you want to build</span>
                {studioConnected && trees.length > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    {trees.length} ScreenGUI{trees.length !== 1 ? "s" : ""} loaded from Studio
                  </span>
                )}
                {!studioConnected && (
                  <span className="text-[10px] text-muted-foreground">
                    No Studio connected — UI will download as .rbxmx
                  </span>
                )}
              </>
            )}
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-3 py-2 rounded-none text-sm ${
                msg.role === "user"
                  ? "bg-foreground text-background whitespace-pre-wrap"
                  : "bg-secondary text-foreground border border-border"
              }`}
            >
              {msg.text && (
                <pre className="whitespace-pre-wrap break-all text-xs max-h-[300px] overflow-y-auto font-mono">{msg.text}</pre>
              )}
              {!msg.text && msg.sendStatus === "idle" && streaming && i === messages.length - 1 && (
                <span className="inline-block w-1.5 h-4 bg-muted-foreground animate-pulse" />
              )}
              <div className="flex items-center gap-2 mt-1">
                <StatusPill status={msg.sendStatus} error={msg.sendError} startedAt={msg.startedAt} elapsedMs={msg.elapsedMs} studioConnected={studioConnected} costCents={msg.costCents} />
                {msg.role === "assistant" && msg.text && (
                  <button
                    onClick={() => navigator.clipboard.writeText(msg.text)}
                    className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Copy
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-border bg-background space-y-2">
        {outOfCredits ? (
          <a
            href="/profile"
            className="block w-full px-4 py-3 text-center text-sm font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors"
          >
            Add credits to continue
          </a>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div ref={modelDropupRef} className="relative">
                <button
                  onClick={() => setModelDropupOpen(!modelDropupOpen)}
                  disabled={streaming}
                  className="flex items-center gap-2 px-2.5 h-7 border border-border text-xs hover:bg-accent transition-colors disabled:opacity-50"
                >
                  <span className="font-medium text-foreground">{model.name}</span>
                  <span className="text-muted-foreground">{model.description}</span>
                  <svg className={`w-3 h-3 text-muted-foreground transition-transform ${modelDropupOpen ? "rotate-180" : ""}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 7l3-3 3 3" />
                  </svg>
                </button>

                {modelDropupOpen && (
                  <div className="absolute bottom-full left-0 mb-1 w-64 border border-border bg-background z-50">
                    <div className="text-[10px] font-medium text-muted-foreground tracking-wider px-3 pt-2.5 pb-1.5">
                      MODEL
                    </div>
                    {Object.values(MODELS).map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setSelectedModel(m.id);
                          setModelDropupOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 transition-colors ${
                          selectedModel === m.id ? "bg-accent" : "hover:bg-accent/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-foreground">{m.name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {isAdaptive
                              ? `in $${(m.inputCostPerMillionTokens * TOKEN_MARKUP).toFixed(2)} · out $${(m.outputCostPerMillionTokens * TOKEN_MARKUP).toFixed(2)} /M`
                              : `$${(COST_PER_FRAME_CENTS[m.id] / 100).toFixed(2)}/frame`}
                          </span>
                        </div>
                        <span className="block text-[10px] text-muted-foreground">{m.description}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isAdaptive && adaptiveContext.tokens > 0 && (
                <span className="text-[10px] text-muted-foreground ml-auto tabular-nums">
                  ~{Math.round(adaptiveContext.tokens / 1000)}k tokens · ~${(adaptiveContext.costCents / 100).toFixed(2)} context
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe the UI you want..."
                disabled={streaming}
                rows={1}
                className="flex-1 px-3 py-2 rounded-none border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-forge resize-none disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={streaming || !input.trim()}
                className="px-3 py-2 rounded-none bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-30"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
