"use client";

import Link from "next/link";
import { buildStrategyForecast } from "@/lib/strategyForecast";
import {
  formatRaceStrategyLabel,
  normalizeRaceStrategy,
  normalizeRaceStrategyForRaceLaps,
} from "@/lib/raceStrategy";
import { formatCountdown, formatSessionLabel } from "@/lib/weekendSession";
import { useGameState } from "@/hooks/useGameState";
import type {
  WeekendTrainingSkill,
  WeekendTrainingTrim,
  WeekendTyreCompoundId,
} from "@/types/weekendQualifying";

const SLOT_OPTIONS = [1, 2, 3] as const;
const STOP_OPTIONS = [0, 1, 2, 3] as const;

const TRIM_OPTIONS: readonly WeekendTrainingTrim[] = ["race", "quali", "balanced"];
const SKILL_OPTIONS: readonly WeekendTrainingSkill[] = [
  "cornering",
  "straight-line",
  "consistency",
  "tyre-management",
  "pitstop",
];
const COMPOUND_OPTIONS: readonly WeekendTyreCompoundId[] = [
  "ultra-soft",
  "super-soft",
  "soft",
  "medium",
  "hard",
  "intermediate",
  "full-wet",
];

type CompoundCounts = Record<WeekendTyreCompoundId, number>;

type TrainingLike =
  | {
      slots: number;
      trim: WeekendTrainingTrim;
      skill: WeekendTrainingSkill;
      compound: WeekendTyreCompoundId;
    }
  | null
  | undefined;

type StrategyLike =
  | {
      stops: number;
      stints: WeekendTyreCompoundId[];
      pitLaps: number[];
    }
  | null
  | undefined;

type DriverSetupLike = {
  trainingPlan?: TrainingLike;
  raceStrategy?: StrategyLike;
};

function createEmptyCompoundCounts(): CompoundCounts {
  return {
    "ultra-soft": 0,
    "super-soft": 0,
    soft: 0,
    medium: 0,
    hard: 0,
    intermediate: 0,
    "full-wet": 0,
  };
}

function getPillClassName(isActive: boolean, isDisabled: boolean): string {
  return [
    "rounded-full border px-4 py-2 text-sm font-semibold transition",
    isDisabled
      ? "cursor-not-allowed border-neutral-800 bg-neutral-950 text-neutral-600"
      : isActive
        ? "border-white bg-white text-black"
        : "border-neutral-700 bg-neutral-950 text-neutral-200 hover:border-neutral-500 hover:bg-neutral-900",
  ].join(" ");
}

function getRiskClassName(riskLevel: string): string {
  switch (riskLevel) {
    case "low":
      return "border-emerald-800/60 bg-emerald-950/20 text-emerald-200";
    case "medium":
      return "border-yellow-800/60 bg-yellow-950/20 text-yellow-200";
    case "high":
      return "border-orange-800/60 bg-orange-950/20 text-orange-200";
    case "extreme":
      return "border-red-800/60 bg-red-950/20 text-red-200";
    default:
      return "border-neutral-800 bg-neutral-950 text-neutral-200";
  }
}

function incrementCompound(counts: CompoundCounts, compound: WeekendTyreCompoundId): CompoundCounts {
  return {
    ...counts,
    [compound]: counts[compound] + 1,
  };
}

function countPlannedCompoundUsage(params: {
  driverIds: string[];
  driverSetups: Record<string, DriverSetupLike>;
  excludeTrainingDriverId?: string;
  excludeStrategyDriverId?: string;
  excludeStintIndex?: number;
}): CompoundCounts {
  let counts = createEmptyCompoundCounts();

  for (const driverId of params.driverIds) {
    const setup = params.driverSetups[driverId];

    if (!setup) {
      continue;
    }

    const trainingPlan = setup.trainingPlan ?? null;
    const raceStrategy = normalizeRaceStrategy(setup.raceStrategy ?? undefined);

    if (driverId !== params.excludeTrainingDriverId && trainingPlan) {
      counts = incrementCompound(counts, trainingPlan.compound);
    }

    raceStrategy.stints.forEach((compound, stintIndex) => {
      const shouldExclude =
        driverId === params.excludeStrategyDriverId && stintIndex === params.excludeStintIndex;

      if (!shouldExclude) {
        counts = incrementCompound(counts, compound);
      }
    });
  }

  return counts;
}

