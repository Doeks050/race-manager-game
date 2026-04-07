import type { Driver } from "@/types/driver"

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export function applyDriverFatigue(
  driver: Driver,
  fitnessLoss: number,
  moraleChange = 0
): Driver {
  return {
    ...driver,
    state: {
      ...driver.state,
      fitness: clamp(driver.state.fitness - fitnessLoss, 0, 100),
      morale: clamp(driver.state.morale + moraleChange, 0, 100),
    },
  }
}

export function recoverDriverState(
  driver: Driver,
  fitnessGain: number,
  moraleGain: number
): Driver {
  return {
    ...driver,
    state: {
      ...driver.state,
      fitness: clamp(driver.state.fitness + fitnessGain, 0, 100),
      morale: clamp(driver.state.morale + moraleGain, 0, 100),
    },
  }
}