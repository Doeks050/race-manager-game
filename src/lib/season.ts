import type {
  DriverStandingEntry,
  SeasonRoundResult,
  SeasonState,
  TeamStandingEntry,
} from "@/types/season";
import type { WeekendRaceResult } from "@/types/weekendRace";

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

const PLAYER_DRIVER_NAMES: Record<string, string> = {
  "driver-1": "Driver 1",
  "driver-2": "Driver 2",
};

const TEAM_NAMES: Record<string, string> = {
  "starter-team": "Starter Team",
};

function getDriverName(driverId: string): string {
  return PLAYER_DRIVER_NAMES[driverId] ?? driverId;
}

function getTeamName(teamId: string): string {
  return TEAM_NAMES[teamId] ?? teamId;
}

export function getChampionshipPoints(position: number): number {
  return CHAMPIONSHIP_POINTS_TABLE[position] ?? 0;
}

export function createInitialSeasonState(season: number): SeasonState {
  return {
    season,
    currentRound: 1,
    processedWeekendIds: [],
    driverStandings: [],
    teamStandings: [],
    roundResults: [],
  };
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

function upsertDriverStanding(
  standings: DriverStandingEntry[],
  result: SeasonRoundResult
): DriverStandingEntry[] {
  const existing = standings.find((entry) => entry.driverId === result.driverId);

  if (!existing) {
    return sortDriverStandings([
      ...standings,
      {
        driverId: result.driverId,
        driverName: getDriverName(result.driverId),
        teamId: result.teamId,
        points: result.pointsEarned,
        wins: result.finishPosition === 1 ? 1 : 0,
        podiums: result.finishPosition <= 3 ? 1 : 0,
        races: 1,
      },
    ]);
  }

  return sortDriverStandings(
    standings.map((entry) => {
      if (entry.driverId !== result.driverId) {
        return entry;
      }

      return {
        ...entry,
        points: entry.points + result.pointsEarned,
        wins: entry.wins + (result.finishPosition === 1 ? 1 : 0),
        podiums: entry.podiums + (result.finishPosition <= 3 ? 1 : 0),
        races: entry.races + 1,
      };
    })
  );
}

function upsertTeamStanding(
  standings: TeamStandingEntry[],
  result: SeasonRoundResult
): TeamStandingEntry[] {
  const existing = standings.find((entry) => entry.teamId === result.teamId);

  if (!existing) {
    return sortTeamStandings([
      ...standings,
      {
        teamId: result.teamId,
        teamName: getTeamName(result.teamId),
        points: result.pointsEarned,
        wins: result.finishPosition === 1 ? 1 : 0,
        podiums: result.finishPosition <= 3 ? 1 : 0,
        races: 1,
      },
    ]);
  }

  return sortTeamStandings(
    standings.map((entry) => {
      if (entry.teamId !== result.teamId) {
        return entry;
      }

      return {
        ...entry,
        points: entry.points + result.pointsEarned,
        wins: entry.wins + (result.finishPosition === 1 ? 1 : 0),
        podiums: entry.podiums + (result.finishPosition <= 3 ? 1 : 0),
        races: entry.races + 1,
      };
    })
  );
}

export interface ApplyWeekendToSeasonInput {
  seasonState: SeasonState;
  weekendId: string;
  round: number;
  circuitId: string;
  raceResults: WeekendRaceResult[];
}

export function applyWeekendToSeason({
  seasonState,
  weekendId,
  round,
  circuitId,
  raceResults,
}: ApplyWeekendToSeasonInput): SeasonState {
  if (seasonState.processedWeekendIds.includes(weekendId)) {
    return seasonState;
  }

  let nextDriverStandings = seasonState.driverStandings;
  let nextTeamStandings = seasonState.teamStandings;

  const roundResults: SeasonRoundResult[] = raceResults.map((raceResult) => {
    const pointsEarned = getChampionshipPoints(raceResult.finishPosition);

    const roundResult: SeasonRoundResult = {
      round,
      circuitId,
      driverId: raceResult.playerDriverId,
      teamId: raceResult.playerTeamId,
      finishPosition: raceResult.finishPosition,
      pointsEarned,
    };

    nextDriverStandings = upsertDriverStanding(nextDriverStandings, roundResult);
    nextTeamStandings = upsertTeamStanding(nextTeamStandings, roundResult);

    return roundResult;
  });

  return {
    ...seasonState,
    currentRound: Math.max(seasonState.currentRound, round + 1),
    processedWeekendIds: [...seasonState.processedWeekendIds, weekendId],
    roundResults: [...seasonState.roundResults, ...roundResults],
    driverStandings: nextDriverStandings,
    teamStandings: nextTeamStandings,
  };
}