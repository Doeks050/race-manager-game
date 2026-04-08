import { getAllFieldDrivers, getAllFieldTeams } from "@/data/fullField";
import type {
  DriverStandingEntry,
  SeasonRoundResult,
  SeasonState,
  TeamStandingEntry,
} from "@/types/season";

const CHAMPIONSHIP_POINTS_TABLE: Record<number, number> = {
  1: 25,
  2: 18,
  3: 15,
  4: 12,
  5: 10,
  6: 8,
  7: 6,
  8: 4,
  9: 2,
  10: 1,
};

export function getChampionshipPoints(position: number): number {
  return CHAMPIONSHIP_POINTS_TABLE[position] ?? 0;
}

function sortDriverStandings(standings: DriverStandingEntry[]): DriverStandingEntry[] {
  return [...standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.podiums !== a.podiums) return b.podiums - a.podiums;
    return a.driverName.localeCompare(b.driverName);
  });
}

function sortTeamStandings(standings: TeamStandingEntry[]): TeamStandingEntry[] {
  return [...standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.podiums !== a.podiums) return b.podiums - a.podiums;
    return a.teamName.localeCompare(b.teamName);
  });
}

export function createInitialSeasonState(season: number): SeasonState {
  const driverStandings: DriverStandingEntry[] = getAllFieldDrivers().map((driver) => ({
    driverId: driver.id,
    driverName: driver.name,
    teamId: driver.teamId,
    teamName: driver.teamName,
    points: 0,
    wins: 0,
    podiums: 0,
    races: 0,
  }));

  const teamStandings: TeamStandingEntry[] = getAllFieldTeams().map((team) => ({
    teamId: team.teamId,
    teamName: team.teamName,
    points: 0,
    wins: 0,
    podiums: 0,
    races: 0,
  }));

  return {
    season,
    currentRound: 1,
    processedWeekendIds: [],
    driverStandings: sortDriverStandings(driverStandings),
    teamStandings: sortTeamStandings(teamStandings),
    roundResults: [],
  };
}

export interface ApplyWeekendToSeasonInput {
  seasonState: SeasonState;
  weekendId: string;
  round: number;
  circuitId: string;
  roundResults: SeasonRoundResult[];
}

export function applyWeekendToSeason({
  seasonState,
  weekendId,
  round,
  roundResults,
}: ApplyWeekendToSeasonInput): SeasonState {
  if (seasonState.processedWeekendIds.includes(weekendId)) {
    return seasonState;
  }

  const nextDriverStandings = seasonState.driverStandings.map((entry) => {
    const roundResult = roundResults.find((result) => result.driverId === entry.driverId);

    if (!roundResult) {
      return entry;
    }

    return {
      ...entry,
      points: entry.points + roundResult.pointsEarned,
      wins: entry.wins + (roundResult.finishPosition === 1 ? 1 : 0),
      podiums: entry.podiums + (roundResult.finishPosition <= 3 ? 1 : 0),
      races: entry.races + 1,
    };
  });

  const nextTeamStandings = seasonState.teamStandings.map((entry) => {
    const teamResults = roundResults.filter((result) => result.teamId === entry.teamId);

    if (teamResults.length === 0) {
      return entry;
    }

    const pointsEarned = teamResults.reduce((sum, result) => sum + result.pointsEarned, 0);
    const wins = teamResults.filter((result) => result.finishPosition === 1).length;
    const podiums = teamResults.filter((result) => result.finishPosition <= 3).length;

    return {
      ...entry,
      points: entry.points + pointsEarned,
      wins: entry.wins + wins,
      podiums: entry.podiums + podiums,
      races: entry.races + 1,
    };
  });

  return {
    ...seasonState,
    currentRound: Math.max(seasonState.currentRound, round + 1),
    processedWeekendIds: [...seasonState.processedWeekendIds, weekendId],
    driverStandings: sortDriverStandings(nextDriverStandings),
    teamStandings: sortTeamStandings(nextTeamStandings),
    roundResults: [...seasonState.roundResults, ...roundResults],
  };
}