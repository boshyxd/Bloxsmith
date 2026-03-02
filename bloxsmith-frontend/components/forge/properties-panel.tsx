"use client";

import type { SerializedInstance } from "@/lib/studio/types";

const TEXT_CLASSES = new Set(["TextLabel", "TextButton", "TextBox"]);

function PropertyGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-3 py-2 border-b border-border">
      <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
        {label}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground shrink-0">
        {label}
      </span>
      {children}
    </div>
  );
}

function color3ToHex(c: { R: number; G: number; B: number }): string {
  const r = Math.round(c.R * 255);
  const g = Math.round(c.G * 255);
  const b = Math.round(c.B * 255);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function ColorSwatch({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-5 h-5 rounded-none border border-border"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-muted-foreground font-mono">
        {color}
      </span>
    </div>
  );
}

function ValueDisplay({ value }: { value: unknown }) {
  if (value === null || value === undefined) return null;

  if (typeof value === "object" && "R" in (value as Record<string, unknown>)) {
    return <ColorSwatch color={color3ToHex(value as { R: number; G: number; B: number })} />;
  }

  if (typeof value === "object" && "XScale" in (value as Record<string, unknown>)) {
    const u = value as { XScale: number; XOffset: number; YScale: number; YOffset: number };
    return (
      <span className="text-xs text-muted-foreground font-mono">
        {`{${u.XScale}, ${u.XOffset}}, {${u.YScale}, ${u.YOffset}}`}
      </span>
    );
  }

  if (typeof value === "object" && "Scale" in (value as Record<string, unknown>)) {
    const u = value as { Scale: number; Offset: number };
    return (
      <span className="text-xs text-muted-foreground font-mono">
        {`${u.Scale}, ${u.Offset}`}
      </span>
    );
  }

  return (
    <span className="text-xs text-muted-foreground font-mono truncate max-w-[140px]">
      {String(value)}
    </span>
  );
}

function findNode(trees: SerializedInstance[], path: string): SerializedInstance | null {
  const parts = path.split(".");
  if (parts.length === 0) return null;

  let current: SerializedInstance | null = null;

  for (const tree of trees) {
    if (tree.name === parts[0]) {
      current = tree;
      break;
    }
  }

  for (let i = 1; i < parts.length; i++) {
    if (!current) return null;
    const target = parts[i];
    let found: SerializedInstance | null = null;
    for (const c of current.children) {
      if (c.name === target) { found = c; break; }
    }
    if (!found) return null;
    current = found;
  }

  return current;
}

export function PropertiesPanel({
  trees,
  selectedElementId,
}: {
  trees: SerializedInstance[];
  selectedElementId: string | null;
}) {
  const node = selectedElementId ? findNode(trees, selectedElementId) : null;

  return (
    <div className="border-l border-border bg-background overflow-y-auto">
      <div className="px-3 py-2 border-b border-border">
        <h2 className="text-xs font-medium text-foreground">
          Properties
        </h2>
        {node && (
          <span className="text-[10px] text-muted-foreground">
            {node.name} ({node.className})
          </span>
        )}
      </div>

      {!node ? (
        <div className="px-3 py-8 text-center text-xs text-muted-foreground">
          Select an element to view properties
        </div>
      ) : (
        <PropertyGroup label={node.className}>
          {Object.entries(node.properties).map(([key, value]) => (
            <PropRow key={key} label={key}>
              <ValueDisplay value={value} />
            </PropRow>
          ))}
          {Object.keys(node.properties).length === 0 && (
            <span className="text-xs text-muted-foreground">No properties</span>
          )}
        </PropertyGroup>
      )}
    </div>
  );
}
