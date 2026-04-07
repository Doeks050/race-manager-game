export interface ChampionshipPointsResult {
  position: number;
  points: number;
}

export interface DriverStandingEntry {
  driverId: string;
  driverName: string;
  teamId: string;
  points: number;
  wins: number;
  podiums: number;
  races: number;
}

export interface TeamStandingEntry {
  teamId: string;
  teamName: string;
  points: number;
  wins: number;
  podiums: number;
  races: number;
}

export interface SeasonRoundResult {
  round: number;
  circuitId: string;
  driverId: string;
  teamId: string;
  finishPosition: number;
  pointsEarned: number;
}

export interface SeasonState {
  season: number;
  currentRound: number;
  processedWeekendIds: string[];
  driverStandings: DriverStandingEntry[];
  teamStandings: TeamStandingEntry[];
  roundResults: SeasonRoundResult[];
}