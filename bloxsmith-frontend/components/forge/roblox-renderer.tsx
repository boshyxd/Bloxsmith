"use client";

import { useState, useEffect, type CSSProperties } from "react";
import type { SerializedInstance } from "@/lib/studio/types";

const MODIFIER_CLASSES = new Set([
  "UICorner", "UIStroke", "UIPadding", "UIListLayout", "UIGridLayout",
  "UIGradient", "UIScale", "UIAspectRatioConstraint", "UISizeConstraint",
]);

const TEXT_CLASSES = new Set(["TextLabel", "TextButton", "TextBox"]);
const IMAGE_CLASSES = new Set(["ImageLabel", "ImageButton"]);

const FONT_MAP: Record<string, { family: string; weight: number }> = {
  Legacy: { family: "Arial, sans-serif", weight: 400 },
  Arial: { family: "Arial, sans-serif", weight: 400 },
  ArialBold: { family: "Arial, sans-serif", weight: 700 },
  SourceSans: { family: "'Source Sans 3', system-ui, sans-serif", weight: 400 },
  SourceSansLight: { family: "'Source Sans 3', system-ui, sans-serif", weight: 300 },
  SourceSansBold: { family: "'Source Sans 3', system-ui, sans-serif", weight: 700 },
  SourceSansSemibold: { family: "'Source Sans 3', system-ui, sans-serif", weight: 600 },
  SourceSansItalic: { family: "'Source Sans 3', system-ui, sans-serif", weight: 400 },
  Gotham: { family: "system-ui, sans-serif", weight: 400 },
  GothamMedium: { family: "system-ui, sans-serif", weight: 500 },
  GothamBold: { family: "system-ui, sans-serif", weight: 700 },
  GothamBlack: { family: "system-ui, sans-serif", weight: 900 },
  RobotoMono: { family: "'Roboto Mono', monospace", weight: 400 },
  Ubuntu: { family: "'Ubuntu', system-ui, sans-serif", weight: 400 },
  FredokaOne: { family: "'Fredoka One', system-ui, sans-serif", weight: 400 },
  Bangers: { family: "'Bangers', system-ui, sans-serif", weight: 400 },
  BuilderSans: { family: "system-ui, sans-serif", weight: 400 },
  BuilderSansMedium: { family: "system-ui, sans-serif", weight: 500 },
  BuilderSansBold: { family: "system-ui, sans-serif", weight: 700 },
  BuilderSansExtraBold: { family: "system-ui, sans-serif", weight: 800 },
};

interface Modifiers {
  corner?: SerializedInstance;
  stroke?: SerializedInstance;
  padding?: SerializedInstance;
  listLayout?: SerializedInstance;
  gridLayout?: SerializedInstance;
}

function collectModifiers(node: SerializedInstance): Modifiers {
  const mods: Modifiers = {};
  for (const child of node.children) {
    switch (child.className) {
      case "UICorner": mods.corner = child; break;
      case "UIStroke": mods.stroke = child; break;
      case "UIPadding": mods.padding = child; break;
      case "UIListLayout": mods.listLayout = child; break;
      case "UIGridLayout": mods.gridLayout = child; break;
    }
  }
  return mods;
}

function udim2Css(prop: unknown, dim: "x" | "y"): string {
  if (!prop || typeof prop !== "object") return "0px";
  const u = prop as { XScale: number; XOffset: number; YScale: number; YOffset: number };
  const scale = dim === "x" ? u.XScale : u.YScale;
  const offset = dim === "x" ? u.XOffset : u.YOffset;
  if (scale === 0 && offset === 0) return "0px";
  if (scale === 0) return `${offset}px`;
  if (offset === 0) return `${scale * 100}%`;
  return `calc(${scale * 100}% + ${offset}px)`;
}

function udimPx(prop: unknown): string {
  if (!prop || typeof prop !== "object") return "0px";
  const u = prop as { Scale: number; Offset: number };
  if (u.Scale === 0) return `${u.Offset}px`;
  if (u.Offset === 0) return `${u.Scale * 100}%`;
  return `calc(${u.Scale * 100}% + ${u.Offset}px)`;
}

function color3Rgba(c: unknown, alpha: number): string {
  if (!c || typeof c !== "object") return "transparent";
  const { R, G, B } = c as { R: number; G: number; B: number };
  return `rgba(${Math.round(R * 255)},${Math.round(G * 255)},${Math.round(B * 255)},${alpha})`;
}

