import type { TyreType } from "@/types/tyre"
import type {
  WeekendTyreAllocation,
  WeekendTyreAllocationMap,
} from "@/types/tyreAllocation"

export interface TyreAllocationStateShape {
  tyreAllocationsByEventId?: WeekendTyreAllocationMap
}

export interface WeekendEventReference {
  eventId: string
}

export interface WeekendSessionTyreUsageEntry {
  compound: TyreType
  setId: string
  wearApplied: number
  sessionType: "practice" | "qualifying" | "race"
}

export interface WeekendSessionTyreUsageResult {
  allocation: WeekendTyreAllocation
  usedSets: WeekendSessionTyreUsageEntry[]
}

export interface TyreAllocationAvailabilitySummary {
  compound: TyreType
  label: string
  total: number
  available: number
  locked: number
  used: number
}

export interface TyreAllocationWeekendSnapshot {
  eventId: string
  allocation: WeekendTyreAllocation
  summary: TyreAllocationAvailabilitySummary[]
}