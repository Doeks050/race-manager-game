import type {
  CreateWeekendInput,
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

  return {
    id: input.id,
    season: input.season,
    round: input.round,
    teamId: input.teamId,
    circuitId: input.circuitId,
    weatherId: input.weatherId,
    status: "active",
    activeDriverId: input.activeDriverId ?? null,
    schedule: input.schedule,
    trainingPlan: null,
    strategyPresetId: null,

    practice: {
      isCompleted: false,
      result: null,
      completedAt: null,
    },

    qualifying: {
      isCompleted: false,
      result: null,
      completedAt: null,
    },

    race: {
      isCompleted: false,
      result: null,
      completedAt: null,
    },

    postRace: {
      isCompleted: false,
      rewardsApplied: false,
      result: null,
      completedAt: null,
    },

    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function setWeekendTraining<
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
  trainingPlan: TrainingPlan
): WeekendState<
  TrainingPlan,
  PracticeResult,
  QualifyingResult,
  RaceResult,
  PostRaceResult
> {
  return touchWeekend({
    ...weekend,
    trainingPlan,
  });
}

export function setWeekendStrategy<
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
  strategyPresetId: string
): WeekendState<
  TrainingPlan,
  PracticeResult,
  QualifyingResult,
  RaceResult,
  PostRaceResult
> {
  return touchWeekend({
    ...weekend,
    strategyPresetId,
  });
}

export function setWeekendActiveDriver<
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
  activeDriverId: string | null
): WeekendState<
  TrainingPlan,
  PracticeResult,
  QualifyingResult,
  RaceResult,
  PostRaceResult
> {
  return touchWeekend({
    ...weekend,
    activeDriverId,
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
  result: PracticeResult
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
      result,
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
  result: QualifyingResult
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
      result,
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
  result: RaceResult
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
      result,
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
  result: PostRaceResult
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
      result,
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
    strategyPresetId: weekend.strategyPresetId,
    hasTrainingPlan: weekend.trainingPlan !== null,
    practiceCompleted: weekend.practice.isCompleted,
    qualifyingCompleted: weekend.qualifying.isCompleted,
    raceCompleted: weekend.race.isCompleted,
    postRaceCompleted: weekend.postRace.isCompleted,
  };
}