import type { WeekendTyreCompoundId } from "@/types/weekendQualifying";

export interface DriverRaceStrategy {
  stops: number;
  stints: WeekendTyreCompoundId[];
}