function color3Rgb(c: unknown): string {
  if (!c || typeof c !== "object") return "transparent";
  const { R, G, B } = c as { R: number; G: number; B: number };
  return `rgb(${Math.round(R * 255)},${Math.round(G * 255)},${Math.round(B * 255)})`;
}

function parseAssetId(src: string): string | null {
  const match = src.match(/rbxassetid:\/\/(\d+)/);
  return match ? match[1] : null;
}

function RobloxImage({ src, style }: { src: string; style: CSSProperties }) {
  const [url, setUrl] = useState<string | null>(null);
  const assetId = parseAssetId(src);

  useEffect(() => {
    if (!assetId) return;
    fetch(`/api/roblox-asset?id=${assetId}`)
      .then((r) => r.json())
      .then((d) => { if (d.url) setUrl(d.url); })
      .catch(() => {});
  }, [assetId]);

  if (!url) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" style={{ ...style, objectFit: "cover" }} />;
}

function computeStyle(
  node: SerializedInstance,
  mods: Modifiers,
  parentHasLayout: boolean,
  isScreenGui: boolean,
): CSSProperties {
  const p = node.properties;
  const style: CSSProperties = {};

  if (isScreenGui) {
    style.width = "100%";
    style.height = "100%";
    style.position = "relative";
    style.overflow = "hidden";
    return style;
  }

  // Size
  style.width = udim2Css(p.Size, "x");
  style.height = udim2Css(p.Size, "y");

  // Position
  if (parentHasLayout) {
    style.flexShrink = 0;
  } else {
    style.position = "absolute";
    style.left = udim2Css(p.Position, "x");
    style.top = udim2Css(p.Position, "y");

    const anchor = p.AnchorPoint as { X: number; Y: number } | undefined;
    if (anchor && (anchor.X !== 0 || anchor.Y !== 0)) {
      style.transform = `translate(${-anchor.X * 100}%,${-anchor.Y * 100}%)`;
    }
  }

  // Background
  const bgTransparency = typeof p.BackgroundTransparency === "number" ? p.BackgroundTransparency : 0;
  if (bgTransparency < 1) {
    style.backgroundColor = color3Rgba(p.BackgroundColor3, 1 - bgTransparency);
  }

  // Border
  const borderSize = typeof p.BorderSizePixel === "number" ? p.BorderSizePixel : 0;
  if (borderSize > 0) {
    style.border = `${borderSize}px solid ${color3Rgb(p.BorderColor3)}`;
  }

  // UICorner → border-radius
  if (mods.corner) {
    style.borderRadius = udimPx(mods.corner.properties.CornerRadius);
    style.overflow = "hidden";
  }

  // UIStroke → outline
  if (mods.stroke) {
    const thickness = typeof mods.stroke.properties.Thickness === "number" ? mods.stroke.properties.Thickness : 1;
    const strokeAlpha = 1 - (typeof mods.stroke.properties.Transparency === "number" ? mods.stroke.properties.Transparency : 0);
    style.outline = `${thickness}px solid ${color3Rgba(mods.stroke.properties.Color, strokeAlpha)}`;
  }

  // UIPadding
  if (mods.padding) {
    style.paddingTop = udimPx(mods.padding.properties.PaddingTop);
    style.paddingBottom = udimPx(mods.padding.properties.PaddingBottom);
    style.paddingLeft = udimPx(mods.padding.properties.PaddingLeft);
    style.paddingRight = udimPx(mods.padding.properties.PaddingRight);
  }

  // UIListLayout → flex
  if (mods.listLayout) {
    const lp = mods.listLayout.properties;
    style.display = "flex";
    style.flexDirection = lp.FillDirection === "Horizontal" ? "row" : "column";
    if (lp.Padding) style.gap = udimPx(lp.Padding);

    const isRow = lp.FillDirection === "Horizontal";
    const hAlign = lp.HorizontalAlignment as string | undefined;
    const vAlign = lp.VerticalAlignment as string | undefined;

    const mainAlign = isRow ? hAlign : vAlign;
    const crossAlign = isRow ? vAlign : hAlign;

    if (mainAlign === "Center") style.justifyContent = "center";
    else if (mainAlign === "Right" || mainAlign === "Bottom") style.justifyContent = "flex-end";

    if (crossAlign === "Center") style.alignItems = "center";
    else if (crossAlign === "Right" || crossAlign === "Bottom") style.alignItems = "flex-end";
  }

  // UIGridLayout → grid
  if (mods.gridLayout) {
    const gp = mods.gridLayout.properties;
    style.display = "grid";
    if (gp.CellSize) {
      style.gridTemplateColumns = `repeat(auto-fill, ${udim2Css(gp.CellSize, "x")})`;
      style.gridAutoRows = udim2Css(gp.CellSize, "y");
    }
    if (gp.CellPadding) {
      style.gap = `${udim2Css(gp.CellPadding, "y")} ${udim2Css(gp.CellPadding, "x")}`;
    }
  }

  // Clipping
  if (p.ClipsDescendants) {
    style.overflow = "hidden";
  }

  // ScrollingFrame
  if (node.className === "ScrollingFrame") {
    style.overflow = "auto";
  }

  // Visibility
  if (p.Visible === false) {
    style.display = "none";
  }

  // ZIndex
  if (typeof p.ZIndex === "number" && p.ZIndex !== 1) {
    style.zIndex = p.ZIndex;
  }

  // Rotation
  if (typeof p.Rotation === "number" && p.Rotation !== 0) {
    style.transform = `${style.transform ?? ""} rotate(${p.Rotation}deg)`.trim();
  }

  // Text styling
  if (TEXT_CLASSES.has(node.className)) {
    if (!mods.listLayout && !mods.gridLayout) {
      style.display = "flex";
    }

    const xAlign = p.TextXAlignment as string | undefined;
    const yAlign = p.TextYAlignment as string | undefined;

    if (xAlign === "Center") style.justifyContent = "center";
    else if (xAlign === "Right") style.justifyContent = "flex-end";

    if (yAlign === "Center") style.alignItems = "center";
    else if (yAlign === "Bottom") style.alignItems = "flex-end";

    if (p.TextColor3) style.color = color3Rgb(p.TextColor3);
    if (typeof p.TextSize === "number") style.fontSize = `${p.TextSize}px`;
    if (typeof p.TextTransparency === "number" && p.TextTransparency > 0) {
      style.color = color3Rgba(p.TextColor3, 1 - p.TextTransparency);
    }

    const font = FONT_MAP[p.Font as string];
    if (font) {
      style.fontFamily = font.family;
      style.fontWeight = font.weight;
    }

    if (p.TextWrapped) {
      style.wordWrap = "break-word";
      style.overflow = "hidden";
    }

    if (p.TextScaled) {
      style.fontSize = "100%";
    }
  }

  return style;
}

