export const FREE_GENERATION_LIMIT = 3
export const RELOAD_AMOUNTS_CENTS = [500, 1000, 2500] as const
export const TOKEN_MARKUP = 1.3

export interface ModelTier {
  id: string
  name: string
  openRouterId: string
  inputCostPerMillionTokens: number
  outputCostPerMillionTokens: number
  description: string
}

export const MODELS: Record<string, ModelTier> = {
  spark: {
    id: "spark",
    name: "Spark",
    openRouterId: "z-ai/glm-5",
    inputCostPerMillionTokens: 0.195,
    outputCostPerMillionTokens: 0.195,
    description: "Fast",
  },
  forge: {
    id: "forge",
    name: "Forge",
    openRouterId: "google/gemini-3.1-pro-preview",
    inputCostPerMillionTokens: 2,
    outputCostPerMillionTokens: 12,
    description: "Balanced",
  },
  anvil: {
    id: "anvil",
    name: "Anvil",
    openRouterId: "anthropic/claude-opus-4.6",
    inputCostPerMillionTokens: 15,
    outputCostPerMillionTokens: 75,
    description: "Powerful",
  },
}

export const DEFAULT_MODEL = "forge"

export const COST_PER_FRAME_CENTS: Record<string, number> = {
  spark: 5,
  forge: 25,
  anvil: 50,
}

export const MIN_BALANCE_CENTS = 1

export function calculateCostCents(
  model: ModelTier,
  inputTokens: number,
  outputTokens: number,
): number {
  const inputCost = (inputTokens / 1_000_000) * model.inputCostPerMillionTokens
  const outputCost = (outputTokens / 1_000_000) * model.outputCostPerMillionTokens
  return Math.ceil((inputCost + outputCost) * 100)
}
