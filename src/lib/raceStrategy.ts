import type { DriverRaceStrategy } from "@/types/raceStrategy";
import type { WeekendTyreCompoundId } from "@/types/weekendQualifying";

const DEFAULT_SEQUENCE: WeekendTyreCompoundId[] = [
  "medium",
  "hard",
  "medium",
  "soft",
];

const DEFAULT_REFERENCE_RACE_LAPS = 60;

export function getRequiredStintCount(stops: number): number {
  return Math.max(1, stops + 1);
}

export function getRequiredPitLapCount(stops: number): number {
  return Math.max(0, stops);
}

function buildDefaultPitLaps(stops: number, raceLaps: number): number[] {
  const safeStops = Math.max(0, Math.min(3, stops));

  if (safeStops === 0) {
    return [];
  }

  const safeRaceLaps = Math.max(2, raceLaps);
  const segmentLength = safeRaceLaps / (safeStops + 1);
  const pitLaps: number[] = [];

  for (let index = 1; index <= safeStops; index += 1) {
    const lap = Math.round(segmentLength * index);
    const boundedLap = Math.max(1, Math.min(safeRaceLaps - 1, lap));
    pitLaps.push(boundedLap);
  }

  return pitLaps;
}

function normalizePitLaps(
  pitLaps: number[] | null | undefined,
  stops: number,
  raceLaps: number
): number[] {
  const requiredCount = getRequiredPitLapCount(stops);

  if (requiredCount === 0) {
    return [];
  }

  if (!pitLaps || pitLaps.length !== requiredCount) {
    return buildDefaultPitLaps(stops, raceLaps);
  }

  const sanitized = pitLaps.map((lap) => Math.round(lap));

  for (let index = 0; index < sanitized.length; index += 1) {
    const lap = sanitized[index];
    const previousLap = index > 0 ? sanitized[index - 1] : 0;

    if (lap <= previousLap || lap < 1 || lap >= raceLaps) {
      return buildDefaultPitLaps(stops, raceLaps);
    }
  }

  return sanitized;
}

export function createDefaultRaceStrategy(stops: number = 2): DriverRaceStrategy {
  const safeStops = Math.max(0, Math.min(3, stops));
  const stintCount = getRequiredStintCount(safeStops);

  return {
    stops: safeStops,
    stints: DEFAULT_SEQUENCE.slice(0, stintCount),
    pitLaps: buildDefaultPitLaps(safeStops, DEFAULT_REFERENCE_RACE_LAPS),
  };
}

export function normalizeRaceStrategy(
  strategy: DriverRaceStrategy | null | undefined
): DriverRaceStrategy {
  if (!strategy) {
    return createDefaultRaceStrategy(2);
  }

  const safeStops = Math.max(0, Math.min(3, strategy.stops));
  const requiredCount = getRequiredStintCount(safeStops);

  const stints: WeekendTyreCompoundId[] = [...strategy.stints];

  while (stints.length < requiredCount) {
    stints.push(DEFAULT_SEQUENCE[stints.length] ?? "medium");
  }

  return {
    stops: safeStops,
    stints: stints.slice(0, requiredCount),
    pitLaps: normalizePitLaps(strategy.pitLaps, safeStops, DEFAULT_REFERENCE_RACE_LAPS),
  };
}

export function normalizeRaceStrategyForRaceLaps(
  strategy: DriverRaceStrategy | null | undefined,
  raceLaps: number
): DriverRaceStrategy {
  const normalized = normalizeRaceStrategy(strategy);
  const safeRaceLaps = Math.max(2, raceLaps);

  return {
    ...normalized,
    pitLaps: normalizePitLaps(normalized.pitLaps, normalized.stops, safeRaceLaps),
  };
}

export function formatRaceStrategyLabel(strategy: DriverRaceStrategy): string {
  const normalized = normalizeRaceStrategy(strategy);
  const pitLabel =
    normalized.pitLaps.length > 0
      ? ` · Pit L${normalized.pitLaps.join(" / L")}`
      : " · No pit stop";

  return `${normalized.stops} stop${normalized.stops === 1 ? "" : "s"} · ${normalized.stints.join(" → ")}${pitLabel}`;
}

export function getCompoundLapAdjustment(compound: WeekendTyreCompoundId): number {
  switch (compound) {
    case "ultra-soft":
      return -420;
    case "super-soft":
      return -320;
    case "soft":
      return -180;
    case "medium":
      return 0;
    case "hard":
      return 220;
    case "intermediate":
      return 1600;
    case "full-wet":
      return 2800;
    default:
      return 0;
  }
}

export interface StrategyStintPlan {
  tyreCompoundId: WeekendTyreCompoundId;
  lapCount: number;
  lapAdjustmentMs: number;
  startLap: number;
  endLap: number;
  pitLapAfter: number | null;
}

export function buildRaceStintPlan(
  strategy: DriverRaceStrategy,
  raceLaps: number
): StrategyStintPlan[] {
  const normalized = normalizeRaceStrategyForRaceLaps(strategy, raceLaps);
  const stints: StrategyStintPlan[] = [];

  let startLap = 1;

  normalized.stints.forEach((compound, index) => {
    const pitLapAfter =
      index < normalized.pitLaps.length ? normalized.pitLaps[index] : null;
    const endLap = pitLapAfter ?? raceLaps;
    const lapCount = Math.max(1, endLap - startLap + 1);

    stints.push({
      tyreCompoundId: compound,
      lapCount,
      lapAdjustmentMs: getCompoundLapAdjustment(compound),
      startLap,
      endLap,
      pitLapAfter,
    });

    startLap = endLap + 1;
  });

  return stints;
}