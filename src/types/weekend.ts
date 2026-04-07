import type { Circuit } from "./car";
import type { WeatherType } from "./race";
import type { WeekendSchedule } from "./weekendSession";
import type {
  WeekendPracticeResult,
  WeekendPracticeState,
} from "./weekendPractice";
import type {
  WeekendQualifyingResult,
  WeekendQualifyingState,
  WeekendTrainingSelection,
} from "./weekendQualifying";
import type { WeekendRaceResult, WeekendRaceState } from "./weekendRace";
import type {
  WeekendPostRaceResult,
  WeekendPostRaceState,
} from "./weekendPostRace";

export type CreateWeekendInput = {
  id: string;
  seasonId: string;
  teamId: string;
  round: number;
  teamName: string;
  circuit: Circuit;
  weather: WeatherType;
  activeDriverId: string;
  strategyPresetId: string;
  trainingSelection: WeekendTrainingSelection;
  schedule: WeekendSchedule;
};

export type WeekendState = {
  id: string;
  seasonId: string;
  teamId: string;
  round: number;
  teamName: string;
  circuit: Circuit;
  weather: WeatherType;
  activeDriverId: string;
  strategyPresetId: string;
  trainingSelection: WeekendTrainingSelection;
  schedule: WeekendSchedule;

  practice: WeekendPracticeState;
  qualifying: WeekendQualifyingState;
  race: WeekendRaceState;
  postRace: WeekendPostRaceState;

  rewardsApplied: boolean;
};

export type WeekendSummary = {
  id: string;
  round: number;
  circuitName: string;
  weather: WeatherType;
  activeDriverId: string;
  strategyPresetId: string;
  practiceCompleted: boolean;
  qualifyingCompleted: boolean;
  raceCompleted: boolean;
  postRaceCompleted: boolean;
  rewardsApplied: boolean;
  practiceResult: WeekendPracticeResult | null;
  qualifyingResult: WeekendQualifyingResult | null;
  raceResult: WeekendRaceResult | null;
  postRaceResult: WeekendPostRaceResult | null;
};