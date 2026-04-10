import type {
  WeekendTyreAllocation,
  WeekendTyreAllocationMap,
  WeekendTyreCompound,
  WeekendTyreSessionType,
} from "./tyreAllocation";

export interface TyreAllocationStateShape {
  tyreAllocationsByEventId?: WeekendTyreAllocationMap;
}

export interface WeekendEventReference {
  eventId: string;
}

export interface WeekendSessionTyreUsageEntry {
  compound: WeekendTyreCompound;
  setId: string;
  wearApplied: number;
  sessionType: WeekendTyreSessionType;
}

export interface WeekendSessionTyreUsageResult {
  allocation: WeekendTyreAllocation;
  usedSets: WeekendSessionTyreUsageEntry[];
}

export interface TyreAllocationAvailabilitySummary {
  compound: WeekendTyreCompound;
  total: number;
  available: number;
  locked: number;
  used: number;
}

export interface TyreAllocationWeekendSnapshot {
  eventId: string;
  allocation: WeekendTyreAllocation;
  summary: TyreAllocationAvailabilitySummary[];
}