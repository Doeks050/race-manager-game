import { createDefaultRaceStrategy } from "@/lib/raceStrategy";
import type {
  CreateWeekendInput,
  DriverWeekendSetup,
  WeekendState,
  WeekendSummary,
} from "@/types/weekend";

function nowIso(): string {
  return new Date().toISOString();
}

function touchWeekend<
  TrainingPlan = unknown,
  PracticeResult = unknown,
  QualifyingResult = unknown,
  RaceResult = unknown,
  PostRaceResult = unknown
>(
  weekend: WeekendState<
    TrainingPlan,
    PracticeResult,
    QualifyingResult,
    RaceResult,
    PostRaceResult
  >
): WeekendState<
  TrainingPlan,
  PracticeResult,
  QualifyingResult,
  RaceResult,
  PostRaceResult
> {
  return {
    ...weekend,
    updatedAt: nowIso(),
  };
}

function buildDriverSetups<TrainingPlan = unknown>(
  driverIds: string[]
): Record<string, DriverWeekendSetup<TrainingPlan>> {
  return driverIds.reduce<Record<string, DriverWeekendSetup<TrainingPlan>>>(
    (acc, driverId) => {
      acc[driverId] = {
        driverId,
        trainingPlan: null,
        raceStrategy: createDefaultRaceStrategy(2),
      };
      return acc;
    },
    {}
  );
}

function buildEmptyResultMap<ResultType = unknown>(
  driverIds: string[]
): Record<string, ResultType | null> {
  return driverIds.reduce<Record<string, ResultType | null>>((acc, driverId) => {
    acc[driverId] = null;
    return acc;
  }, {});
}

export function createWeekend<
  TrainingPlan = unknown,
  PracticeResult = unknown,
  QualifyingResult = unknown,
  RaceResult = unknown,
  PostRaceResult = unknown
>(
  input: CreateWeekendInput
): WeekendState<
  TrainingPlan,
  PracticeResult,
  QualifyingResult,
  RaceResult,
  PostRaceResult
