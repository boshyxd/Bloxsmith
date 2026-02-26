import type { SerializedInstance, DesignTokens } from "@/lib/studio/types";

function incrementCount(map: Map<string, number>, key: string): void {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function sortedEntries(map: Map<string, number>): { value: string; count: number }[] {
  return Array.from(map.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);
}

export function extractDesignTokens(tree: SerializedInstance): DesignTokens {
  const colors = new Map<string, number>();
  const fonts = new Map<string, number>();
  const cornerRadii: number[] = [];
  const strokePatterns: { color: string; thickness: number }[] = [];
  const transparencyValues: number[] = [];

  function walk(node: SerializedInstance): void {
    const props = node.properties;

    if (props.BackgroundColor3 !== undefined) {
      incrementCount(colors, String(props.BackgroundColor3));
    }
    if (props.TextColor3 !== undefined) {
      incrementCount(colors, String(props.TextColor3));
    }
    if (props.Font !== undefined) {
      incrementCount(fonts, String(props.Font));
    }

    if (node.className === "UICorner" && props.CornerRadius !== undefined) {
      cornerRadii.push(Number(props.CornerRadius));
    }

    if (node.className === "UIStroke") {
      strokePatterns.push({
        color: String(props.Color ?? ""),
        thickness: Number(props.Thickness ?? 0),
      });
    }

    if (props.BackgroundTransparency !== undefined) {
      const t = Number(props.BackgroundTransparency);
      if (t > 0 && t < 1) {
        transparencyValues.push(t);
      }
    }

    for (const child of node.children) {
      walk(child);
    }
  }

  walk(tree);

  return {
    colors: sortedEntries(colors),
    fonts: sortedEntries(fonts),
    cornerRadii,
    strokePatterns,
    transparencyValues,
  };
}
