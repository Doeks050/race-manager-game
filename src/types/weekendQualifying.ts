export type WeekendTrainingTrim = "race" | "quali" | "balanced";

export type WeekendTrainingSkill =
  | "cornering"
  | "straight-line"
  | "consistency"
  | "tyre-management"
  | "pitstop";

export type WeekendTyreCompoundId =
  | "ultra-soft"
  | "super-soft"
  | "soft"
  | "medium"
  | "hard"
  | "intermediate"
  | "full-wet";

export interface WeekendTrainingSelection {
  slots: number;
  trim: WeekendTrainingTrim;
  skill: WeekendTrainingSkill;
  compound: WeekendTyreCompoundId;
}

export interface WeekendQualifyingEntry {
  position: number;
  driverId: string;
  driverName: string;
  teamId: string;
  lapTimeMs: number;
  gapToPoleMs: number;
  tyreCompoundId: WeekendTyreCompoundId;
  isPlayer: boolean;
}

export interface WeekendQualifyingResult {
  sessionName: string;
  circuitId: string;
  weatherId: string;
  attemptedAt: string;
  playerDriverId: string;
  playerTeamId: string;
  playerBestLapMs: number;
  playerPosition: number;
  tyreCompoundId: WeekendTyreCompoundId;
  entries: WeekendQualifyingEntry[];
}