import type { StrategyPreset } from "@/types/strategy"
import type { RaceStintPlan } from "@/types/tyre"

export function getStrategyById(
  strategies: StrategyPreset[],
  strategyId: string
): StrategyPreset {
  const strategy = strategies.find((item) => item.id === strategyId)

  if (!strategy) {
    throw new Error(`Strategy not found: ${strategyId}`)
  }

  return strategy
}

export function buildRaceStrategy(strategy: StrategyPreset): RaceStintPlan[] {
  return strategy.stints.map((stint) => ({
    tyreId: stint.tyreId,
    laps: stint.laps,
  }))
}