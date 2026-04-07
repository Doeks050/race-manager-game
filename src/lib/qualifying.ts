import { calculateRacePerformance } from "@/lib/race"
import { calculateTyrePerformance } from "@/lib/tyre"
import type { CarStats } from "@/types/car"
import type { Driver } from "@/types/driver"
import type {
  QualifyingLapResult,
  QualifyingSessionResult,
} from "@/types/qualifying"
import type { RaceContext } from "@/types/race"
import type { TrainingEffects } from "@/types/training"
import type { TyreCompound } from "@/types/tyre"

function getWeatherQualifyingPenalty(weather: RaceContext["weather"]): number {
  switch (weather) {
    case "sunny":
      return 0
    case "cloudy":
      return 0.15
    case "cold":
      return 0.35
    case "light-rain":
      return 2.5
    case "heavy-rain":
      return 5.5
    case "mixed":
      return 3.25
    default:
      return 0
  }
}

function getRandomLapVariation(consistency: number, focus: number): number {
  const driverControl = (consistency + focus) / 2
  const maxVariation = Math.max(0.15, 1.2 - driverControl * 0.03)
  return (Math.random() * 2 - 1) * maxVariation
}

export function simulateQualifyingLap(
  carStats: CarStats,
  driver: Driver,
  context: RaceContext,
  tyre: TyreCompound,
  trainingEffects?: TrainingEffects
): QualifyingLapResult {
  const racePerformance = calculateRacePerformance(
    carStats,
    driver,
    context,
    trainingEffects
  )

  const effectiveTyreManagement =
    driver.stats.tyreManagement + (trainingEffects?.tyreManagementBonus ?? 0)

  const tyrePerformance = calculateTyrePerformance(
    tyre,
    context.weather,
    context.circuit.tyreStress,
    effectiveTyreManagement
  )

  const baseLapTime = context.circuit.baseLapTime

  const trainingQualiBonus = trainingEffects?.qualiBonus ?? 0
  const trainingConsistencyBonus = trainingEffects?.consistencyBonus ?? 0

  const carBonus = racePerformance.totalPerformance * 0.18
  const driverBonus =
    driver.stats.pace * 0.12 +
    driver.stats.focus * 0.04 +
    trainingQualiBonus

  const tyreBonus = tyrePerformance.paceBonus * 1.4 + tyrePerformance.grip * 0.8

  const weatherPenalty = getWeatherQualifyingPenalty(context.weather)
  const randomFactor = getRandomLapVariation(
    driver.stats.consistency + trainingConsistencyBonus,
    driver.stats.focus
  )

  const lapTime =
    baseLapTime -
    carBonus -
    driverBonus -
    tyreBonus +
    weatherPenalty +
    randomFactor

  return {
    lapTime,
    tyreBonus,
    driverBonus,
    carBonus,
    weatherPenalty,
    randomFactor,
  }
}

export function simulateQualifyingSession(
  carStats: CarStats,
  driver: Driver,
  context: RaceContext,
  tyre: TyreCompound,
  usedSets: number,
  trainingEffects?: TrainingEffects
): QualifyingSessionResult {
  const safeUsedSets = Math.max(1, usedSets)

  const laps = Array.from({ length: safeUsedSets }, () =>
    simulateQualifyingLap(carStats, driver, context, tyre, trainingEffects)
  )

  const bestLap = laps.reduce((best, current) =>
    current.lapTime < best.lapTime ? current : best
  )

  return {
    laps,
    bestLap,
    usedSets: safeUsedSets,
  }
}