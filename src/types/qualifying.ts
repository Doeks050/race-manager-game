export type QualifyingLapResult = {
  lapTime: number
  tyreBonus: number
  driverBonus: number
  carBonus: number
  weatherPenalty: number
  randomFactor: number
}

export type QualifyingSessionResult = {
  laps: QualifyingLapResult[]
  bestLap: QualifyingLapResult
  usedSets: number
}