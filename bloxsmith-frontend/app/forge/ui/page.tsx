"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { StudioToolbar } from "@/components/forge/studio-toolbar";
import { AssetSidebar } from "@/components/forge/asset-sidebar";
import { ChatPanel } from "@/components/forge/chat-panel";
import { PropertiesPanel } from "@/components/forge/properties-panel";
import { ConnectDialog } from "@/components/forge/connect-dialog";
import { StylePicker } from "@/components/forge/style-picker";
import { useStudioConnection } from "@/hooks/use-studio-connection";
import { useAuth } from "@/hooks/use-auth";
import { useCredits } from "@/hooks/use-credits";
import { DEFAULT_STYLE_ID } from "@/lib/studio/styles/presets";
import type { SerializedInstance } from "@/lib/studio/types";

const SYNC_INTERVAL_MS = 3000;

export default function UIForgePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedStyleId, setSelectedStyleId] = useState<string>(DEFAULT_STYLE_ID);
  const [trees, setTrees] = useState<SerializedInstance[]>([]);
  const [hiddenTreeNames, setHiddenTreeNames] = useState<Set<string>>(new Set());

  const visibleTrees = useMemo(
    () => trees.filter((t) => !hiddenTreeNames.has(t.name)),
    [trees, hiddenTreeNames],
  );

  const toggleTreeVisibility = useCallback((name: string) => {
    setHiddenTreeNames((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }, []);

  const connection = useStudioConnection();
  const credits = useCredits();
  const syncingRef = useRef(false);

  useEffect(() => {
    if (selectedStyleId === "adaptive" && (!connection.connected || visibleTrees.length === 0)) {
      setSelectedStyleId(DEFAULT_STYLE_ID);
    }
  }, [connection.connected, visibleTrees.length, selectedStyleId]);

  const sendToStudio = useCallback(async (code: string) => {
    await connection.sendCommand("execute_luau", { code });
  }, [connection.sendCommand]);

  const syncFromStudio = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    try {
      const guiNames = (await connection.sendCommand("list_screenguis")) as string[];
      if (!guiNames || guiNames.length === 0) {
        setTrees([]);
        return;
      }

      const extracted: SerializedInstance[] = [];
      for (const name of guiNames) {
        const tree = (await connection.sendCommand("extract_ui", {
          path: `game.StarterGui.${name}`,
        })) as SerializedInstance;
        if (tree) extracted.push(tree);
      }
      setTrees(extracted);
    } catch {
      // Connection lost or command failed — stop syncing silently
    } finally {
      syncingRef.current = false;
    }
  }, [connection.sendCommand]);

  useEffect(() => {
    if (!connection.connected) {
      setTrees([]);
      syncingRef.current = false;
      return;
    }

    syncFromStudio();
    const interval = setInterval(syncFromStudio, SYNC_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [connection.connected, syncFromStudio]);

  if (loading) return null;

  if (!user) {
    router.replace("/auth");
    return null;
  }

  return (
    <>
      <div className="flex md:hidden items-center justify-center h-screen p-8 text-center text-muted-foreground text-sm">
        UI Forge requires a desktop browser. Please switch to a larger screen.
      </div>

      <div className="hidden md:grid h-screen grid-cols-[260px_1fr_280px] grid-rows-[48px_1fr]">
        <StudioToolbar
          styleSlot={
            <StylePicker
              selectedStyleId={selectedStyleId}
              onSelect={setSelectedStyleId}
              studioConnected={connection.connected}
              hasUIs={visibleTrees.length > 0}
            />
          }
          creditsSlot={
            <a
              href="/profile"
              className="flex items-center gap-2 px-2.5 h-7 rounded-none border border-border text-xs hover:bg-accent transition-colors"
            >
              {credits.freeGensRemaining > 0 ? (
                <span className="text-foreground font-medium">
                  {credits.freeGensRemaining} free gen{credits.freeGensRemaining !== 1 ? "s" : ""}
                </span>
              ) : (
                <span className="text-foreground font-medium">
                  ${(credits.balanceCents / 100).toFixed(2)}
                </span>
              )}
            </a>
          }
          connectionSlot={<ConnectDialog connection={connection} />}
        />
        <AssetSidebar
          selectedElementId={selectedElementId}
          onSelectElement={setSelectedElementId}
          trees={trees}
          hiddenTreeNames={hiddenTreeNames}
          onToggleTreeVisibility={toggleTreeVisibility}
        />
        <ChatPanel
          trees={visibleTrees}
          studioConnected={connection.connected}
          onSendToStudio={sendToStudio}
          balanceCents={credits.balanceCents}
          freeGensRemaining={credits.freeGensRemaining}
          onGenerationComplete={credits.refetch}
          styleId={selectedStyleId}
        />
        <PropertiesPanel trees={trees} selectedElementId={selectedElementId} />
      </div>
    </>
  );
}
