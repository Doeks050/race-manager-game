import type { Driver } from "@/types/driver"
import type { RaceContext } from "@/types/race"
import type { RaceEvent } from "@/types/raceEvents"

function roll(chance: number) {
  return Math.random() < chance
}

export function rollRaceEvent(
  lapNumber: number,
  driver: Driver,
  context: RaceContext,
  currentTyreWear: number
): RaceEvent | null {
  const focusFactor = Math.max(0, 1 - driver.stats.focus * 0.015)
  const consistencyFactor = Math.max(0, 1 - driver.stats.consistency * 0.012)
  const reliabilityFactor = context.circuit.reliabilityStress
  const crashFactor = context.circuit.crashRisk
  const safetyCarFactor = context.circuit.safetyCarChance
  const wearFactor = currentTyreWear >= 75 ? 1.8 : currentTyreWear >= 55 ? 1.3 : 1

  const driverMistakeChance = 0.012 * focusFactor * consistencyFactor * (1 + crashFactor)
  if (roll(driverMistakeChance)) {
    const timeDelta = 0.8 + Math.random() * 1.8
    return {
      lapNumber,
      type: "driver-mistake",
      timeDelta,
      description: "Driver mistake cost time in the sector.",
    }
  }

  const punctureChance = 0.004 * wearFactor
  if (roll(punctureChance)) {
    const timeDelta = 6 + Math.random() * 4
    return {
      lapNumber,
      type: "puncture",
      timeDelta,
      description: "Tyre puncture caused major lap time loss.",
    }
  }

  const engineIssueChance = 0.006 * (1 + reliabilityFactor)
  if (roll(engineIssueChance)) {
    const timeDelta = 2 + Math.random() * 3
    return {
      lapNumber,
      type: "engine-issue",
      timeDelta,
      description: "Engine issue reduced pace this lap.",
    }
  }

  const safetyCarChance = 0.003 * (1 + safetyCarFactor)
  if (roll(safetyCarChance)) {
    const timeDelta = -1.5 - Math.random() * 1.5
    return {
      lapNumber,
      type: "safety-car",
      timeDelta,
      description: "Safety car compressed the field and reduced lap loss.",
    }
  }

  return null
}