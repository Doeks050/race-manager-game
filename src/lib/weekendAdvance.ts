import { circuits } from "@/data/circuits";
import { getCalendarEntryForRound } from "@/data/weekendCalendar";
import { createWeekend } from "@/lib/weekend";
import type { SeasonState } from "@/types/season";
import type { Team } from "@/types/team";
import type { WeatherType } from "@/types/race";
import type { WeekendState } from "@/types/weekend";

type GenerateNextWeekendInput = {
  currentWeekend: WeekendState;
  season: SeasonState;
  team: Team;
};

type AdvanceWeekendResult = {
  season: SeasonState;
  weekend: WeekendState;
};

function getNextRound(currentRound: number): number {
  return currentRound + 1;
}

function pickWeatherForRound(round: number): WeatherType {
  const pool: WeatherType[] = [
    "sunny",
    "cloudy",
    "cold",
    "light-rain",
    "heavy-rain",
    "mixed",
  ];

  return pool[(round - 1) % pool.length];
}

function buildNextWeekendSchedule(baseDate: Date) {
  const fridayPractice = new Date(baseDate);
  fridayPractice.setHours(12, 0, 0, 0);

  const preQualifyingManagement = new Date(baseDate);
  preQualifyingManagement.setHours(15, 0, 0, 0);

  const saturdayQualifying = new Date(baseDate);
  saturdayQualifying.setDate(saturdayQualifying.getDate() + 1);
  saturdayQualifying.setHours(14, 0, 0, 0);

  const saturdayParcFerme = new Date(baseDate);
  saturdayParcFerme.setDate(saturdayParcFerme.getDate() + 1);
  saturdayParcFerme.setHours(15, 0, 0, 0);

  const sundayRace = new Date(baseDate);
  sundayRace.setDate(sundayRace.getDate() + 2);
  sundayRace.setHours(15, 0, 0, 0);

  const sundayPostRace = new Date(baseDate);
  sundayPostRace.setDate(sundayPostRace.getDate() + 2);
  sundayPostRace.setHours(17, 0, 0, 0);

  return {
    practiceStartAt: fridayPractice.toISOString(),
    preQualifyingManagementStartAt: preQualifyingManagement.toISOString(),
    qualifyingStartAt: saturdayQualifying.toISOString(),
    parcFermeStartAt: saturdayParcFerme.toISOString(),
    raceStartAt: sundayRace.toISOString(),
    postRaceStartAt: sundayPostRace.toISOString(),
  };
}

function getNextWeekendBaseDate(currentWeekend: WeekendState): Date {
  const currentRaceDate = new Date(currentWeekend.schedule.raceStartAt);
  const nextBaseDate = new Date(currentRaceDate);

  nextBaseDate.setDate(nextBaseDate.getDate() + 5);
  nextBaseDate.setHours(9, 0, 0, 0);

  return nextBaseDate;
}

export function canAdvanceWeekend(
  weekend: WeekendState,
  season: SeasonState
): boolean {
  if (!weekend.race.completed) {
    return false;
  }

  if (!weekend.postRace.completed) {
    return false;
  }

  if (!weekend.rewardsApplied) {
    return false;
  }

  return season.processedWeekendIds.includes(weekend.id);
}

export function generateNextWeekend({
  currentWeekend,
  season,
  team,
}: GenerateNextWeekendInput): WeekendState {
  const nextRound = getNextRound(season.currentRound);
  const calendarEntry = getCalendarEntryForRound(nextRound);

  const circuit =
    circuits.find((entry) => entry.id === calendarEntry.circuitId) ?? circuits[0];

  const weather = pickWeatherForRound(nextRound);
  const nextBaseDate = getNextWeekendBaseDate(currentWeekend);
  const schedule = buildNextWeekendSchedule(nextBaseDate);

  return createWeekend({
    id: `season-${season.id}-round-${nextRound}`,
    seasonId: season.id,
    teamId: team.id,
    round: nextRound,
    teamName: team.name,
    circuit,
    weather,
    activeDriverId: team.activeDriverId,
    strategyPresetId: currentWeekend.strategyPresetId,
    trainingSelection: currentWeekend.trainingSelection,
    schedule,
  });
}

export function advanceToNextWeekend({
  currentWeekend,
  season,
  team,
}: GenerateNextWeekendInput): AdvanceWeekendResult {
  if (!canAdvanceWeekend(currentWeekend, season)) {
    throw new Error(
      "Weekend cannot be advanced yet. Race, post-race, rewards, and season processing must be complete."
    );
  }

  const weekend = generateNextWeekend({
    currentWeekend,
    season,
    team,
  });

  return {
    season: {
      ...season,
      currentRound: season.currentRound + 1,
    },
    weekend,
  };
}