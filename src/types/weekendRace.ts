import type { DriverRaceStrategy } from "@/types/raceStrategy";
import type { WeekendPracticeBoosts } from "@/types/weekendPractice";

export interface WeekendRaceEvent {
  lap: number;
  type: "driver-mistake" | "puncture" | "engine-issue" | "safety-car";
  label: string;
  timeDeltaMs: number;
}

export interface WeekendRaceStint {
  index: number;
  tyreCompoundId: string;
  startLap: number;
  endLap: number;
  lapCount: number;
  averageLapTimeMs: number;
  totalTimeMs: number;
}

export interface WeekendRaceResult {
  sessionName: string;
  circuitId: string;
  weatherId: string;
  attemptedAt: string;

  playerDriverId: string;
  playerTeamId: string;

  startPosition: number;
  finishPosition: number;
  positionsGained: number;

  totalRaceTimeMs: number;
  averageLapTimeMs: number;

  raceStrategy: DriverRaceStrategy;
  practiceBoosts: WeekendPracticeBoosts | null;

  stints: WeekendRaceStint[];
  events: WeekendRaceEvent[];
}