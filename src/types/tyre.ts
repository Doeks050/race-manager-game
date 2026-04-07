export type TyreType =
  | "ultra-soft"
  | "super-soft"
  | "soft"
  | "medium"
  | "hard"
  | "intermediate"
  | "full-wet"

export type TyreCompound = {
  id: TyreType
  name: string
  paceBonus: number
  wearRate: number
  durability: number
  wetGrip: number
  dryGrip: number
  suitableForWet: boolean
}

export type RaceStintPlan = {
  tyreId: TyreType
  laps: number
}