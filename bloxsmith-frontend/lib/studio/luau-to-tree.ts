import type { SerializedInstance } from "./types"

interface InstanceEntry {
  node: SerializedInstance
  parentVar: string | null
}

const INSTANCE_RE = /^local\s+(\w+)\s*=\s*Instance\.new\("(\w+)"\)/
const PROP_RE = /^(\w+)\.(\w+)\s*=\s*(.+)$/
const ROOT_PARENTS = new Set(["game.StarterGui", 'game:GetService("StarterGui")'])

function parseValue(raw: string, propName: string): unknown {
  const s = raw.trim()

  if (s === "true") return true
  if (s === "false") return false

  const udim2Full = s.match(/^UDim2\.new\(\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\)$/)
  if (udim2Full) {
    return {
      XScale: parseFloat(udim2Full[1]),
      XOffset: parseFloat(udim2Full[2]),
      YScale: parseFloat(udim2Full[3]),
      YOffset: parseFloat(udim2Full[4]),
    }
  }

  const udim2Scale = s.match(/^UDim2\.fromScale\(\s*([^,]+),\s*([^)]+)\)$/)
  if (udim2Scale) {
    return {
      XScale: parseFloat(udim2Scale[1]),
      XOffset: 0,
      YScale: parseFloat(udim2Scale[2]),
      YOffset: 0,
    }
  }

  const udim2Offset = s.match(/^UDim2\.fromOffset\(\s*([^,]+),\s*([^)]+)\)$/)
  if (udim2Offset) {
    return {
      XScale: 0,
      XOffset: parseFloat(udim2Offset[1]),
      YScale: 0,
      YOffset: parseFloat(udim2Offset[2]),
    }
  }

  const color3RGB = s.match(/^Color3\.fromRGB\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\)$/)
  if (color3RGB) {
    return {
      R: parseFloat(color3RGB[1]) / 255,
      G: parseFloat(color3RGB[2]) / 255,
      B: parseFloat(color3RGB[3]) / 255,
    }
  }

  const color3New = s.match(/^Color3\.new\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\)$/)
  if (color3New) {
    return {
      R: parseFloat(color3New[1]),
      G: parseFloat(color3New[2]),
      B: parseFloat(color3New[3]),
    }
  }

  const udim = s.match(/^UDim\.new\(\s*([^,]+),\s*([^)]+)\)$/)
  if (udim) {
    return { Scale: parseFloat(udim[1]), Offset: parseFloat(udim[2]) }
  }

  const vec2 = s.match(/^Vector2\.new\(\s*([^,]+),\s*([^)]+)\)$/)
  if (vec2) {
    return { X: parseFloat(vec2[1]), Y: parseFloat(vec2[2]) }
  }

  const enumMatch = s.match(/^Enum\.(\w+)\.(\w+)$/)
  if (enumMatch) {
    return enumMatch[2]
  }

  const str = s.match(/^"(.*)"$/) ?? s.match(/^'(.*)'$/)
  if (str) {
    return str[1]
  }

  const num = parseFloat(s)
  if (!isNaN(num)) return num

  return null
}

export function parseLuauToTrees(code: string): SerializedInstance[] {
  const entries = new Map<string, InstanceEntry>()
  const lines = code.split("\n")

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line || line.startsWith("--")) continue

    const instMatch = line.match(INSTANCE_RE)
    if (instMatch) {
      const [, varName, className] = instMatch
      entries.set(varName, {
        node: { className, name: varName, properties: {}, children: [] },
        parentVar: null,
      })
      continue
    }

    const propMatch = line.match(PROP_RE)
    if (!propMatch) continue

    const [, varName, propName, rawValue] = propMatch
    const entry = entries.get(varName)
    if (!entry) continue

    if (propName === "Parent") {
      const parentVal = rawValue.trim()
      if (ROOT_PARENTS.has(parentVal)) {
        entry.parentVar = "__root__"
      } else {
        entry.parentVar = parentVal
      }
      continue
    }

    if (propName === "Name") {
      const nameStr = rawValue.trim().match(/^"(.*)"$/) ?? rawValue.trim().match(/^'(.*)'$/)
      if (nameStr) entry.node.name = nameStr[1]
      continue
    }

    const value = parseValue(rawValue, propName)
    if (value !== null) {
      entry.node.properties[propName] = value
    }
  }

  for (const [, entry] of entries) {
    if (entry.parentVar && entry.parentVar !== "__root__") {
      const parent = entries.get(entry.parentVar)
      if (parent) {
        parent.node.children.push(entry.node)
      }
    }
  }

  const roots: SerializedInstance[] = []
  for (const [, entry] of entries) {
    if (entry.parentVar === "__root__" || entry.parentVar === null) {
      roots.push(entry.node)
    }
  }

  return roots
}
