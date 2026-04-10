import type { SeasonState } from "@/types/season"
import type { WeekendPostRaceResult } from "@/types/weekendPostRace"
import type { WeekendPracticeResult } from "@/types/weekendPractice"
import type {
  WeekendQualifyingResult,
  WeekendTrainingSelection,
} from "@/types/weekendQualifying"
import type { WeekendRaceResult } from "@/types/weekendRace"
import type { WeekendState } from "@/types/weekend"
import type { WeekendTyreAllocationMap } from "@/types/tyreAllocation"

export type PersistedWeekendState = WeekendState<
  WeekendTrainingSelection,
  WeekendPracticeResult,
  WeekendQualifyingResult,
  WeekendRaceResult,
  WeekendPostRaceResult
>

export type TeamPartKey =
  | "engine"
  | "gearbox"
  | "chassis"
  | "frontWing"
  | "rearWing"
  | "suspension"
  | "brakes"
  | "cooling"
  | "floor"

export interface AppDriverState {
  id: string
  name: string
  fitness: number
  morale: number
  experience: number
}

export interface AppTeamState {
  id: string
  name: string
  color: string
  sponsor: string
  credits: number
  raceDriverIds: [string, string]
  reserveDriverIds: string[]
  drivers: AppDriverState[]
  parts: Record<TeamPartKey, number>
}

export interface PersistedGameState {
  savedAt: string
  weekend: PersistedWeekendState
  seasonState: SeasonState
  team: AppTeamState
  tyreAllocationsByEventId: WeekendTyreAllocationMap
}