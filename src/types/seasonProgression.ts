import type { WeekendPartWear } from "@/types/weekendPostRace";

export interface DriverProgressionState {
  driverId: string;
  name: string;
  xp: number;
  morale: number;
  fitness: number;
  championshipPoints: number;
  racesCompleted: number;
  podiums: number;
  wins: number;
}

export interface TeamProgressionState {
  teamId: string;
  name: string;
  credits: number;
  championshipPoints: number;
  racesCompleted: number;
  cumulativePartWear: WeekendPartWear;
}

export interface StandingsEntry {
  id: string;
  name: string;
  points: number;
  extraLabel?: string;
}

export interface SeasonProgressionState {
  season: number;
  currentRound: number;
  playerTeam: TeamProgressionState;
  playerDrivers: DriverProgressionState[];
  driverStandings: StandingsEntry[];
  teamStandings: StandingsEntry[];
}