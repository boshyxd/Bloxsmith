"use client";

import type { SerializedInstance } from "@/lib/studio/types";
import { RobloxRenderer } from "./roblox-renderer";

const GRID_BG = `repeating-linear-gradient(
    0deg,
    transparent,
    transparent 19px,
    var(--grid-line) 19px,
    var(--grid-line) 20px
  ),
  repeating-linear-gradient(
    90deg,
    transparent,
    transparent 19px,
    var(--grid-line) 19px,
    var(--grid-line) 20px
  )`;

export function CanvasViewport({ trees }: { trees: SerializedInstance[] }) {
  return (
    <div
      className="relative bg-secondary overflow-hidden [--grid-line:oklch(1_0_0/4%)]"
      style={{ backgroundImage: GRID_BG }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[375px] h-[667px] rounded-none border-2 border-border bg-background overflow-hidden">
          <RobloxRenderer trees={trees} />
        </div>
      </div>
    </div>
  );
}
