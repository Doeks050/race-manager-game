import { calculateDriverPerformance } from "@/lib/driver"
import type { CarStats } from "@/types/car"
import type { Driver } from "@/types/driver"
import type { RaceContext, WeatherType } from "@/types/race"
import type { TrainingEffects } from "@/types/training"

function getWeatherModifiers(weather: WeatherType) {
  switch (weather) {
    case "sunny":
      return {
        powerModifier: 1,
        gripModifier: 1,
        tyreWearModifier: 1,
        reliabilityModifier: 1,
        focusModifier: 1,
      }
    case "cloudy":
      return {
        powerModifier: 1,
        gripModifier: 1,
        tyreWearModifier: 0.98,
        reliabilityModifier: 1,
        focusModifier: 1,
      }
    case "cold":
      return {
        powerModifier: 1,
        gripModifier: 0.97,
        tyreWearModifier: 0.95,
        reliabilityModifier: 1,
        focusModifier: 0.99,
      }
    case "light-rain":
      return {
        powerModifier: 0.98,
        gripModifier: 0.9,
        tyreWearModifier: 1.05,
        reliabilityModifier: 0.98,
        focusModifier: 0.96,
      }
    case "heavy-rain":
      return {
        powerModifier: 0.95,
        gripModifier: 0.82,
        tyreWearModifier: 1.12,
        reliabilityModifier: 0.95,
        focusModifier: 0.9,
      }
    case "mixed":
      return {
        powerModifier: 0.98,
        gripModifier: 0.92,
        tyreWearModifier: 1.08,
        reliabilityModifier: 0.97,
        focusModifier: 0.94,
      }
    default:
      return {
        powerModifier: 1,
        gripModifier: 1,
        tyreWearModifier: 1,
        reliabilityModifier: 1,
        focusModifier: 1,
      }
  }
}

export function calculateRacePerformance(
  carStats: CarStats,
  driver: Driver,
  context: RaceContext,
  trainingEffects?: TrainingEffects
) {
  const driverPerformance = calculateDriverPerformance(driver)
  const weatherModifiers = getWeatherModifiers(context.weather)

  const adjustedPower = carStats.power * weatherModifiers.powerModifier
  const adjustedGrip = carStats.grip * weatherModifiers.gripModifier
  const adjustedTyreWear = carStats.tyreWear * weatherModifiers.tyreWearModifier
  const adjustedReliability =
    carStats.reliability * weatherModifiers.reliabilityModifier

  const circuitPowerScore = adjustedPower * context.circuit.powerImportance
  const circuitGripScore = adjustedGrip * context.circuit.gripImportance

  const trainingRaceBonus = trainingEffects?.raceBonus ?? 0
  const trainingConsistencyBonus = trainingEffects?.consistencyBonus ?? 0
  const trainingTyreManagementBonus =
    trainingEffects?.tyreManagementBonus ?? 0

  const tyreManagementScore =
    (driver.stats.tyreManagement + trainingTyreManagementBonus) *
    (2 - context.circuit.tyreStress) *
    (2 - weatherModifiers.tyreWearModifier)

  const reliabilityScore =
    adjustedReliability * (2 - context.circuit.reliabilityStress)

  const focusScore =
    driver.stats.focus *
    weatherModifiers.focusModifier *
    (1 + context.circuit.wetSensitivity * 0.05)

  const consistencySupportScore =
    (driver.stats.consistency + trainingConsistencyBonus) * 0.15

  const totalPerformance =
    circuitPowerScore * 0.22 +
    circuitGripScore * 0.22 +
    driverPerformance.overall * 0.26 +
    tyreManagementScore * 0.12 +
    reliabilityScore * 0.07 +
    focusScore * 0.05 +
    consistencySupportScore +
    trainingRaceBonus

  return {
    adjustedPower,
    adjustedGrip,
    adjustedTyreWear,
    adjustedReliability,
    circuitPowerScore,
    circuitGripScore,
    tyreManagementScore,
    reliabilityScore,
    focusScore,
    consistencySupportScore,
    trainingRaceBonus,
    totalPerformance,
  }
}