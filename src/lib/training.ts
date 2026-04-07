import type {
  TrainingEffects,
  TrainingPlan,
  TrainingSkill,
  TrainingTrim,
} from "@/types/training"

function getSlotEfficiency(slotCount: number): number {
  if (slotCount <= 1) return 1
  if (slotCount === 2) return 0.6
  return 0.4
}

function getTrimBonuses(trim: TrainingTrim, efficiency: number) {
  switch (trim) {
    case "quali":
      return {
        qualiBonus: 1.2 * efficiency,
        raceBonus: 0.2 * efficiency,
      }
    case "race":
      return {
        qualiBonus: 0.2 * efficiency,
        raceBonus: 1.2 * efficiency,
      }
    case "balanced":
      return {
        qualiBonus: 0.7 * efficiency,
        raceBonus: 0.7 * efficiency,
      }
    default:
      return {
        qualiBonus: 0,
        raceBonus: 0,
      }
  }
}

function getSkillBonuses(skill: TrainingSkill, efficiency: number) {
  switch (skill) {
    case "cornering":
      return {
        consistencyBonus: 0.3 * efficiency,
        tyreManagementBonus: 0,
        pitstopBonus: 0,
        qualiBonus: 0.5 * efficiency,
        raceBonus: 0.3 * efficiency,
      }
    case "straight-line":
      return {
        consistencyBonus: 0,
        tyreManagementBonus: 0,
        pitstopBonus: 0,
        qualiBonus: 0.6 * efficiency,
        raceBonus: 0.4 * efficiency,
      }
    case "consistency":
      return {
        consistencyBonus: 1 * efficiency,
        tyreManagementBonus: 0,
        pitstopBonus: 0,
        qualiBonus: 0.2 * efficiency,
        raceBonus: 0.4 * efficiency,
      }
    case "tyre-management":
      return {
        consistencyBonus: 0,
        tyreManagementBonus: 1 * efficiency,
        pitstopBonus: 0,
        qualiBonus: 0.1 * efficiency,
        raceBonus: 0.6 * efficiency,
      }
    case "pitstop":
      return {
        consistencyBonus: 0,
        tyreManagementBonus: 0,
        pitstopBonus: 1 * efficiency,
        qualiBonus: 0,
        raceBonus: 0.3 * efficiency,
      }
    default:
      return {
        consistencyBonus: 0,
        tyreManagementBonus: 0,
        pitstopBonus: 0,
        qualiBonus: 0,
        raceBonus: 0,
      }
  }
}

export function calculateTrainingEffects(plan: TrainingPlan): TrainingEffects {
  const slotCount = Math.min(Math.max(plan.slots.length, 1), 3)
  const slotEfficiency = getSlotEfficiency(slotCount)

  let qualiBonus = 0
  let raceBonus = 0
  let consistencyBonus = 0
  let tyreManagementBonus = 0
  let pitstopBonus = 0
  let tyreXpBonus = 0

  for (const slot of plan.slots.slice(0, 3)) {
    const trimBonuses = getTrimBonuses(slot.trim, slotEfficiency)
    const skillBonuses = getSkillBonuses(slot.skill, slotEfficiency)

    qualiBonus += trimBonuses.qualiBonus + skillBonuses.qualiBonus
    raceBonus += trimBonuses.raceBonus + skillBonuses.raceBonus
    consistencyBonus += skillBonuses.consistencyBonus
    tyreManagementBonus += skillBonuses.tyreManagementBonus
    pitstopBonus += skillBonuses.pitstopBonus
    tyreXpBonus += 1 * slotEfficiency
  }

  return {
    qualiBonus,
    raceBonus,
    consistencyBonus,
    tyreManagementBonus,
    pitstopBonus,
    tyreXpBonus,
    slotEfficiency,
  }
}