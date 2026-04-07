import { calculateRacePerformance } from "@/lib/race"
import { rollRaceEvent } from "@/lib/raceEvents"
import { calculateTyrePerformance } from "@/lib/tyre"
import type { CarStats } from "@/types/car"
import type { Driver } from "@/types/driver"
import type { RaceContext } from "@/types/race"
import type { RaceEvent } from "@/types/raceEvents"
import type {
  RaceLapResult,
  RaceSimulationResult,
  RaceStintResult,
} from "@/types/raceSim"
import type { TrainingEffects } from "@/types/training"
import type { RaceStintPlan, TyreCompound } from "@/types/tyre"

function getLapTimeVariance(consistency: number, focus: number) {
  const control = (consistency + focus) / 2
  const variance = Math.max(0.08, 0.7 - control * 0.015)
  return (Math.random() * 2 - 1) * variance
}

function getTyreWearPenalty(tyreWear: number) {
  if (tyreWear < 20) return 0
  if (tyreWear < 40) return (tyreWear - 20) * 0.01
  if (tyreWear < 60) return 0.2 + (tyreWear - 40) * 0.02
  if (tyreWear < 80) return 0.6 + (tyreWear - 60) * 0.035
  return 1.3 + (tyreWear - 80) * 0.06
}

function getCompoundById(tyres: TyreCompound[], tyreId: string): TyreCompound {
  const tyre = tyres.find((item) => item.id === tyreId)

  if (!tyre) {
    throw new Error(`Tyre compound not found: ${tyreId}`)
  }

  return tyre
}

export function simulateRace(
  carStats: CarStats,
  driver: Driver,
  context: RaceContext,
  tyres: TyreCompound[],
  strategy: RaceStintPlan[],
  trainingEffects?: TrainingEffects
): RaceSimulationResult {
  const racePerformance = calculateRacePerformance(
    carStats,
    driver,
    context,
    trainingEffects
  )

  const stints: RaceStintResult[] = []
  const events: RaceEvent[] = []

  let totalTime = 0
  let totalLaps = 0
  let pitStops = 0
  let pitTimeLoss = 0
  let globalLapNumber = 1

  for (let stintIndex = 0; stintIndex < strategy.length; stintIndex++) {
    const plannedStint = strategy[stintIndex]
    const tyre = getCompoundById(tyres, plannedStint.tyreId)

    const effectiveTyreManagement =
      driver.stats.tyreManagement + (trainingEffects?.tyreManagementBonus ?? 0)

    const tyrePerformance = calculateTyrePerformance(
      tyre,
      context.weather,
      context.circuit.tyreStress,
      effectiveTyreManagement
    )

    let currentTyreWear = 0
    let stintTime = 0
    const lapResults: RaceLapResult[] = []

    for (let lap = 0; lap < plannedStint.laps; lap++) {
      if (globalLapNumber > context.circuit.raceLaps) {
        break
      }

      currentTyreWear = Math.min(
        100,
        currentTyreWear + tyrePerformance.wearPerLap * 4
      )

      const wearPenalty = getTyreWearPenalty(currentTyreWear)
      const trainingRaceBonus = trainingEffects?.raceBonus ?? 0

      const baseLapTime =
        context.circuit.baseLapTime -
        racePerformance.totalPerformance * 0.12 -
        tyrePerformance.paceBonus * 0.8 -
        trainingRaceBonus * 0.25

      const lapVariance = getLapTimeVariance(
        driver.stats.consistency + (trainingEffects?.consistencyBonus ?? 0),
        driver.stats.focus
      )

      const event = rollRaceEvent(
        globalLapNumber,
        driver,
        context,
        currentTyreWear
      )

      const eventDelta = event?.timeDelta ?? 0

      const lapTime = baseLapTime + wearPenalty + lapVariance + eventDelta

      if (event) {
        events.push(event)
      }

      lapResults.push({
        lapNumber: globalLapNumber,
        tyreId: tyre.id,
        tyreWear: currentTyreWear,
        lapTime,
        event: event ?? undefined,
      })

      stintTime += lapTime
      totalTime += lapTime
      totalLaps += 1
      globalLapNumber += 1
    }

    stints.push({
      tyreId: tyre.id,
      plannedLaps: plannedStint.laps,
      completedLaps: lapResults.length,
      totalTime: stintTime,
      laps: lapResults,
    })

    const isLastStint = stintIndex === strategy.length - 1
    const raceFinished = globalLapNumber > context.circuit.raceLaps

    if (!isLastStint && !raceFinished) {
      pitStops += 1
      pitTimeLoss += context.circuit.pitLoss
      totalTime += context.circuit.pitLoss
    }
  }

  return {
    totalTime,
    pitStops,
    pitTimeLoss,
    averageLap: totalLaps > 0 ? totalTime / totalLaps : 0,
    stints,
    events,
  }
}