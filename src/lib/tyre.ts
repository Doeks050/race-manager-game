import type { WeatherType } from "@/types/race"
import type { TyreCompound } from "@/types/tyre"

export function getTyreGripForWeather(
  tyre: TyreCompound,
  weather: WeatherType
): number {
  switch (weather) {
    case "sunny":
    case "cloudy":
    case "cold":
      return tyre.dryGrip

    case "light-rain":
      return tyre.suitableForWet
        ? tyre.wetGrip
        : tyre.wetGrip * 0.75

    case "heavy-rain":
      return tyre.suitableForWet
        ? tyre.wetGrip
        : tyre.wetGrip * 0.45

    case "mixed":
      return (tyre.dryGrip + tyre.wetGrip) / 2

    default:
      return tyre.dryGrip
  }
}

export function calculateTyreWearPerLap(
  tyre: TyreCompound,
  tyreStress: number,
  driverTyreManagement: number,
  weather: WeatherType
): number {
  const baseWear = tyre.wearRate * tyreStress

  const tyreManagementReduction =
    1 - Math.min(driverTyreManagement * 0.01, 0.2)

  const weatherMultiplier =
    weather === "heavy-rain"
      ? 1.08
      : weather === "light-rain"
        ? 1.04
        : weather === "mixed"
          ? 1.06
          : 1

  return baseWear * tyreManagementReduction * weatherMultiplier
}

export function calculateTyrePerformance(
  tyre: TyreCompound,
  weather: WeatherType,
  tyreStress: number,
  driverTyreManagement: number
) {
  const grip = getTyreGripForWeather(tyre, weather)

  const wearPerLap = calculateTyreWearPerLap(
    tyre,
    tyreStress,
    driverTyreManagement,
    weather
  )

  const estimatedLife = tyre.durability / wearPerLap

  return {
    grip,
    wearPerLap,
    estimatedLife,
    paceBonus: tyre.paceBonus,
  }
}