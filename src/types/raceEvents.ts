export type RaceEventType =
  | "driver-mistake"
  | "puncture"
  | "engine-issue"
  | "safety-car"

export type RaceEvent = {
  lapNumber: number
  type: RaceEventType
  timeDelta: number
  description: string
}