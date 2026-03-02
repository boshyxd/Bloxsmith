"use client";

import { useState } from "react";
import type { SerializedInstance } from "@/lib/studio/types";

function LayerRow({
  node,
  path,
  depth,
  selectedId,
  onSelect,
  isHidden,
  onToggleVisibility,
}: {
  node: SerializedInstance;
  path: string;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  isHidden?: boolean;
  onToggleVisibility?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedId === path;
  const isRoot = depth === 0;

  return (
    <>
      <button
        onClick={() => onSelect(path)}
        className={`w-full flex items-center gap-1 px-2 py-1 text-left text-xs transition-colors group ${
          isSelected
            ? "bg-accent text-foreground"
            : "text-secondary-foreground hover:bg-accent/50"
        } ${isHidden ? "opacity-40" : ""}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren ? (
          <span
            className="w-3 shrink-0 text-[10px] leading-none cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? "\u25BE" : "\u25B8"}
          </span>
        ) : (
          <span className="w-3 shrink-0" />
        )}
        <span className="truncate">{node.name}</span>
        {isRoot && onToggleVisibility && (
          <span
            className="ml-auto shrink-0 w-4 h-4 flex items-center justify-center cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility();
            }}
            title={isHidden ? "Include in context" : "Exclude from context"}
          >
            {isHidden ? (
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                <path d="M2 2l12 12" />
                <path d="M4.5 6.5C3.4 7.3 2.5 8 2.5 8s2.5 4 5.5 4c.8 0 1.5-.2 2.2-.5" />
                <path d="M11.5 9.5C12.6 8.7 13.5 8 13.5 8s-2.5-4-5.5-4c-.8 0-1.5.2-2.2.5" />
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <path d="M2.5 8s2.5-4 5.5-4 5.5 4 5.5 4-2.5 4-5.5 4S2.5 8 2.5 8z" />
                <circle cx="8" cy="8" r="1.5" />
              </svg>
            )}
          </span>
        )}
        {!isRoot && (
          <span className="ml-auto text-[10px] text-muted-foreground">
            {node.className}
          </span>
        )}
      </button>
      {hasChildren &&
        expanded &&
        node.children.map((child, i) => (
          <LayerRow
            key={`${path}.${child.name}.${i}`}
            node={child}
            path={`${path}.${child.name}`}
            depth={depth + 1}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
    </>
  );
}

export function LayerTree({
  trees,
  selectedElementId,
  onSelectElement,
  hiddenTreeNames,
  onToggleTreeVisibility,
}: {
  trees: SerializedInstance[];
  selectedElementId: string | null;
  onSelectElement: (id: string) => void;
  hiddenTreeNames: Set<string>;
  onToggleTreeVisibility: (name: string) => void;
}) {
  if (trees.length === 0) {
    return (
      <div className="px-3 py-6 text-center text-xs text-muted-foreground">
        Connect to Studio to see your UI
      </div>
    );
  }

  return (
    <div className="py-1">
      {trees.map((tree, i) => (
        <LayerRow
          key={`${tree.name}.${i}`}
          node={tree}
          path={tree.name}
          depth={0}
          selectedId={selectedElementId}
          onSelect={onSelectElement}
          isHidden={hiddenTreeNames.has(tree.name)}
          onToggleVisibility={() => onToggleTreeVisibility(tree.name)}
        />
      ))}
    </div>
  );
}
