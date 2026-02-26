"use client";

import { useState } from "react";

interface LayerNode {
  id: string;
  name: string;
  className: string;
  children?: LayerNode[];
}

const MOCK_TREE: LayerNode = {
  id: "screengui",
  name: "ScreenGui",
  className: "ScreenGui",
  children: [
    {
      id: "main-container",
      name: "MainContainer",
      className: "Frame",
      children: [
        { id: "title", name: "Title", className: "TextLabel" },
        { id: "play-button", name: "PlayButton", className: "TextButton" },
      ],
    },
  ],
};

function LayerRow({
  node,
  depth,
  selectedId,
  onSelect,
}: {
  node: LayerNode;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;

  return (
    <>
      <button
        onClick={() => onSelect(node.id)}
        className={`w-full flex items-center gap-1 px-2 py-1 text-left text-xs transition-colors ${
          isSelected
            ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white"
            : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
        }`}
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
        <span className="ml-auto text-[10px] text-neutral-400 dark:text-neutral-500">
          {node.className}
        </span>
      </button>
      {hasChildren &&
        expanded &&
        node.children!.map((child) => (
          <LayerRow
            key={child.id}
            node={child}
            depth={depth + 1}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
    </>
  );
}

export function LayerTree({
  selectedElementId,
  onSelectElement,
}: {
  selectedElementId: string | null;
  onSelectElement: (id: string) => void;
}) {
  return (
    <div className="py-1">
      <LayerRow
        node={MOCK_TREE}
        depth={0}
        selectedId={selectedElementId}
        onSelect={onSelectElement}
      />
    </div>
  );
}
