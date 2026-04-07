import type { CarParts } from "@/types/car"
import type { Team } from "@/types/team"

type UpgradablePart = keyof CarParts

export function getUpgradeCost(currentValue: number): number {
  return 1000 + currentValue * 250
}

export function canAffordUpgrade(teamCredits: number, currentValue: number) {
  return teamCredits >= getUpgradeCost(currentValue)
}

export function upgradeTeamPart(team: Team, part: UpgradablePart): Team {
  const currentValue = team.parts[part]
  const cost = getUpgradeCost(currentValue)

  if (team.credits < cost) {
    throw new Error(`Not enough credits to upgrade ${part}`)
  }

  return {
    ...team,
    credits: team.credits - cost,
    parts: {
      ...team.parts,
      [part]: currentValue + 1,
    },
  }
}