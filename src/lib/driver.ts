import type { Driver } from "@/types/driver"

export function calculateDriverPerformance(driver: Driver) {
  const paceScore =
    driver.stats.pace * 0.35 +
    driver.stats.consistency * 0.2 +
    driver.stats.racecraft * 0.15 +
    driver.stats.tyreManagement * 0.1 +
    driver.stats.focus * 0.2

  const fitnessModifier = driver.state.fitness / 100
  const moraleModifier = 1 + (driver.state.morale - 50) / 500
  const experienceModifier = 1 + driver.state.experience / 1000

  const overall =
    paceScore * fitnessModifier * moraleModifier * experienceModifier

  return {
    paceScore,
    fitnessModifier,
    moraleModifier,
    experienceModifier,
    overall,
  }
}