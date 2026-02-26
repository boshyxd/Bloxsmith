"use client";

import { useState } from "react";
import { LayerTree } from "./layer-tree";

interface ElementDef {
  name: string;
}

interface Category {
  label: string;
  elements: ElementDef[];
}

const ELEMENT_CATEGORIES: Category[] = [
  {
    label: "Layout",
    elements: [
      { name: "Frame" },
      { name: "ScrollingFrame" },
      { name: "CanvasGroup" },
    ],
  },
  {
    label: "Text",
    elements: [
      { name: "TextLabel" },
      { name: "TextButton" },
      { name: "TextBox" },
    ],
  },
  {
    label: "Media",
    elements: [
      { name: "ImageLabel" },
      { name: "ImageButton" },
      { name: "VideoFrame" },
    ],
  },
  {
    label: "Modifiers",
    elements: [
      { name: "UIListLayout" },
      { name: "UIGridLayout" },
      { name: "UIPadding" },
      { name: "UICorner" },
      { name: "UIStroke" },
      { name: "UIGradient" },
    ],
  },
];

function CategorySection({ category }: { category: Category }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
      >
        <span className="w-3 text-[10px] leading-none">
          {expanded ? "\u25BE" : "\u25B8"}
        </span>
        {category.label}
      </button>
      {expanded && (
        <div className="px-2 pb-2 grid grid-cols-2 gap-1">
          {category.elements.map((el) => (
            <div
              key={el.name}
              className="px-2.5 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
            >
              {el.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AssetSidebar({
  activeTab,
  onTabChange,
  selectedElementId,
  onSelectElement,
}: {
  activeTab: "elements" | "layers";
  onTabChange: (tab: "elements" | "layers") => void;
  selectedElementId: string | null;
  onSelectElement: (id: string) => void;
}) {
  return (
    <div className="border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-y-auto">
      {/* Tab switcher */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800">
        {(["elements", "layers"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              activeTab === tab
                ? "text-neutral-900 dark:text-white border-b-2 border-neutral-900 dark:border-white"
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "elements" ? (
        <div className="py-1">
          {ELEMENT_CATEGORIES.map((cat) => (
            <CategorySection key={cat.label} category={cat} />
          ))}
        </div>
      ) : (
        <LayerTree
          selectedElementId={selectedElementId}
          onSelectElement={onSelectElement}
        />
      )}
    </div>
  );
}