function RobloxNode({
  node,
  parentHasLayout,
  isScreenGui,
}: {
  node: SerializedInstance;
  parentHasLayout: boolean;
  isScreenGui?: boolean;
}) {
  const mods = collectModifiers(node);
  const style = computeStyle(node, mods, parentHasLayout, !!isScreenGui);
  const hasLayout = !!(mods.listLayout || mods.gridLayout);
  const visualChildren = node.children.filter((c) => !MODIFIER_CLASSES.has(c.className));
  const isText = TEXT_CLASSES.has(node.className);
  const isImage = IMAGE_CLASSES.has(node.className);
  const imgSrc = typeof node.properties.Image === "string" ? node.properties.Image : null;

  return (
    <div style={style}>
      {isImage && imgSrc && (
        <RobloxImage
          src={imgSrc}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />
      )}
      {isText && typeof node.properties.Text === "string" && (
        <span style={{ position: "relative", zIndex: 1 }}>{node.properties.Text}</span>
      )}
      {visualChildren.map((child, i) => (
        <RobloxNode
          key={`${child.name}.${i}`}
          node={child}
          parentHasLayout={hasLayout}
        />
      ))}
    </div>
  );
}

export function RobloxRenderer({ trees }: { trees: SerializedInstance[] }) {
  if (trees.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-xs text-neutral-400 dark:text-neutral-500">
        Connect to Studio to preview your UI
      </div>
    );
  }

  return (
    <>
      {trees.map((tree, i) => (
        <RobloxNode
          key={`${tree.name}.${i}`}
          node={tree}
          parentHasLayout={false}
          isScreenGui={tree.className === "ScreenGui"}
        />
      ))}
    </>
  );
}
