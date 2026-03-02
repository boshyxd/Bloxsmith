"use client";

import { useState, useRef, useEffect } from "react";
import { STYLE_PRESETS } from "@/lib/studio/styles/presets";

export function StylePicker({
  selectedStyleId,
  onSelect,
  studioConnected,
  hasUIs,
}: {
  selectedStyleId: string;
  onSelect: (id: string) => void;
  studioConnected: boolean;
  hasUIs: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedStyle = STYLE_PRESETS.find((s) => s.id === selectedStyleId);

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
        className="flex items-center gap-2 px-2.5 h-7 rounded-none border border-border text-xs hover:bg-accent transition-colors"
      >
        <span className="text-muted-foreground">Style</span>
        <span className="text-foreground font-medium">{selectedStyle?.name ?? "Select"}</span>
        <svg className="w-3 h-3 text-muted-foreground" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 5l3 3 3-3" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 rounded-none border border-border bg-background z-50">
          <div className="py-1">
            {STYLE_PRESETS.map((preset) => {
              const disabled = preset.requiresStudio === true && (!studioConnected || !hasUIs);

              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    if (disabled) return;
                    onSelect(preset.id);
                    setOpen(false);
                  }}
                  disabled={disabled}
                  className={`w-full text-left px-3 py-2 transition-colors ${
                    disabled
                      ? "opacity-40 cursor-not-allowed"
                      : selectedStyleId === preset.id
                        ? "bg-accent"
                        : "hover:bg-accent/50"
                  }`}
                >
                  <span className="block text-xs font-medium text-foreground">
                    {preset.name}
                    {disabled && (
                      <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">
                        {!studioConnected ? "(connect Studio)" : "(no UIs found)"}
                      </span>
                    )}
                  </span>
                  <span className="block text-[10px] text-muted-foreground">
                    {preset.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
