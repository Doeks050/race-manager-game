import { getLastCalendarRound, getWeekendCalendarEntry } from "@/data/weekendCalendar";
import { createWeekend } from "@/lib/weekend";
import type { SeasonState } from "@/types/season";
import type { WeekendState } from "@/types/weekend";
import type { WeekendSchedule } from "@/types/weekendSession";

export interface AdvanceToNextWeekendInput {
  currentWeekend: WeekendState;
  seasonState: SeasonState;
}

export interface AdvanceToNextWeekendResult {
  nextWeekend: WeekendState | null;
  nextRound: number | null;
  reason: string | null;
  seasonCompleted: boolean;
}

export function canAdvanceWeekend(weekend: WeekendState): boolean {
  return (
    weekend.race.isCompleted &&
    weekend.postRace.isCompleted &&
    weekend.postRace.rewardsApplied
  );
}

export function buildWeekendScheduleForRound(round: number): WeekendSchedule | null {
  const entry = getWeekendCalendarEntry(round);

  if (!entry) {
    return null;
  }

  return {
    practiceAt: entry.practiceAt,
    qualifyingAt: entry.qualifyingAt,
    raceAt: entry.raceAt,
  };
}

export function createWeekendFromCalendarRound(params: {
  season: number;
  round: number;
  teamId: string;
  activeDriverId?: string | null;
}): WeekendState | null {
  const entry = getWeekendCalendarEntry(params.round);

  if (!entry) {
    return null;
  }

  return createWeekend({
    id: `weekend-${params.season}-${params.round}`,
    season: params.season,
    round: params.round,
    teamId: params.teamId,
    circuitId: entry.circuitId,
    weatherId: entry.weatherId,
    schedule: {
      practiceAt: entry.practiceAt,
      qualifyingAt: entry.qualifyingAt,
      raceAt: entry.raceAt,
    },
    activeDriverId: params.activeDriverId ?? null,
  });
}

export function advanceToNextWeekend({
  currentWeekend,
  seasonState,
}: AdvanceToNextWeekendInput): AdvanceToNextWeekendResult {
  if (!canAdvanceWeekend(currentWeekend)) {
    return {
      nextWeekend: null,
      nextRound: null,
      reason: "Current weekend is not fully completed yet.",
      seasonCompleted: false,
    };
  }

  const nextRound = seasonState.currentRound;
  const lastRound = getLastCalendarRound();

  if (nextRound > lastRound) {
    return {
      nextWeekend: null,
      nextRound: null,
      reason: "No more calendar entries available.",
      seasonCompleted: true,
    };
  }

  const nextWeekend = createWeekendFromCalendarRound({
    season: seasonState.season,
    round: nextRound,
    teamId: currentWeekend.teamId,
    activeDriverId: currentWeekend.activeDriverId,
  });

  if (!nextWeekend) {
    return {
      nextWeekend: null,
      nextRound: null,
      reason: "Could not create the next weekend from calendar data.",
      seasonCompleted: false,
    };
  }

  return {
    nextWeekend,
    nextRound,
    reason: null,
    seasonCompleted: false,
  };
}