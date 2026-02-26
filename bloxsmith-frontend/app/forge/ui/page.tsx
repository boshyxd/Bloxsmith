"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StudioToolbar } from "@/components/forge/studio-toolbar";
import { AssetSidebar } from "@/components/forge/asset-sidebar";
import { CanvasViewport } from "@/components/forge/canvas-viewport";
import { PropertiesPanel } from "@/components/forge/properties-panel";
import { ConnectDialog } from "@/components/forge/connect-dialog";
import { StylePicker } from "@/components/forge/style-picker";
import { useStudioConnection } from "@/hooks/use-studio-connection";
import { useStyleLibrary } from "@/hooks/use-style-library";
import { useAuth } from "@/hooks/use-auth";

export default function UIForgePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<"elements" | "layers">(
    "elements",
  );
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);

  const connection = useStudioConnection();
  const { styles } = useStyleLibrary();

  if (loading) return null;

  if (!user) {
    router.replace("/auth");
    return null;
  }

  return (
    <>
      <div className="flex md:hidden items-center justify-center h-screen p-8 text-center text-neutral-600 dark:text-neutral-400 text-sm">
        UI Forge requires a desktop browser. Please switch to a larger screen.
      </div>

      <div className="hidden md:grid h-screen grid-cols-[260px_1fr_280px] grid-rows-[48px_1fr]">
        <StudioToolbar
          styleSlot={
            <StylePicker
              styles={styles}
              selectedStyleId={selectedStyleId}
              onSelect={setSelectedStyleId}
            />
          }
          connectionSlot={<ConnectDialog connection={connection} />}
        />
        <AssetSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          selectedElementId={selectedElementId}
          onSelectElement={setSelectedElementId}
        />
        <CanvasViewport />
        <PropertiesPanel selectedElementId={selectedElementId} />
      </div>
    </>
  );
}
