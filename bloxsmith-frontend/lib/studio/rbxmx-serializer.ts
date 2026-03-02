import { SerializedInstance } from "./types"

let nextRef = 0
function makeRef(): string {
  return `RBX${String(nextRef++).padStart(17, "0")}`
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

interface Color3Value { R: number; G: number; B: number }
interface UDim2Value { XScale: number; XOffset: number; YScale: number; YOffset: number }
interface UDimValue { Scale: number; Offset: number }
interface Vector2Value { X: number; Y: number }
interface RectValue { Min: Vector2Value; Max: Vector2Value }
interface ColorSequenceKeypoint { Time: number; Color: Color3Value }
interface NumberSequenceKeypoint { Time: number; Value: number; Envelope: number }

const ENUM_MAP: Record<string, Record<string, number>> = {
  Font: {
    Legacy: 0, Arial: 1, ArialBold: 2, SourceSans: 3, SourceSansBold: 4,
    SourceSansLight: 5, SourceSansItalic: 6, Bodoni: 7, Garamond: 8,
    Cartoon: 9, Code: 10, Highway: 11, SciFi: 12, Arcade: 13,
    Fantasy: 14, Antique: 15, Gotham: 16, GothamMedium: 17, GothamBold: 18,
    GothamBlack: 19, AmaticSC: 20, Bangers: 21, Creepster: 22,
    DenkOne: 23, Fondamento: 24, FredokaOne: 25, GrenzeGotisch: 26,
    IndieFlower: 27, JosefinSans: 28, Jura: 29, Kalam: 30,
    LuckiestGuy: 31, Merriweather: 32, Michroma: 33, Nunito: 34,
    Oswald: 35, PatrickHand: 36, PermanentMarker: 37, Roboto: 38,
    RobotoCondensed: 39, RobotoMono: 40, Sarpanch: 41, SpecialElite: 42,
    TitilliumWeb: 43, Ubuntu: 44, BuilderSans: 45, BuilderSansMedium: 46,
    BuilderSansBold: 47, BuilderSansExtraBold: 48,
  },
  TextXAlignment: { Left: 0, Center: 1, Right: 2 },
  TextYAlignment: { Top: 0, Center: 1, Bottom: 2 },
  ScaleType: { Stretch: 0, Slice: 1, Tile: 2, Fit: 3, Crop: 4 },
  FillDirection: { Horizontal: 0, Vertical: 1 },
  HorizontalAlignment: { Center: 0, Left: 1, Right: 2 },
  VerticalAlignment: { Center: 0, Top: 1, Bottom: 2 },
  SortOrder: { Name: 0, LayoutOrder: 1, Custom: 2 },
  ApplyStrokeMode: { Contextual: 0, Border: 1 },
  AspectType: { FitWithinMaxSize: 0, ScaleWithParentSize: 1 },
  DominantAxis: { Width: 0, Height: 1 },
  ZIndexBehavior: { Global: 0, Sibling: 1 },
  ScreenInsets: { None: 0, DeviceSafeInsets: 1, CoreUISafeInsets: 2, TopbarSafeInsets: 3 },
  AutomaticSize: { None: 0, X: 1, Y: 2, XY: 3 },
  BorderMode: { Outline: 0, Middle: 1, Inset: 2 },
  ScrollingDirection: { X: 1, Y: 2, XY: 3 },
  ElasticBehavior: { WhenScrollable: 0, Always: 1, Never: 2 },
  ResamplerMode: { Default: 0, Pixelated: 1 },
}

const ENUM_PROPERTIES: Record<string, string> = {
  Font: "Font",
  TextXAlignment: "TextXAlignment",
  TextYAlignment: "TextYAlignment",
  ScaleType: "ScaleType",
  FillDirection: "FillDirection",
  HorizontalAlignment: "HorizontalAlignment",
  VerticalAlignment: "VerticalAlignment",
  SortOrder: "SortOrder",
  ApplyStrokeMode: "ApplyStrokeMode",
  AspectType: "AspectType",
  DominantAxis: "DominantAxis",
  ZIndexBehavior: "ZIndexBehavior",
  ScreenInsets: "ScreenInsets",
  AutomaticSize: "AutomaticSize",
  BorderMode: "BorderMode",
  ScrollingDirection: "ScrollingDirection",
  ElasticBehavior: "ElasticBehavior",
  ResamplerMode: "ResamplerMode",
}

const FLOAT_PROPERTIES = new Set([
  "BackgroundTransparency", "TextTransparency", "ImageTransparency",
  "Transparency", "TextSize", "Thickness", "Rotation", "Scale",
  "AspectRatio", "ScrollBarThickness", "DisplayOrder",
])

const INT_PROPERTIES = new Set([
  "BorderSizePixel", "ZIndex", "LayoutOrder",
])

function isColor3(v: unknown): v is Color3Value {
  return typeof v === "object" && v !== null && "R" in v && "G" in v && "B" in v
}

function isUDim2(v: unknown): v is UDim2Value {
  return typeof v === "object" && v !== null && "XScale" in v && "XOffset" in v
}

function isUDim(v: unknown): v is UDimValue {
  return typeof v === "object" && v !== null && "Scale" in v && "Offset" in v && !("XScale" in v)
}

function isVector2(v: unknown): v is Vector2Value {
  return typeof v === "object" && v !== null && "X" in v && "Y" in v && !("Min" in v)
}

function isRect(v: unknown): v is RectValue {
  return typeof v === "object" && v !== null && "Min" in v && "Max" in v
}

function isColorSequence(v: unknown): v is ColorSequenceKeypoint[] {
  return Array.isArray(v) && v.length > 0 && typeof v[0] === "object" && v[0] !== null && "Time" in v[0] && "Color" in v[0]
}

function isNumberSequence(v: unknown): v is NumberSequenceKeypoint[] {
  return Array.isArray(v) && v.length > 0 && typeof v[0] === "object" && v[0] !== null && "Time" in v[0] && "Value" in v[0] && "Envelope" in v[0]
}

function serializeProperty(name: string, value: unknown): string[] {
  if (value === null || value === undefined) return []

  const n = escapeXml(name)

  if (name in ENUM_PROPERTIES) {
    const enumValues = ENUM_MAP[ENUM_PROPERTIES[name]]
    if (enumValues && typeof value === "string" && value in enumValues) {
      return [`<token name="${n}">${enumValues[value]}</token>`]
    }
    if (typeof value === "number") {
      return [`<token name="${n}">${value}</token>`]
    }
  }

  if (isColor3(value)) {
    return [
      `<Color3 name="${n}">`,
      `  <R>${value.R}</R>`,
      `  <G>${value.G}</G>`,
      `  <B>${value.B}</B>`,
      `</Color3>`,
    ]
  }

  if (isUDim2(value)) {
    return [
      `<UDim2 name="${n}">`,
      `  <XS>${value.XScale}</XS>`,
      `  <XO>${value.XOffset}</XO>`,
      `  <YS>${value.YScale}</YS>`,
      `  <YO>${value.YOffset}</YO>`,
      `</UDim2>`,
    ]
  }

  if (isUDim(value)) {
    return [
      `<UDim name="${n}">`,
      `  <S>${value.Scale}</S>`,
      `  <O>${value.Offset}</O>`,
      `</UDim>`,
    ]
  }

  if (isVector2(value)) {
    return [
      `<Vector2 name="${n}">`,
      `  <X>${value.X}</X>`,
      `  <Y>${value.Y}</Y>`,
      `</Vector2>`,
    ]
  }

  if (isRect(value)) {
    return [
      `<Rect2D name="${n}">`,
      `  <min>`,
      `    <X>${value.Min.X}</X>`,
      `    <Y>${value.Min.Y}</Y>`,
      `  </min>`,
      `  <max>`,
      `    <X>${value.Max.X}</X>`,
      `    <Y>${value.Max.Y}</Y>`,
      `  </max>`,
      `</Rect2D>`,
    ]
  }

  if (isColorSequence(value)) {
    const kps = value.map(kp => `${kp.Time} ${kp.Color.R} ${kp.Color.G} ${kp.Color.B} 0`).join(" ")
    return [`<ColorSequence name="${n}">${kps}</ColorSequence>`]
  }

  if (isNumberSequence(value)) {
    const kps = value.map(kp => `${kp.Time} ${kp.Value} ${kp.Envelope}`).join(" ")
    return [`<NumberSequence name="${n}">${kps}</NumberSequence>`]
  }

  if (typeof value === "boolean") {
    return [`<bool name="${n}">${value}</bool>`]
  }

  if (typeof value === "number") {
    if (FLOAT_PROPERTIES.has(name)) {
      return [`<float name="${n}">${value}</float>`]
    }
    if (INT_PROPERTIES.has(name) || Number.isInteger(value)) {
      return [`<int name="${n}">${value}</int>`]
    }
    return [`<float name="${n}">${value}</float>`]
  }

  if (typeof value === "string") {
    return [`<string name="${n}">${escapeXml(value)}</string>`]
  }

  return []
}

function indent(lines: string[], prefix: string): string[] {
  return lines.map(line => prefix + line)
}

function serializeInstance(instance: SerializedInstance, depth: number): string[] {
  const ref = makeRef()
  const pad = "  ".repeat(depth)
  const lines: string[] = []

  lines.push(`${pad}<Item class="${escapeXml(instance.className)}" referent="${ref}">`)
  lines.push(`${pad}  <Properties>`)
  lines.push(`${pad}    <string name="Name">${escapeXml(instance.name)}</string>`)

  for (const [name, value] of Object.entries(instance.properties)) {
    const propLines = serializeProperty(name, value)
    if (propLines.length > 0) {
      lines.push(...indent(propLines, `${pad}    `))
    }
  }

  lines.push(`${pad}  </Properties>`)

  for (const child of instance.children) {
    lines.push(...serializeInstance(child, depth + 1))
  }

  lines.push(`${pad}</Item>`)
  return lines
}

export function serializeToRbxmx(trees: SerializedInstance[]): string {
  nextRef = 0

  const lines: string[] = [
    `<roblox xmlns:xmime="http://www.w3.org/2005/05/xmlmime" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="www.roblox.com/roblox.xsd" version="4">`,
  ]

  for (const tree of trees) {
    lines.push(...serializeInstance(tree, 1))
  }

  lines.push(`</roblox>`)
  return lines.join("\n")
}
