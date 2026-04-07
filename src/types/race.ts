export type Circuit = {
  id: string
  name: string
  powerImportance: number
  gripImportance: number
  tyreStress: number
  reliabilityStress: number
  overtakeChance: number
  crashRisk: number
  safetyCarChance: number
  wetSensitivity: number
  baseLapTime: number
  raceLaps: number
  pitLoss: number
}

export type WeatherType =
  | "sunny"
  | "cloudy"
  | "cold"
  | "light-rain"
  | "heavy-rain"
  | "mixed"

export type RaceContext = {
  circuit: Circuit
  weather: WeatherType
}