export type DriverStats = {
  pace: number
  consistency: number
  racecraft: number
  tyreManagement: number
  focus: number
}

export type DriverState = {
  fitness: number
  morale: number
  experience: number
}

export type Driver = {
  id: string
  name: string
  stats: DriverStats
  state: DriverState
}