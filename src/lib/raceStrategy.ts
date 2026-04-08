import type { DriverRaceStrategy } from "@/types/raceStrategy";
import type { WeekendTyreCompoundId } from "@/types/weekendQualifying";

const DEFAULT_SEQUENCE: WeekendTyreCompoundId[] = [
  "medium",
  "hard",
  "medium",
  "soft",
];

export function getRequiredStintCount(stops: number): number {
  return Math.max(1, stops + 1);
}

export function createDefaultRaceStrategy(stops: number = 2): DriverRaceStrategy {
  const stintCount = getRequiredStintCount(stops);

  return {
    stops,
    stints: DEFAULT_SEQUENCE.slice(0, stintCount),
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
  };
}

export function formatRaceStrategyLabel(strategy: DriverRaceStrategy): string {
  const normalized = normalizeRaceStrategy(strategy);
  return `${normalized.stops} stop${normalized.stops === 1 ? "" : "s"} · ${normalized.stints.join(" → ")}`;
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
}

export function buildRaceStintPlan(
  strategy: DriverRaceStrategy,
  raceLaps: number
): StrategyStintPlan[] {
  const normalized = normalizeRaceStrategy(strategy);
  const stintCount = normalized.stints.length;

  const baseLapCount = Math.floor(raceLaps / stintCount);
  let remainder = raceLaps % stintCount;

  return normalized.stints.map((compound) => {
    const extraLap = remainder > 0 ? 1 : 0;
    remainder = Math.max(0, remainder - 1);

    return {
      tyreCompoundId: compound,
      lapCount: baseLapCount + extraLap,
      lapAdjustmentMs: getCompoundLapAdjustment(compound),
    };
  });
}