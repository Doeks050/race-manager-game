import type { TyreType } from "@/types/tyre"

export type StrategyPreset = {
  id: string
  name: string
  description: string
  startTyreId: TyreType
  stints: {
    tyreId: TyreType
    laps: number
  }[]
}