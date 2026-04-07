import type { WeekendState } from "@/types/weekend";
import type {
  WeekendPermissions,
  WeekendSessionInfo,
  WeekendSessionName,
} from "@/types/weekendSession";

function toMs(value: string): number {
  return new Date(value).getTime();
}

function getNextCountdown(nowMs: number, targetIso: string | null): number | null {
  if (!targetIso) {
    return null;
  }

  const diff = toMs(targetIso) - nowMs;
  return diff > 0 ? diff : 0;
}

export function getWeekendPermissions(
  session: WeekendSessionName
): WeekendPermissions {
  switch (session) {
    case "pre_practice_management":
      return {
        canUpgrade: true,
        canChangeDriver: true,
        canRecoverDriver: true,
        canEditTraining: true,
        canEditStrategy: true,
      };

    case "practice":
      return {
        canUpgrade: false,
        canChangeDriver: false,
        canRecoverDriver: false,
        canEditTraining: false,
        canEditStrategy: false,
      };

    case "pre_qualifying_management":
      return {
        canUpgrade: true,
        canChangeDriver: true,
        canRecoverDriver: true,
        canEditTraining: true,
        canEditStrategy: true,
      };

    case "qualifying":
      return {
        canUpgrade: false,
        canChangeDriver: false,
        canRecoverDriver: false,
        canEditTraining: false,
        canEditStrategy: false,
      };

    case "parc_ferme":
      return {
        canUpgrade: false,
        canChangeDriver: false,
        canRecoverDriver: false,
        canEditTraining: false,
        canEditStrategy: true,
      };

    case "race":
      return {
        canUpgrade: false,
        canChangeDriver: false,
        canRecoverDriver: false,
        canEditTraining: false,
        canEditStrategy: false,
      };

    case "post_race_management":
      return {
        canUpgrade: true,
        canChangeDriver: true,
        canRecoverDriver: true,
        canEditTraining: true,
        canEditStrategy: true,
      };

    default:
      return {
        canUpgrade: false,
        canChangeDriver: false,
        canRecoverDriver: false,
        canEditTraining: false,
        canEditStrategy: false,
      };
  }
}

export function getCurrentWeekendSession<
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
  nowMs: number = Date.now()
): WeekendSessionName {
  const practiceAtMs = toMs(weekend.schedule.practiceAt);
  const qualifyingAtMs = toMs(weekend.schedule.qualifyingAt);
  const raceAtMs = toMs(weekend.schedule.raceAt);

  if (nowMs < practiceAtMs) {
    return "pre_practice_management";
  }

  if (nowMs < qualifyingAtMs) {
    if (!weekend.practice.isCompleted) {
      return "practice";
    }
    return "pre_qualifying_management";
  }

  if (nowMs < raceAtMs) {
    if (!weekend.qualifying.isCompleted) {
      return "qualifying";
    }
    return "parc_ferme";
  }

  if (!weekend.race.isCompleted) {
    return "race";
  }

  return "post_race_management";
}

export function getWeekendSessionInfo<
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
  nowMs: number = Date.now()
): WeekendSessionInfo {
  const currentSession = getCurrentWeekendSession(weekend, nowMs);

  switch (currentSession) {
    case "pre_practice_management":
      return {
        currentSession,
        nextSession: "practice",
        nextSessionStartsAt: weekend.schedule.practiceAt,
        countdownMs: getNextCountdown(nowMs, weekend.schedule.practiceAt),
        permissions: getWeekendPermissions(currentSession),
      };

    case "practice":
      return {
        currentSession,
        nextSession: "pre_qualifying_management",
        nextSessionStartsAt: weekend.schedule.qualifyingAt,
        countdownMs: getNextCountdown(nowMs, weekend.schedule.qualifyingAt),
        permissions: getWeekendPermissions(currentSession),
      };

    case "pre_qualifying_management":
      return {
        currentSession,
        nextSession: "qualifying",
        nextSessionStartsAt: weekend.schedule.qualifyingAt,
        countdownMs: getNextCountdown(nowMs, weekend.schedule.qualifyingAt),
        permissions: getWeekendPermissions(currentSession),
      };

    case "qualifying":
      return {
        currentSession,
        nextSession: "parc_ferme",
        nextSessionStartsAt: weekend.schedule.raceAt,
        countdownMs: getNextCountdown(nowMs, weekend.schedule.raceAt),
        permissions: getWeekendPermissions(currentSession),
      };

    case "parc_ferme":
      return {
        currentSession,
        nextSession: "race",
        nextSessionStartsAt: weekend.schedule.raceAt,
        countdownMs: getNextCountdown(nowMs, weekend.schedule.raceAt),
        permissions: getWeekendPermissions(currentSession),
      };

    case "race":
      return {
        currentSession,
        nextSession: "post_race_management",
        nextSessionStartsAt: null,
        countdownMs: null,
        permissions: getWeekendPermissions(currentSession),
      };

    case "post_race_management":
      return {
        currentSession,
        nextSession: null,
        nextSessionStartsAt: null,
        countdownMs: null,
        permissions: getWeekendPermissions(currentSession),
      };

    default:
      return {
        currentSession,
        nextSession: null,
        nextSessionStartsAt: null,
        countdownMs: null,
        permissions: getWeekendPermissions(currentSession),
      };
  }
}

export function formatCountdown(ms: number | null): string {
  if (ms === null) {
    return "—";
  }

  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatSessionLabel(session: WeekendSessionName): string {
  switch (session) {
    case "pre_practice_management":
      return "Pre-Practice Management";
    case "practice":
      return "Free Practice";
    case "pre_qualifying_management":
      return "Pre-Qualifying Management";
    case "qualifying":
      return "Qualifying";
    case "parc_ferme":
      return "Parc Fermé";
    case "race":
      return "Race";
    case "post_race_management":
      return "Post-Race Management";
    default:
      return session;
  }
}