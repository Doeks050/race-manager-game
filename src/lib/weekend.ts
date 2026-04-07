import type { WeekendPostRaceResult } from "@/types/weekendPostRace";
import type { WeekendPracticeResult } from "@/types/weekendPractice";
import type { WeekendQualifyingResult } from "@/types/weekendQualifying";
import type { WeekendRaceResult } from "@/types/weekendRace";
import type {
  CreateWeekendInput,
  WeekendState,
  WeekendSummary,
} from "@/types/weekend";
import type { WeekendTrainingSelection } from "@/types/weekendQualifying";

export function createWeekend(input: CreateWeekendInput): WeekendState {
  return {
    id: input.id,
    seasonId: input.seasonId,
    teamId: input.teamId,
    round: input.round,
    teamName: input.teamName,
    circuit: input.circuit,
    weather: input.weather,
    activeDriverId: input.activeDriverId,
    strategyPresetId: input.strategyPresetId,
    trainingSelection: input.trainingSelection,
    schedule: input.schedule,

    practice: {
      completed: false,
      result: null,
    },

    qualifying: {
      completed: false,
      result: null,
    },

    race: {
      completed: false,
      result: null,
    },

    postRace: {
      completed: false,
      result: null,
    },

    rewardsApplied: false,
  };
}

export function setWeekendTraining(
  weekend: WeekendState,
  trainingSelection: WeekendTrainingSelection
): WeekendState {
  return {
    ...weekend,
    trainingSelection,
  };
}

export function setWeekendStrategy(
  weekend: WeekendState,
  strategyPresetId: string
): WeekendState {
  return {
    ...weekend,
    strategyPresetId,
  };
}

export function setWeekendActiveDriver(
  weekend: WeekendState,
  activeDriverId: string
): WeekendState {
  return {
    ...weekend,
    activeDriverId,
  };
}

export function completeWeekendPractice(
  weekend: WeekendState,
  result: WeekendPracticeResult
): WeekendState {
  return {
    ...weekend,
    practice: {
      completed: true,
      result,
    },
  };
}

export function completeWeekendQualifying(
  weekend: WeekendState,
  result: WeekendQualifyingResult
): WeekendState {
  return {
    ...weekend,
    qualifying: {
      completed: true,
      result,
    },
  };
}

export function completeWeekendRace(
  weekend: WeekendState,
  result: WeekendRaceResult
): WeekendState {
  return {
    ...weekend,
    race: {
      completed: true,
      result,
    },
  };
}

export function completeWeekendPostRace(
  weekend: WeekendState,
  result: WeekendPostRaceResult
): WeekendState {
  return {
    ...weekend,
    postRace: {
      completed: true,
      result,
    },
  };
}

export function markWeekendRewardsApplied(
  weekend: WeekendState
): WeekendState {
  return {
    ...weekend,
    rewardsApplied: true,
  };
}

export function getWeekendSummary(weekend: WeekendState): WeekendSummary {
  return {
    id: weekend.id,
    round: weekend.round,
    circuitName: weekend.circuit.name,
    weather: weekend.weather,
    activeDriverId: weekend.activeDriverId,
    strategyPresetId: weekend.strategyPresetId,
    practiceCompleted: weekend.practice.completed,
    qualifyingCompleted: weekend.qualifying.completed,
    raceCompleted: weekend.race.completed,
    postRaceCompleted: weekend.postRace.completed,
    rewardsApplied: weekend.rewardsApplied,
    practiceResult: weekend.practice.result,
    qualifyingResult: weekend.qualifying.result,
    raceResult: weekend.race.result,
    postRaceResult: weekend.postRace.result,
  };
}