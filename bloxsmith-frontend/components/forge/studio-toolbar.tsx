"use client";

interface StudioToolbarProps {
  connectionSlot?: React.ReactNode;
  styleSlot?: React.ReactNode;
}

export function StudioToolbar({ connectionSlot, styleSlot }: StudioToolbarProps) {
  return (
    <div className="col-span-3 h-12 flex items-center justify-between px-3 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
      {/* Left: logo + breadcrumb */}
      <div className="flex items-center gap-3">
        <a
          href="/"
          className="flex items-center justify-center h-7 w-7 rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold"
          aria-label="Home"
        >
          B
        </a>
        <span className="text-xs text-neutral-400 dark:text-neutral-500">/</span>
        <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
          UI Forge
        </span>
      </div>

      {/* Center: style picker slot */}
      <div>{styleSlot}</div>

      {/* Right: connection status slot */}
      <div>{connectionSlot}</div>
    </div>
  );
}
