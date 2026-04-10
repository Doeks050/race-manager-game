"use client";

import Link from "next/link";
import { buildStrategyForecast } from "@/lib/strategyForecast";
import { formatRaceStrategyLabel, normalizeRaceStrategy } from "@/lib/raceStrategy";
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

export default function ManagementPage() {
  const {
    weekend,
    team,
    raceDrivers,
    reserveDrivers,
    isMounted,
    sessionInfo,
    handleSetTraining,
    handleSetStrategy,
    handleResetWeekend,
  } = useGameState();

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
                compound: "medium",
              };

            const raceStrategy = normalizeRaceStrategy(setup?.raceStrategy);
            const forecast = buildStrategyForecast({
              teamId: weekend.teamId,
              driverId,
              circuitId: weekend.circuitId,
              weatherId: weekend.weatherId,
              trainingPlan: training,
              raceStrategy,
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
                        return (
                          <button
                            key={compound}
                            type="button"
                            disabled={!sessionInfo.permissions.canEditTraining}
                            className={getPillClassName(isActive, !sessionInfo.permissions.canEditTraining)}
                            onClick={() => handleSetTraining(driverId, { ...training, compound })}
                          >
                            {compound}
                          </button>
                        );
                      })}
                    </div>
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
                              onClick={() =>
                                handleSetStrategy(driverId, {
                                  ...raceStrategy,
                                  stops,
                                  stints: normalizeRaceStrategy({
                                    ...raceStrategy,
                                    stops,
                                  }).stints,
                                })
                              }
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

                    <div className="mt-4 flex flex-col gap-4">
                      {raceStrategy.stints.map((compound, stintIndex) => {
                        const stintForecast = forecast.stints[stintIndex];

                        return (
                          <div key={`${driverId}-stint-${stintIndex}`} className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                            <p className="mb-2 text-sm font-medium text-white">Stint {stintIndex + 1}</p>

                            <div className="flex flex-wrap gap-2">
                              {COMPOUND_OPTIONS.map((option) => {
                                const isActive = compound === option;
                                return (
                                  <button
                                    key={`${driverId}-${stintIndex}-${option}`}
                                    type="button"
                                    disabled={!sessionInfo.permissions.canEditStrategy}
                                    className={getPillClassName(isActive, !sessionInfo.permissions.canEditStrategy)}
                                    onClick={() => {
                                      const nextStints = [...raceStrategy.stints];
                                      nextStints[stintIndex] = option;
                                      handleSetStrategy(driverId, {
                                        ...raceStrategy,
                                        stints: nextStints,
                                      });
                                    }}
                                  >
                                    {option}
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