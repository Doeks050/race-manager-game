import type { CarParts } from "@/types/car"
import type { Driver } from "@/types/driver"
import type { PostRaceResult, PostRaceRewards } from "@/types/postRace"
import type { Team } from "@/types/team"

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export function calculateRaceRewards(finishingPosition: number): PostRaceRewards {
  const normalizedPosition = clamp(finishingPosition, 1, 20)

  let creditsEarned = 0
  let driverXpEarned = 0
  let moraleChange = 0

  if (normalizedPosition === 1) {
    creditsEarned = 12000
    driverXpEarned = 120
    moraleChange = 8
  } else if (normalizedPosition <= 3) {
    creditsEarned = 9000
    driverXpEarned = 90
    moraleChange = 5
  } else if (normalizedPosition <= 10) {
    creditsEarned = 5000
    driverXpEarned = 55
    moraleChange = 2
  } else {
    creditsEarned = 2500
    driverXpEarned = 30
    moraleChange = -2
  }

  return {
    finishingPosition: normalizedPosition,
    creditsEarned,
    driverXpEarned,
    moraleChange,
  }
}

export function applyPartWear(parts: CarParts): {
  updatedParts: CarParts
  wearByPart: Partial<Record<keyof CarParts, number>>
} {
  const wearByPart: Partial<Record<keyof CarParts, number>> = {
    engine: 1,
    gearbox: 1,
    brakes: 1,
    cooling: 1,
    suspension: 1,
  }

  const updatedParts: CarParts = {
    ...parts,
    engine: Math.max(1, parts.engine - (wearByPart.engine ?? 0)),
    gearbox: Math.max(1, parts.gearbox - (wearByPart.gearbox ?? 0)),
    chassis: Math.max(1, parts.chassis - (wearByPart.chassis ?? 0)),
    frontWing: Math.max(1, parts.frontWing - (wearByPart.frontWing ?? 0)),
    rearWing: Math.max(1, parts.rearWing - (wearByPart.rearWing ?? 0)),
    suspension: Math.max(1, parts.suspension - (wearByPart.suspension ?? 0)),
    brakes: Math.max(1, parts.brakes - (wearByPart.brakes ?? 0)),
    cooling: Math.max(1, parts.cooling - (wearByPart.cooling ?? 0)),
    floor: Math.max(1, parts.floor - (wearByPart.floor ?? 0)),
  }

  return {
    updatedParts,
    wearByPart,
  }
}

export function applyDriverPostRaceState(
  driver: Driver,
  xpEarned: number,
  moraleChange: number
): Driver {
  return {
    ...driver,
    state: {
      ...driver.state,
      experience: driver.state.experience + xpEarned,
      morale: clamp(driver.state.morale + moraleChange, 0, 100),
      fitness: clamp(driver.state.fitness - 12, 0, 100),
    },
  }
}

export function applyPostRaceToTeam(
  team: Team,
  updatedDriver: Driver,
  finishingPosition: number
): PostRaceResult & { updatedTeam: Team } {
  const rewards = calculateRaceRewards(finishingPosition)
  const partWear = applyPartWear(team.parts)

  const finalDriver = applyDriverPostRaceState(
    updatedDriver,
    rewards.driverXpEarned,
    rewards.moraleChange
  )

  const updatedTeam: Team = {
    ...team,
    credits: team.credits + rewards.creditsEarned,
    parts: partWear.updatedParts,
    drivers: team.drivers.map((driver) =>
      driver.id === finalDriver.id ? finalDriver : driver
    ),
  }

  return {
    rewards,
    partWear,
    updatedTeam,
  }
}