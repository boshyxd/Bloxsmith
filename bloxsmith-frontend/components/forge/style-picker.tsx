"use client";

import { useState, useRef, useEffect } from "react";
import type { SavedStyle } from "@/lib/studio/types";

export function StylePicker({
  styles,
  selectedStyleId,
  onSelect,
}: {
  styles: SavedStyle[];
  selectedStyleId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedStyle = selectedStyleId
    ? styles.find((s) => s.id === selectedStyleId) ?? null
    : null;

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2.5 h-7 rounded-md border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      >
        {selectedStyle ? selectedStyle.name : "No style"}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-48 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-lg z-50">
          {styles.length === 0 ? (
            <div className="px-3 py-2.5 text-xs text-neutral-400 dark:text-neutral-500">
              Connect Studio to extract styles
            </div>
          ) : (
            <div className="py-1">
              <button
                onClick={() => {
                  onSelect(null);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                  selectedStyleId === null
                    ? "text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                }`}
              >
                No style
              </button>
              {styles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => {
                    onSelect(style.id);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                    selectedStyleId === style.id
                      ? "text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800"
                      : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                  }`}
                >
                  <span className="block">{style.name}</span>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                    {style.tokens.colors.length} colors
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
