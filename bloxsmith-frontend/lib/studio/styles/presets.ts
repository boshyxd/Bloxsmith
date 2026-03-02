export interface StylePreset {
  id: string
  name: string
  description: string
  requiresStudio?: boolean
}

export const DEFAULT_STYLE_ID = "stud"

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: "stud",
    name: "Stud",
    description: "Image-driven simulator UI with stud textures and heavy outlines",
  },
  {
    id: "adaptive",
    name: "Adaptive",
    description: "Matches the styling of your existing in-game UIs",
    requiresStudio: true,
  },
]
