import type { DriverRaceStrategy } from "@/types/raceStrategy";
import type { WeekendSchedule } from "@/types/weekendSession";

export type WeekendStatus = "active" | "completed";

export interface DriverWeekendSetup<TrainingPlan = unknown> {
  driverId: string;
  trainingPlan: TrainingPlan | null;
  raceStrategy: DriverRaceStrategy;
}

export interface WeekendPracticeState<PracticeResult = unknown> {
  isCompleted: boolean;
  resultsByDriver: Record<string, PracticeResult | null>;
  completedAt: string | null;
}

export interface WeekendQualifyingState<QualifyingResult = unknown> {
  isCompleted: boolean;
  resultsByDriver: Record<string, QualifyingResult | null>;
  completedAt: string | null;
}

export interface WeekendRaceState<RaceResult = unknown> {
  isCompleted: boolean;
  resultsByDriver: Record<string, RaceResult | null>;
  completedAt: string | null;
}

export interface WeekendPostRaceState<PostRaceResult = unknown> {
  isCompleted: boolean;
  rewardsApplied: boolean;
  resultsByDriver: Record<string, PostRaceResult | null>;
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

  driverIds: string[];
  driverSetups: Record<string, DriverWeekendSetup<TrainingPlan>>;

  schedule: WeekendSchedule;

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
  driverIds?: string[];
}

export interface WeekendSummary {
  id: string;
  season: number;
  round: number;
  circuitId: string;
  weatherId: string;
  status: WeekendStatus;
  activeDriverId: string | null;
  driverIds: string[];
  practiceCompleted: boolean;
  qualifyingCompleted: boolean;
  raceCompleted: boolean;
  postRaceCompleted: boolean;
}