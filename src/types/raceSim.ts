import type { RaceEvent } from "@/types/raceEvents"
import type { TyreType } from "@/types/tyre"

export type RaceLapResult = {
  lapNumber: number
  tyreId: TyreType
  tyreWear: number
  lapTime: number
  event?: RaceEvent
}

export type RaceStintResult = {
  tyreId: TyreType
  plannedLaps: number
  completedLaps: number
  totalTime: number
  laps: RaceLapResult[]
}

export type RaceSimulationResult = {
  totalTime: number
  pitStops: number
  pitTimeLoss: number
  averageLap: number
  stints: RaceStintResult[]
  events: RaceEvent[]
}