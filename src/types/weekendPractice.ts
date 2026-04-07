import type { WeekendTyreCompoundId } from "@/types/weekendQualifying";

export interface WeekendPracticeBoosts {
  qualiBonusPct: number;
  raceBonusPct: number;
  consistencyBonusPct: number;
  tyreWearReductionPct: number;
  pitstopBonusPct: number;
}

export interface WeekendPracticeEntry {
  position: number;
  driverId: string;
  driverName: string;
  teamId: string;
  lapTimeMs: number;
  gapToP1Ms: number;
  tyreCompoundId: WeekendTyreCompoundId;
  isPlayer: boolean;
}

export interface WeekendPracticeResult {
  sessionName: string;
  circuitId: string;
  weatherId: string;
  attemptedAt: string;
  playerDriverId: string;
  playerTeamId: string;
  playerPosition: number;
  playerBestLapMs: number;
  tyreCompoundId: WeekendTyreCompoundId;
  boosts: WeekendPracticeBoosts;
  notes: string[];
  entries: WeekendPracticeEntry[];
}