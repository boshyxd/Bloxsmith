"use client";

interface ElementData {
  name: string;
  className: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
  bgColor: string;
  bgTransparency: number;
  borderSizePixel: number;
  text?: string;
  textColor?: string;
  textSize?: number;
  font?: string;
}

const MOCK_ELEMENTS: Record<string, ElementData> = {
  screengui: {
    name: "ScreenGui",
    className: "ScreenGui",
    position: { x: 0, y: 0 },
    size: { w: 0, h: 0 },
    bgColor: "#ffffff",
    bgTransparency: 1,
    borderSizePixel: 0,
  },
  "main-container": {
    name: "MainContainer",
    className: "Frame",
    position: { x: 0, y: 0 },
    size: { w: 375, h: 667 },
    bgColor: "#ffffff",
    bgTransparency: 0,
    borderSizePixel: 0,
  },
  title: {
    name: "Title",
    className: "TextLabel",
    position: { x: 50, y: 40 },
    size: { w: 275, h: 48 },
    bgColor: "#ffffff",
    bgTransparency: 1,
    borderSizePixel: 0,
    text: "Welcome",
    textColor: "#1a1a1a",
    textSize: 32,
    font: "GothamBold",
  },
  "play-button": {
    name: "PlayButton",
    className: "TextButton",
    position: { x: 100, y: 120 },
    size: { w: 175, h: 44 },
    bgColor: "#2563eb",
    bgTransparency: 0,
    borderSizePixel: 0,
    text: "Play",
    textColor: "#ffffff",
    textSize: 18,
    font: "GothamMedium",
  },
};

const TEXT_CLASSES = new Set(["TextLabel", "TextButton", "TextBox"]);

function PropertyGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-800">
      <h3 className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
        {label}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-neutral-600 dark:text-neutral-400 shrink-0">
        {label}
      </span>
      {children}
    </div>
  );
}

function NumberInput({ value }: { value: number }) {
  return (
    <input
      type="number"
      readOnly
      value={value}
      className="w-16 h-6 px-1.5 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-900 dark:text-neutral-100 text-right tabular-nums"
    />
  );
}

function ColorSwatch({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-5 h-5 rounded border border-neutral-300 dark:border-neutral-700"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-neutral-600 dark:text-neutral-400 font-mono">
        {color}
      </span>
    </div>
  );
}

export function PropertiesPanel({
  selectedElementId,
}: {
  selectedElementId: string | null;
}) {
  const element = selectedElementId
    ? MOCK_ELEMENTS[selectedElementId]
    : undefined;

  return (
    <div className="border-l border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-y-auto">
      {/* Header */}
      <div className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-800">
        <h2 className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
          Properties
        </h2>
        {element && (
          <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
            {element.name}
          </span>
        )}
      </div>

      {!element ? (
        <div className="px-3 py-8 text-center text-xs text-neutral-400 dark:text-neutral-500">
          Select an element to view properties
        </div>
      ) : (
        <>
          <PropertyGroup label="Transform">
            <div className="flex gap-2">
              <PropRow label="X">
                <NumberInput value={element.position.x} />
              </PropRow>
              <PropRow label="Y">
                <NumberInput value={element.position.y} />
              </PropRow>
            </div>
            <div className="flex gap-2">
              <PropRow label="W">
                <NumberInput value={element.size.w} />
              </PropRow>
              <PropRow label="H">
                <NumberInput value={element.size.h} />
              </PropRow>
            </div>
          </PropertyGroup>

          <PropertyGroup label="Appearance">
            <PropRow label="BgColor3">
              <ColorSwatch color={element.bgColor} />
            </PropRow>
            <PropRow label="BgTransparency">
              <NumberInput value={element.bgTransparency} />
            </PropRow>
            <PropRow label="BorderSize">
              <NumberInput value={element.borderSizePixel} />
            </PropRow>
          </PropertyGroup>

          {element.text !== undefined && TEXT_CLASSES.has(element.className) && (
            <PropertyGroup label="Text">
              <PropRow label="Text">
                <input
                  type="text"
                  readOnly
                  value={element.text}
                  className="w-24 h-6 px-1.5 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-900 dark:text-neutral-100"
                />
              </PropRow>
              <PropRow label="TextColor3">
                <ColorSwatch color={element.textColor!} />
              </PropRow>
              <PropRow label="TextSize">
                <NumberInput value={element.textSize!} />
              </PropRow>
              <PropRow label="Font">
                <select
                  disabled
                  value={element.font}
                  className="w-24 h-6 px-1 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-900 dark:text-neutral-100"
                >
                  <option>{element.font}</option>
                </select>
              </PropRow>
            </PropertyGroup>
          )}
        </>
      )}
    </div>
  );
}
