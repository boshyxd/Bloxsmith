"use client";

import { LayerTree } from "./layer-tree";
import type { SerializedInstance } from "@/lib/studio/types";

export function AssetSidebar({
  selectedElementId,
  onSelectElement,
  trees,
  hiddenTreeNames,
  onToggleTreeVisibility,
}: {
  selectedElementId: string | null;
  onSelectElement: (id: string) => void;
  trees: SerializedInstance[];
  hiddenTreeNames: Set<string>;
  onToggleTreeVisibility: (name: string) => void;
}) {
  return (
    <div className="border-r border-border bg-card overflow-y-auto">
      <div className="px-3 py-2 border-b border-border">
        <h2 className="text-xs font-medium text-foreground">
          Explorer
        </h2>
      </div>
      <LayerTree
        trees={trees}
        selectedElementId={selectedElementId}
        onSelectElement={onSelectElement}
        hiddenTreeNames={hiddenTreeNames}
        onToggleTreeVisibility={onToggleTreeVisibility}
      />
    </div>
  );
}