function getAvailableAfterPlannedUsage(
  compound: WeekendTyreCompoundId,
  totalAvailableNow: number,
  plannedUsage: CompoundCounts
): number {
  return Math.max(0, totalAvailableNow - plannedUsage[compound]);
}

function clampPitLap(
  value: number,
  index: number,
  raceLaps: number,
  pitLaps: number[]
): number {
  const previousLap = index > 0 ? pitLaps[index - 1] : 0;
  const nextLap = index < pitLaps.length - 1 ? pitLaps[index + 1] : raceLaps;

  const minLap = Math.max(previousLap + 1, 1);
  const maxLap = Math.min(nextLap - 1, raceLaps - 1);

  return Math.max(minLap, Math.min(maxLap, value));
}

export default function ManagementPage() {
  const {
    weekend,
    team,
    raceDrivers,
    reserveDrivers,
    isMounted,
    sessionInfo,
    currentWeekendTyreAllocationSummary,
    handleSetTraining,
    handleSetStrategy,
    handleResetWeekend,
  } = useGameState();

  const tyreAvailabilityByCompound = Object.fromEntries(
    currentWeekendTyreAllocationSummary.map((row) => [row.compound, row.available])
  ) as Record<WeekendTyreCompoundId, number>;

  const tyreTotalsByCompound = Object.fromEntries(
    currentWeekendTyreAllocationSummary.map((row) => [row.compound, row.total])
  ) as Record<WeekendTyreCompoundId, number>;

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
        <section className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
                Management Center
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Race Driver Setup
              </h1>
              <p className="mt-2 text-sm text-neutral-400">
                Alleen de huidige race lineup wordt hier ingesteld. Reserves beheer je via Recovery / Rotation.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Back to Dashboard</Link>
              <Link href="/team" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Team</Link>
              <Link href="/upgrades" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Upgrades</Link>
              <Link href="/recovery" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Recovery</Link>
              <Link href="/weekend" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Weekend</Link>
              <Link href="/results" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Results</Link>
              <button
                type="button"
                onClick={handleResetWeekend}
                className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500"
              >
                Reset Demo Weekend
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-6">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">Current Session</p>
            <p className="mt-2 text-sm text-white">{formatSessionLabel(sessionInfo.currentSession)}</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">Countdown</p>
            <p className="mt-2 text-sm text-white">{formatCountdown(isMounted ? sessionInfo.countdownMs : null)}</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">Training Permission</p>
            <p className="mt-2 text-sm text-white">{sessionInfo.permissions.canEditTraining ? "Open" : "Locked"}</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">Strategy Permission</p>
            <p className="mt-2 text-sm text-white">{sessionInfo.permissions.canEditStrategy ? "Open" : "Locked"}</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">Credits</p>
            <p className="mt-2 text-sm text-white">{team.credits}</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">Reserves Available</p>
            <p className="mt-2 text-sm text-white">{reserveDrivers.length}</p>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">Weekend Tyre Stock</p>
              <p className="mt-1 text-sm text-neutral-400">
                Dit zijn je resterende sets voor het huidige weekend.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-black px-3 py-2 text-sm text-neutral-300">
              {currentWeekendTyreAllocationSummary.reduce((sum, row) => sum + row.available, 0)} sets remaining
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {currentWeekendTyreAllocationSummary.map((row) => (
              <div
                key={row.compound}
                className="rounded-2xl border border-neutral-800 bg-black p-4"
              >
                <p className="text-sm font-semibold text-white">{row.label}</p>
                <p className="mt-2 text-sm text-neutral-300">
                  Available <span className="text-white">{row.available}</span> / {row.total}
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  Used {row.used} · Locked {row.locked}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
          <p className="text-sm font-semibold text-white">Current Race Line-up</p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {raceDrivers.map((driver, index) => (
              <div
                key={driver.id}
                className="rounded-2xl border border-neutral-800 bg-black p-4"
              >
                <p className="text-xs text-neutral-500">Seat {index + 1}</p>
                <p className="mt-1 text-sm font-semibold text-white">{driver.name}</p>
                <p className="mt-2 text-sm text-neutral-300">
                  Fitness <span className="text-white">{driver.fitness}</span> · Morale{" "}
                  <span className="text-white">{driver.morale}</span>
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <Link
              href="/recovery"
              className="inline-flex rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition hover:border-neutral-500"
            >
              Open Recovery / Rotation
            </Link>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          {weekend.driverIds.map((driverId, index) => {
            const driverInfo = raceDrivers.find((driver) => driver.id === driverId);
            const setup = weekend.driverSetups[driverId];
            const training =
              setup?.trainingPlan ?? {
                slots: 1,
                trim: "balanced",
                skill: "consistency",
                compound: "medium" as WeekendTyreCompoundId,
              };

            const raceStrategy = normalizeRaceStrategyForRaceLaps(
              setup?.raceStrategy,
              forecastRaceLapsFromCircuit(weekend.circuitId)
            );

            const forecast = buildStrategyForecast({
              teamId: weekend.teamId,
              driverId,
              circuitId: weekend.circuitId,
              weatherId: weekend.weatherId,
              trainingPlan: training,
              raceStrategy,
            });

            const plannedUsageWithoutThisTraining = countPlannedCompoundUsage({
              driverIds: weekend.driverIds,
              driverSetups: weekend.driverSetups as Record<string, DriverSetupLike>,
              excludeTrainingDriverId: driverId,
            });

            return (
              <section key={driverId} className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-neutral-500">Seat {index + 1}</p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {driverInfo?.name ?? driverId}
                    </p>
                    <p className="mt-1 text-sm text-neutral-400">
                      Current race driver setup.
                    </p>
                  </div>

                  <div className="rounded-xl border border-neutral-800 bg-black px-3 py-2 text-right">
                    <p className="text-xs uppercase tracking-wide text-neutral-500">Condition</p>
                    <p className="mt-1 text-sm text-white">
                      F {driverInfo?.fitness ?? "—"} · M {driverInfo?.morale ?? "—"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-5">
                  <div>
                    <p className="mb-2 text-sm font-medium text-white">Training Slots</p>
                    <div className="flex flex-wrap gap-2">
                      {SLOT_OPTIONS.map((slots) => {
                        const isActive = training.slots === slots;
                        return (
                          <button
                            key={slots}
                            type="button"
                            disabled={!sessionInfo.permissions.canEditTraining}
                            className={getPillClassName(isActive, !sessionInfo.permissions.canEditTraining)}
                            onClick={() => handleSetTraining(driverId, { ...training, slots })}
                          >
                            {slots} slot{slots > 1 ? "s" : ""}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium text-white">Trim</p>
                    <div className="flex flex-wrap gap-2">
                      {TRIM_OPTIONS.map((trim) => {
                        const isActive = training.trim === trim;
                        return (
                          <button
                            key={trim}
                            type="button"
                            disabled={!sessionInfo.permissions.canEditTraining}
                            className={getPillClassName(isActive, !sessionInfo.permissions.canEditTraining)}
                            onClick={() => handleSetTraining(driverId, { ...training, trim })}
                          >
                            {trim}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium text-white">Skill Focus</p>
                    <div className="flex flex-wrap gap-2">
                      {SKILL_OPTIONS.map((skill) => {
                        const isActive = training.skill === skill;
                        return (
                          <button
                            key={skill}
                            type="button"
                            disabled={!sessionInfo.permissions.canEditTraining}
                            className={getPillClassName(isActive, !sessionInfo.permissions.canEditTraining)}
                            onClick={() => handleSetTraining(driverId, { ...training, skill })}
                          >
                            {skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium text-white">Compound Focus</p>
                    <div className="flex flex-wrap gap-2">
                      {COMPOUND_OPTIONS.map((compound) => {
                        const isActive = training.compound === compound;
                        const availableCount = tyreAvailabilityByCompound[compound] ?? 0;
                        const totalCount = tyreTotalsByCompound[compound] ?? 0;
                        const remainingFree = getAvailableAfterPlannedUsage(
                          compound,
                          availableCount,
                          plannedUsageWithoutThisTraining
                        );
                        const isOutOfStock = remainingFree <= 0 && !isActive;
                        const isDisabled =
                          !sessionInfo.permissions.canEditTraining || isOutOfStock;

                        return (
                          <button
                            key={compound}
                            type="button"
                            disabled={isDisabled}
                            className={getPillClassName(isActive, isDisabled)}
                            onClick={() => handleSetTraining(driverId, { ...training, compound })}
                          >
                            {compound} ({remainingFree}/{totalCount})
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-xs text-neutral-500">
                      Getoonde aantallen houden rekening met andere geplande training- en racesets.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-neutral-800 bg-black p-4">
                    <p className="text-sm font-semibold text-white">Race Strategy Builder</p>

                    <div className="mt-4">
                      <p className="mb-2 text-sm font-medium text-white">Stops</p>
                      <div className="flex flex-wrap gap-2">
                        {STOP_OPTIONS.map((stops) => {
                          const isActive = raceStrategy.stops === stops;
                          return (
                            <button
                              key={stops}
                              type="button"
                              disabled={!sessionInfo.permissions.canEditStrategy}
                              className={getPillClassName(isActive, !sessionInfo.permissions.canEditStrategy)}
                              onClick={() => {
                                const nextStrategy = normalizeRaceStrategyForRaceLaps(
                                  {
                                    ...raceStrategy,
                                    stops,
                                  },
                                  forecast.raceLaps
                                );

                                handleSetStrategy(driverId, nextStrategy);
                              }}
                            >
                              {stops} stop{stops === 1 ? "" : "s"}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                        <p className="text-xs uppercase tracking-wide text-neutral-500">Race Laps</p>
                        <p className="mt-1 text-sm text-white">{forecast.raceLaps}</p>
                      </div>

                      <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                        <p className="text-xs uppercase tracking-wide text-neutral-500">Tyre Stress</p>
                        <p className="mt-1 text-sm text-white">{forecast.circuitTyreStress}</p>
                      </div>
                    </div>

                    {raceStrategy.pitLaps.length > 0 && (
                      <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                        <p className="text-sm font-medium text-white">Pit Stop Laps</p>
                        <p className="mt-1 text-xs text-neutral-500">
                          Kies exact in welke ronde je naar binnen gaat.
                        </p>

                        <div className="mt-3 flex flex-col gap-3">
                          {raceStrategy.pitLaps.map((pitLap, pitIndex) => (
                            <div
                              key={`${driverId}-pit-${pitIndex}`}
                              className="rounded-xl border border-neutral-800 bg-black p-3"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-white">
                                    Stop {pitIndex + 1}
                                  </p>
                                  <p className="mt-1 text-xs text-neutral-500">
                                    Pit at end of lap
                                  </p>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    disabled={!sessionInfo.permissions.canEditStrategy}
                                    className={getPillClassName(false, !sessionInfo.permissions.canEditStrategy)}
                                    onClick={() => {
                                      const nextPitLaps = [...raceStrategy.pitLaps];
                                      nextPitLaps[pitIndex] = clampPitLap(
                                        pitLap - 1,
                                        pitIndex,
                                        forecast.raceLaps,
                                        nextPitLaps
                                      );

                                      handleSetStrategy(driverId, {
                                        ...raceStrategy,
                                        pitLaps: nextPitLaps,
                                      });
                                    }}
                                  >
                                    -1
                                  </button>

                                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-white">
                                    L{pitLap}
                                  </div>

                                  <button
                                    type="button"
                                    disabled={!sessionInfo.permissions.canEditStrategy}
                                    className={getPillClassName(false, !sessionInfo.permissions.canEditStrategy)}
                                    onClick={() => {
                                      const nextPitLaps = [...raceStrategy.pitLaps];
                                      nextPitLaps[pitIndex] = clampPitLap(
                                        pitLap + 1,
                                        pitIndex,
                                        forecast.raceLaps,
                                        nextPitLaps
                                      );

                                      handleSetStrategy(driverId, {
                                        ...raceStrategy,
                                        pitLaps: nextPitLaps,
                                      });
                                    }}
                                  >
                                    +1
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex flex-col gap-4">
                      {raceStrategy.stints.map((compound, stintIndex) => {
                        const stintForecast = forecast.stints[stintIndex];
                        const plannedUsageWithoutThisStint = countPlannedCompoundUsage({
                          driverIds: weekend.driverIds,
                          driverSetups: weekend.driverSetups as Record<string, DriverSetupLike>,
                          excludeStrategyDriverId: driverId,
                          excludeStintIndex: stintIndex,
                        });

                        return (
                          <div key={`${driverId}-stint-${stintIndex}`} className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <p className="text-sm font-medium text-white">Stint {stintIndex + 1}</p>
                              {stintIndex < raceStrategy.pitLaps.length && (
                                <p className="text-xs text-neutral-500">
                                  Pit after lap {raceStrategy.pitLaps[stintIndex]}
                                </p>
                              )}
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              {COMPOUND_OPTIONS.map((option) => {
                                const isActive = compound === option;
                                const availableCount = tyreAvailabilityByCompound[option] ?? 0;
                                const totalCount = tyreTotalsByCompound[option] ?? 0;
                                const remainingFree = getAvailableAfterPlannedUsage(
                                  option,
                                  availableCount,
                                  plannedUsageWithoutThisStint
                                );
                                const isOutOfStock = remainingFree <= 0 && !isActive;
                                const isDisabled =
                                  !sessionInfo.permissions.canEditStrategy || isOutOfStock;

                                return (
                                  <button
                                    key={`${driverId}-${stintIndex}-${option}`}
                                    type="button"
                                    disabled={isDisabled}
                                    className={getPillClassName(isActive, isDisabled)}
                                    onClick={() => {
                                      const nextStints = [...raceStrategy.stints];
                                      nextStints[stintIndex] = option;

                                      handleSetStrategy(driverId, {
                                        ...raceStrategy,
                                        stints: nextStints,
                                      });
                                    }}
                                  >
                                    {option} ({remainingFree}/{totalCount})
                                  </button>
                                );
                              })}
                            </div>

                            {stintForecast && (
                              <>
                                <div className="mt-3 grid gap-3 md:grid-cols-2">
                                  <div className="rounded-xl border border-neutral-800 bg-black p-3">
                                    <p className="text-xs text-neutral-500">Planned laps</p>
                                    <p className="mt-1 text-sm text-white">{stintForecast.plannedLaps}</p>
                                  </div>

                                  <div className="rounded-xl border border-neutral-800 bg-black p-3">
                                    <p className="text-xs text-neutral-500">Competitive laps</p>
                                    <p className="mt-1 text-sm text-white">{stintForecast.expectedCompetitiveLaps}</p>
                                    <p className="mt-1 text-xs text-neutral-500">
                                      Max expected: {stintForecast.expectedMaxLaps}
                                    </p>
                                  </div>
                                </div>

                                <div className={["mt-3 rounded-xl border p-3 text-sm", getRiskClassName(stintForecast.riskLevel)].join(" ")}>
                                  <p className="font-semibold">{stintForecast.riskLevel.toUpperCase()} RISK</p>
                                  <p className="mt-1">{stintForecast.warning}</p>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-xl border border-neutral-800 bg-black p-3 text-sm">
                    <p className="text-neutral-400">Saved setup:</p>
                    <p className="mt-1 text-white">
                      {training.slots} slot(s) · {training.trim} · {training.skill} · {training.compound}
                    </p>
                    <p className="mt-1 text-white">{formatRaceStrategyLabel(raceStrategy)}</p>
                  </div>
                </div>
              </section>
            );
          })}
        </section>
      </div>
    </main>
  );
}

function forecastRaceLapsFromCircuit(circuitId: string): number {
  switch (circuitId) {
    case "melbourne":
      return 58;
    case "bahrain":
      return 57;
    case "jeddah":
      return 50;
    case "monza":
      return 53;
    case "monaco":
      return 78;
    default:
      return 56;
  }
}