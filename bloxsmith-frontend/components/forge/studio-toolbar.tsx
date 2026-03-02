"use client";

interface StudioToolbarProps {
  connectionSlot?: React.ReactNode;
  styleSlot?: React.ReactNode;
  creditsSlot?: React.ReactNode;
}

export function StudioToolbar({ connectionSlot, styleSlot, creditsSlot }: StudioToolbarProps) {
  return (
    <div className="col-span-3 h-12 flex items-center justify-between px-3 border-b border-border bg-background">
      <div className="flex items-center gap-3">
        <a
          href="/"
          className="flex items-center justify-center h-7 w-7 rounded-none bg-secondary"
          aria-label="Home"
        >
          <img src="/logos/bloxsmith-icon.svg" alt="Bloxsmith" className="h-4 w-4" />
        </a>
        <span className="text-xs text-muted-foreground">/</span>
        <span className="text-xs font-medium text-foreground">UI Forge</span>
      </div>

      <div>{styleSlot}</div>

      <div className="flex items-center gap-3">
        {creditsSlot}
        {connectionSlot}
      </div>
    </div>
  );
}
