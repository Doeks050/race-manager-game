import type { TyreType } from "@/types/tyre"

export type WeekendTyreSetStatus = "available" | "used" | "locked"

export type WeekendTyreSessionType = "practice" | "qualifying" | "race"

export interface WeekendTyreSet {
  id: string
  compound: TyreType
  label: string
  wear: number
  status: WeekendTyreSetStatus
  usedInSessions: WeekendTyreSessionType[]
}

export interface WeekendTyreAllocation {
  eventId: string
  sets: WeekendTyreSet[]
}

export type WeekendTyreAllocationMap = Record<string, WeekendTyreAllocation>

export interface WeekendTyreAllocationEntry {
  compound: TyreType
  count: number
}

export interface WeekendTyreAllocationTemplate {
  dry: WeekendTyreAllocationEntry[]
  wet: WeekendTyreAllocationEntry[]
}

export interface WeekendTyreAllocationSummaryRow {
  compound: TyreType
  label: string
  total: number
  available: number
  used: number
  locked: number
}