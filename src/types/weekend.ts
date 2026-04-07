import type { WeekendSchedule } from "@/types/weekendSession";

export type WeekendStatus = "active" | "completed";

export interface WeekendPracticeState<PracticeResult = unknown> {
  isCompleted: boolean;
  result: PracticeResult | null;
  completedAt: string | null;
}

export interface WeekendQualifyingState<QualifyingResult = unknown> {
  isCompleted: boolean;
  result: QualifyingResult | null;
  completedAt: string | null;
}

export interface WeekendRaceState<RaceResult = unknown> {
  isCompleted: boolean;
  result: RaceResult | null;
  completedAt: string | null;
}

export interface WeekendPostRaceState<PostRaceResult = unknown> {
  isCompleted: boolean;
  rewardsApplied: boolean;
  result: PostRaceResult | null;
  completedAt: string | null;
}

export interface WeekendState<
  TrainingPlan = unknown,
  PracticeResult = unknown,
  QualifyingResult = unknown,
  RaceResult = unknown,
  PostRaceResult = unknown
> {
  id: string;
  season: number;
  round: number;

  teamId: string;
  circuitId: string;
  weatherId: string;

  status: WeekendStatus;
  activeDriverId: string | null;

  schedule: WeekendSchedule;

  trainingPlan: TrainingPlan | null;
  strategyPresetId: string | null;

  practice: WeekendPracticeState<PracticeResult>;
  qualifying: WeekendQualifyingState<QualifyingResult>;
  race: WeekendRaceState<RaceResult>;
  postRace: WeekendPostRaceState<PostRaceResult>;

  createdAt: string;
  updatedAt: string;
}

export interface CreateWeekendInput {
  id: string;
  season: number;
  round: number;
  teamId: string;
  circuitId: string;
  weatherId: string;
  schedule: WeekendSchedule;
  activeDriverId?: string | null;
}

export interface WeekendSummary {
  id: string;
  season: number;
  round: number;
  circuitId: string;
  weatherId: string;
  status: WeekendStatus;
  activeDriverId: string | null;
  strategyPresetId: string | null;
  hasTrainingPlan: boolean;
  practiceCompleted: boolean;
  qualifyingCompleted: boolean;
  raceCompleted: boolean;
  postRaceCompleted: boolean;
}