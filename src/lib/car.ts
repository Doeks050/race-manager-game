import { CarParts, CarStats } from "@/types/car"

export function calculateCarStats(parts: CarParts): CarStats {
  const power =
    parts.engine * 0.7 +
    parts.rearWing * 0.1 +
    parts.cooling * 0.2

  const acceleration =
    parts.engine * 0.6 +
    parts.gearbox * 0.4

  const grip =
    parts.frontWing * 0.3 +
    parts.rearWing * 0.3 +
    parts.suspension * 0.25 +
    parts.floor * 0.15

  const tyreWear =
    parts.suspension * 0.4 +
    parts.chassis * 0.3 +
    parts.cooling * 0.3

  const reliability =
    parts.engine * 0.4 +
    parts.gearbox * 0.3 +
    parts.cooling * 0.3

  const balance =
    parts.chassis * 0.3 +
    parts.suspension * 0.2 +
    parts.brakes * 0.2 +
    parts.frontWing * 0.15 +
    parts.rearWing * 0.15

  return {
    power,
    acceleration,
    grip,
    tyreWear,
    reliability,
    balance,
  }
}