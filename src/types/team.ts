import type { CarParts } from "@/types/car"
import type { Driver } from "@/types/driver"

export type Team = {
  id: string
  name: string
  color: string
  sponsor: string
  credits: number
  parts: CarParts
  drivers: Driver[]
  activeDriverId: string
}