> {
  const timestamp = nowIso();
  const driverIds = input.driverIds ?? ["driver-1", "driver-2"];

  return {
    id: input.id,
    season: input.season,
    round: input.round,
    teamId: input.teamId,
    circuitId: input.circuitId,
    weatherId: input.weatherId,
    status: "active",
    activeDriverId: input.activeDriverId ?? driverIds[0] ?? null,
    driverIds,
    driverSetups: buildDriverSetups<TrainingPlan>(driverIds),
    schedule: input.schedule,

    practice: {
      isCompleted: false,
      resultsByDriver: buildEmptyResultMap<PracticeResult>(driverIds),
      completedAt: null,
    },

    qualifying: {
      isCompleted: false,
      resultsByDriver: buildEmptyResultMap<QualifyingResult>(driverIds),
      completedAt: null,
    },

    race: {
      isCompleted: false,
      resultsByDriver: buildEmptyResultMap<RaceResult>(driverIds),
      completedAt: null,
    },

    postRace: {
      isCompleted: false,
      rewardsApplied: false,
      resultsByDriver: buildEmptyResultMap<PostRaceResult>(driverIds),
      completedAt: null,
    },

    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function setWeekendDriverTraining<
  TrainingPlan,
  PracticeResult = unknown,
  QualifyingResult = unknown,
  RaceResult = unknown,
  PostRaceResult = unknown
>(
  weekend: WeekendState<
    TrainingPlan,
    PracticeResult,
    QualifyingResult,
    RaceResult,
    PostRaceResult
  >,
  driverId: string,
  trainingPlan: TrainingPlan
): WeekendState<
  TrainingPlan,
  PracticeResult,
  QualifyingResult,
  RaceResult,
  PostRaceResult
> {
  const existingSetup = weekend.driverSetups[driverId];

  if (!existingSetup) {
    return weekend;
  }

  return touchWeekend({
    ...weekend,
    driverSetups: {
      ...weekend.driverSetups,
      [driverId]: {
        ...existingSetup,
        trainingPlan,
      },
    },
  });
}

export function setWeekendDriverStrategy<
  TrainingPlan = unknown,
  PracticeResult = unknown,
  QualifyingResult = unknown,
  RaceResult = unknown,
  PostRaceResult = unknown
>(
  weekend: WeekendState<
    TrainingPlan,
    PracticeResult,
    QualifyingResult,
    RaceResult,
    PostRaceResult
  >,
  driverId: string,
  raceStrategy: DriverWeekendSetup<TrainingPlan>["raceStrategy"]
): WeekendState<
  TrainingPlan,
  PracticeResult,
  QualifyingResult,
  RaceResult,
  PostRaceResult
> {
  const existingSetup = weekend.driverSetups[driverId];

  if (!existingSetup) {
    return weekend;
  }

  return touchWeekend({
    ...weekend,
    driverSetups: {
      ...weekend.driverSetups,
      [driverId]: {
        ...existingSetup,
        raceStrategy,
      },
    },
  });
}

export function completeWeekendPractice<
  TrainingPlan = unknown,
  PracticeResult = unknown,
  QualifyingResult = unknown,
  RaceResult = unknown,
  PostRaceResult = unknown
>(
  weekend: WeekendState<
    TrainingPlan,
    PracticeResult,
    QualifyingResult,
    RaceResult,
    PostRaceResult
  >,
  resultsByDriver: Record<string, PracticeResult | null>
): WeekendState<
  TrainingPlan,
  PracticeResult,
  QualifyingResult,
  RaceResult,
  PostRaceResult
> {
  return touchWeekend({
    ...weekend,
    practice: {
      isCompleted: true,
      resultsByDriver,
      completedAt: nowIso(),
    },
  });
}

export function completeWeekendQualifying<
  TrainingPlan = unknown,
  PracticeResult = unknown,
  QualifyingResult = unknown,
  RaceResult = unknown,
  PostRaceResult = unknown
>(
  weekend: WeekendState<
    TrainingPlan,
    PracticeResult,
    QualifyingResult,
    RaceResult,
    PostRaceResult
  >,
  resultsByDriver: Record<string, QualifyingResult | null>
): WeekendState<
  TrainingPlan,
  PracticeResult,
  QualifyingResult,
  RaceResult,
  PostRaceResult
> {
  return touchWeekend({
    ...weekend,
    qualifying: {
      isCompleted: true,
      resultsByDriver,
      completedAt: nowIso(),
    },
  });
}

export function completeWeekendRace<
  TrainingPlan = unknown,
  PracticeResult = unknown,
  QualifyingResult = unknown,
  RaceResult = unknown,
  PostRaceResult = unknown
>(
  weekend: WeekendState<
    TrainingPlan,
    PracticeResult,
    QualifyingResult,
    RaceResult,
    PostRaceResult
  >,
  resultsByDriver: Record<string, RaceResult | null>
): WeekendState<
  TrainingPlan,
  PracticeResult,
  QualifyingResult,
  RaceResult,
  PostRaceResult
> {
  return touchWeekend({
    ...weekend,
    race: {
      isCompleted: true,
      resultsByDriver,
      completedAt: nowIso(),
    },
  });
}

export function completeWeekendPostRace<
  TrainingPlan = unknown,
  PracticeResult = unknown,
  QualifyingResult = unknown,
  RaceResult = unknown,
  PostRaceResult = unknown
>(
  weekend: WeekendState<
    TrainingPlan,
    PracticeResult,
    QualifyingResult,
    RaceResult,
    PostRaceResult
  >,
  resultsByDriver: Record<string, PostRaceResult | null>
): WeekendState<
  TrainingPlan,
  PracticeResult,
  QualifyingResult,
  RaceResult,
  PostRaceResult
> {
  return touchWeekend({
    ...weekend,
    postRace: {
      ...weekend.postRace,
      isCompleted: true,
      resultsByDriver,
      completedAt: nowIso(),
    },
  });
}

export function markWeekendRewardsApplied<
  TrainingPlan = unknown,
  PracticeResult = unknown,
  QualifyingResult = unknown,
  RaceResult = unknown,
  PostRaceResult = unknown
>(
  weekend: WeekendState<
    TrainingPlan,
    PracticeResult,
    QualifyingResult,
    RaceResult,
    PostRaceResult
  >
): WeekendState<
  TrainingPlan,
  PracticeResult,
  QualifyingResult,
  RaceResult,
  PostRaceResult
> {
  return touchWeekend({
    ...weekend,
    postRace: {
      ...weekend.postRace,
      rewardsApplied: true,
    },
  });
}

export function getWeekendSummary<
  TrainingPlan = unknown,
  PracticeResult = unknown,
  QualifyingResult = unknown,
  RaceResult = unknown,
  PostRaceResult = unknown
>(
  weekend: WeekendState<
    TrainingPlan,
    PracticeResult,
    QualifyingResult,
    RaceResult,
    PostRaceResult
  >
): WeekendSummary {
  return {
    id: weekend.id,
    season: weekend.season,
    round: weekend.round,
    circuitId: weekend.circuitId,
    weatherId: weekend.weatherId,
    status: weekend.status,
    activeDriverId: weekend.activeDriverId,
    driverIds: weekend.driverIds,
    practiceCompleted: weekend.practice.isCompleted,
    qualifyingCompleted: weekend.qualifying.isCompleted,
    raceCompleted: weekend.race.isCompleted,
    postRaceCompleted: weekend.postRace.isCompleted,
  };
}