export type WeekendSessionName =
  | "pre_practice_management"
  | "practice"
  | "pre_qualifying_management"
  | "qualifying"
  | "parc_ferme"
  | "race"
  | "post_race_management";

export interface WeekendSchedule {
  practiceAt: string;
  qualifyingAt: string;
  raceAt: string;
}

export interface WeekendPermissions {
  canUpgrade: boolean;
  canChangeDriver: boolean;
  canRecoverDriver: boolean;
  canEditTraining: boolean;
  canEditStrategy: boolean;
}

export interface WeekendSessionInfo {
  currentSession: WeekendSessionName;
  nextSession: WeekendSessionName | null;
  nextSessionStartsAt: string | null;
  countdownMs: number | null;
  permissions: WeekendPermissions;
}