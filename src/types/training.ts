import type { TyreType } from "@/types/tyre"

export type TrainingTrim = "race" | "quali" | "balanced"

export type TrainingSkill =
  | "cornering"
  | "straight-line"
  | "consistency"
  | "tyre-management"
  | "pitstop"

export type TrainingSlot = {
  trim: TrainingTrim
  skill: TrainingSkill
  compound: TyreType
}

export type TrainingPlan = {
  slots: TrainingSlot[]
}

export type TrainingEffects = {
  qualiBonus: number
  raceBonus: number
  consistencyBonus: number
  tyreManagementBonus: number
  pitstopBonus: number
  tyreXpBonus: number
  slotEfficiency: number
}