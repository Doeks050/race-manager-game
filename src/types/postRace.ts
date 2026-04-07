import type { CarParts } from "@/types/car"

export type PostRaceRewards = {
  finishingPosition: number
  creditsEarned: number
  driverXpEarned: number
  moraleChange: number
}

export type PartWearResult = {
  updatedParts: CarParts
  wearByPart: Partial<Record<keyof CarParts, number>>
}

export type PostRaceResult = {
  rewards: PostRaceRewards
  partWear: PartWearResult
}