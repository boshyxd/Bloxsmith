"use client";

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

export function CanvasViewport() {
  return (
    <div
      className="relative bg-neutral-100 dark:bg-neutral-900 overflow-hidden [--grid-line:theme(colors.neutral.200)] dark:[--grid-line:theme(colors.neutral.800)]"
      style={{ backgroundImage: GRID_BG }}
    >
      {/* Centered device frame */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[375px] h-[667px] rounded-md border-2 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 shadow-lg flex items-center justify-center">
          <span className="text-xs text-neutral-300 dark:text-neutral-600">
            Canvas
          </span>
        </div>
      </div>
    </div>
  );
}
