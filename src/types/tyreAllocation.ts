export type WeekendTyreCompound =
  | "ultra-soft"
  | "super-soft"
  | "soft"
  | "medium"
  | "hard"
  | "intermediate"
  | "full-wet";

export type WeekendTyreSetStatus = "available" | "used" | "locked";

export type WeekendTyreSessionType = "practice" | "qualifying" | "race";

export interface WeekendTyreSet {
  id: string;
  compound: WeekendTyreCompound;
  label: string;
  wear: number;
  status: WeekendTyreSetStatus;
  usedInSessions: WeekendTyreSessionType[];
}

export interface WeekendTyreAllocation {
  eventId: string;
  sets: WeekendTyreSet[];
}

export type WeekendTyreAllocationMap = Record<string, WeekendTyreAllocation>;

export interface WeekendTyreAllocationEntry {
  compound: WeekendTyreCompound;
  count: number;
}

export interface WeekendTyreAllocationTemplate {
  dry: WeekendTyreAllocationEntry[];
  wet: WeekendTyreAllocationEntry[];
}