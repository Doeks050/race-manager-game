"use client";

import { buildStrategyForecast } from "@/lib/strategyForecast";
import { formatRaceStrategyLabel, normalizeRaceStrategy } from "@/lib/raceStrategy";
import { getChampionshipPoints } from "@/lib/season";
import { formatLapTime } from "@/lib/weekendQualifying";
import { formatRaceTime } from "@/lib/weekendRace";
import {
  DEV_WEEKEND_MODE,
  formatCountdown,
  formatSessionLabel,
} from "@/lib/weekendSession";
import type { DriverRaceStrategy } from "@/types/raceStrategy";
import type { SeasonState } from "@/types/season";
import type { WeekendPostRaceResult } from "@/types/weekendPostRace";
import type { WeekendPracticeResult } from "@/types/weekendPractice";
import type {
  WeekendQualifyingResult,
  WeekendTrainingSelection,
  WeekendTrainingSkill,
  WeekendTrainingTrim,
  WeekendTyreCompoundId,
} from "@/types/weekendQualifying";
import type { WeekendRaceResult } from "@/types/weekendRace";
import type { WeekendState } from "@/types/weekend";
import type {
  WeekendPermissions,
  WeekendSessionName,
} from "@/types/weekendSession";

interface WeekendFlowPanelProps {
  weekend: WeekendState<
    WeekendTrainingSelection,
    WeekendPracticeResult,
    WeekendQualifyingResult,
    WeekendRaceResult,
    WeekendPostRaceResult
  >;
  seasonState: SeasonState;
  currentSession: WeekendSessionName;
  countdownMs: number | null;
  nextSessionLabel: string | null;
  permissions: WeekendPermissions;
  canAdvanceToNextWeekend: boolean;
  onSetTraining: (driverId: string, training: WeekendTrainingSelection) => void;
  onSetStrategy: (driverId: string, raceStrategy: DriverRaceStrategy) => void;
  onRunPractice: () => void;
  onRunQualifying: () => void;
  onRunRace: () => void;
  onApplyPostRace: () => void;
  onAdvanceToNextWeekend: () => void;
}

const DRIVER_NAMES: Record<string, string> = {
  "driver-1": "Driver 1",
  "driver-2": "Driver 2",
};

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

function getDriverName(driverId: string): string {
  return DRIVER_NAMES[driverId] ?? driverId;
}

function getCardClassName(): string {
  return "rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 shadow-sm";
}

function getPillClassName(isActive: boolean, isDisabled: boolean): string {
  return [
    "rounded-full border px-4 py-2 text-sm font-semibold transition",
    isDisabled
      ? "cursor-not-allowed border-neutral-800 bg-neutral-950 text-neutral-600"
      : isActive
        ? "border-white bg-white text-black shadow-[0_0_0_1px_rgba(255,255,255,0.25)]"
        : "border-neutral-700 bg-neutral-950 text-neutral-200 hover:border-neutral-500 hover:bg-neutral-900",
  ].join(" ");
}

function getSessionStatusText(session: WeekendSessionName): string {
  if (DEV_WEEKEND_MODE) {
    return "DEV MODE is active. Countdown locks are temporarily disabled so you can test both drivers freely.";
  }

  switch (session) {
    case "pre_practice_management":
      return "Management is open until Free Practice starts.";
    case "practice":
      return "Free Practice is live. Friday results can now be generated.";
    case "pre_qualifying_management":
      return "Practice is done. Management stays open until Qualifying starts.";
    case "qualifying":
      return "Qualifying is live. The session can now be run.";
    case "parc_ferme":
      return "Parc fermé is active. Only race strategy can still be changed.";
    case "race":
      return "Race is live. The race can now be run.";
    case "post_race_management":
      return "Race weekend is finished. Full management is open again.";
    default:
      return session;
  }
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

export default function WeekendFlowPanel({
  weekend,
  seasonState,
  currentSession,
  countdownMs,
  nextSessionLabel,
  permissions,
  canAdvanceToNextWeekend,
  onSetTraining,
  onSetStrategy,
  onRunPractice,
  onRunQualifying,
  onRunRace,
  onApplyPostRace,
  onAdvanceToNextWeekend,
}: WeekendFlowPanelProps) {
  const canRunPractice = DEV_WEEKEND_MODE || (currentSession === "practice" && !weekend.practice.isCompleted);
  const canRunQualifying =
    DEV_WEEKEND_MODE || (currentSession === "qualifying" && !weekend.qualifying.isCompleted);
  const canRunRace = DEV_WEEKEND_MODE || (currentSession === "race" && !weekend.race.isCompleted);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      {DEV_WEEKEND_MODE && (
        <section className="rounded-2xl border border-amber-700/50 bg-amber-950/30 p-4">
          <p className="text-sm font-semibold text-amber-200">DEV TEST MODE ACTIVE</p>
          <p className="mt-1 text-sm text-amber-100/90">
            Timers are disabled. Both drivers can be configured and every session can be simulated manually.
          </p>
        </section>
      )}

      <section className={getCardClassName()}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">
              Weekend Flow
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-white">
              Season {weekend.season} · Round {weekend.round}
            </h1>
            <p className="mt-2 text-sm text-neutral-300">
              Circuit: <span className="text-white">{weekend.circuitId}</span> ·
              Weather: <span className="text-white">{weekend.weatherId}</span>
            </p>
            <p className="mt-3 text-sm text-neutral-400">
              {getSessionStatusText(currentSession)}
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-neutral-500">
                Current Session
              </p>
              <p className="mt-1 text-sm font-medium text-white">
                {DEV_WEEKEND_MODE ? "DEV FREE TESTING" : formatSessionLabel(currentSession)}
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-neutral-500">
                Countdown
              </p>
              <p className="mt-1 text-sm font-medium text-white">
                {formatCountdown(countdownMs)}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                {DEV_WEEKEND_MODE
                  ? "Timers temporarily disabled"
                  : nextSessionLabel
                    ? `To ${nextSessionLabel}`
                    : "No next session"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={getCardClassName()}>
        <p className="text-sm font-semibold text-white">Driver Weekend Setup</p>
        <p className="mt-1 text-sm text-neutral-400">
          Each driver has their own Friday training plan and a context-aware race strategy forecast.
        </p>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {weekend.driverIds.map((driverId) => {
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
              <div
                key={driverId}
                className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-white">
                      {getDriverName(driverId)}
                    </p>
                    <p className="mt-1 text-sm text-neutral-400">
                      Configure training and full race stint strategy for this driver.
                    </p>
                  </div>

                  <div className="rounded-xl border border-neutral-800 bg-black px-3 py-2 text-right">
                    <p className="text-xs uppercase tracking-wide text-neutral-500">
                      Strategy Summary
                    </p>
                    <p className="mt-1 text-sm text-white">
                      {formatRaceStrategyLabel(raceStrategy)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-4">
                  <div>
                    <p className="mb-2 text-sm font-medium text-white">Training Slots</p>
                    <div className="flex flex-wrap gap-2">
                      {SLOT_OPTIONS.map((slots) => {
                        const isActive = training.slots === slots;

                        return (
                          <button
                            key={slots}
                            type="button"
                            disabled={!permissions.canEditTraining}
                            className={getPillClassName(
                              isActive,
                              !permissions.canEditTraining
                            )}
                            onClick={() =>
                              onSetTraining(driverId, {
                                ...training,
                                slots,
                              })
                            }
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
                            disabled={!permissions.canEditTraining}
                            className={getPillClassName(
                              isActive,
                              !permissions.canEditTraining
                            )}
                            onClick={() =>
                              onSetTraining(driverId, {
                                ...training,
                                trim,
                              })
                            }
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
                            disabled={!permissions.canEditTraining}
                            className={getPillClassName(
                              isActive,
                              !permissions.canEditTraining
                            )}
                            onClick={() =>
                              onSetTraining(driverId, {
                                ...training,
                                skill,
                              })
                            }
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
                            disabled={!permissions.canEditTraining}
                            className={getPillClassName(
                              isActive,
                              !permissions.canEditTraining
                            )}
                            onClick={() =>
                              onSetTraining(driverId, {
                                ...training,
                                compound,
                              })
                            }
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
                              disabled={!permissions.canEditStrategy}
                              className={getPillClassName(
                                isActive,
                                !permissions.canEditStrategy
                              )}
                              onClick={() =>
                                onSetStrategy(driverId, {
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

                    <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                      <p className="text-xs uppercase tracking-wide text-neutral-500">
                        Forecast Context
                      </p>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        <p className="text-sm text-neutral-300">
                          Race laps: <span className="text-white">{forecast.raceLaps}</span>
                        </p>
                        <p className="text-sm text-neutral-300">
                          Circuit tyre stress: <span className="text-white">{forecast.circuitTyreStress}</span>
                        </p>
                        <p className="text-sm text-neutral-300">
                          Car tyre wear score: <span className="text-white">{forecast.carTyreWearScore}</span>
                        </p>
                        <p className="text-sm text-neutral-300">
                          Driver tyre management: <span className="text-white">{forecast.driverTyreManagementScore}</span>
                        </p>
                        <p className="text-sm text-neutral-300">
                          Training bonus: <span className="text-white">+{forecast.trainingTyreManagementBonus}</span>
                        </p>
                        <p className="text-sm text-neutral-300">
                          Weather wear factor: <span className="text-white">{forecast.weatherWearFactor.toFixed(2)}</span>
                        </p>
                      </div>
                      <p className="mt-3 text-sm text-neutral-400">{forecast.summary}</p>
                    </div>

                    <div className="mt-4 flex flex-col gap-4">
                      {raceStrategy.stints.map((compound, index) => {
                        const stintForecast = forecast.stints[index];

                        return (
                          <div
                            key={`${driverId}-stint-${index}`}
                            className="rounded-xl border border-neutral-800 bg-neutral-950 p-3"
                          >
                            <p className="mb-2 text-sm font-medium text-white">
                              Stint {index + 1}
                            </p>

                            <div className="flex flex-wrap gap-2">
                              {COMPOUND_OPTIONS.map((option) => {
                                const isActive = compound === option;

                                return (
                                  <button
                                    key={`${driverId}-${index}-${option}`}
                                    type="button"
                                    disabled={!permissions.canEditStrategy}
                                    className={getPillClassName(
                                      isActive,
                                      !permissions.canEditStrategy
                                    )}
                                    onClick={() => {
                                      const nextStints = [...raceStrategy.stints];
                                      nextStints[index] = option;

                                      onSetStrategy(driverId, {
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
                              <div className="mt-3 grid gap-3 md:grid-cols-2">
                                <div className="rounded-xl border border-neutral-800 bg-black p-3">
                                  <p className="text-xs text-neutral-500">Planned stint laps</p>
                                  <p className="mt-1 text-sm text-white">
                                    {stintForecast.plannedLaps} laps
                                  </p>
                                </div>

                                <div className="rounded-xl border border-neutral-800 bg-black p-3">
                                  <p className="text-xs text-neutral-500">Competitive window</p>
                                  <p className="mt-1 text-sm text-white">
                                    {stintForecast.expectedCompetitiveLaps} laps
                                  </p>
                                  <p className="mt-1 text-xs text-neutral-500">
                                    Max expected: {stintForecast.expectedMaxLaps}
                                  </p>
                                </div>

                                <div className="rounded-xl border border-neutral-800 bg-black p-3">
                                  <p className="text-xs text-neutral-500">Pace score</p>
                                  <p className="mt-1 text-sm text-white">
                                    {stintForecast.paceScore}
                                  </p>
                                </div>

                                <div className="rounded-xl border border-neutral-800 bg-black p-3">
                                  <p className="text-xs text-neutral-500">Wear score</p>
                                  <p className="mt-1 text-sm text-white">
                                    {stintForecast.wearScore}
                                  </p>
                                </div>
                              </div>
                            )}

                            {stintForecast && (
                              <div
                                className={[
                                  "mt-3 rounded-xl border p-3 text-sm",
                                  getRiskClassName(stintForecast.riskLevel),
                                ].join(" ")}
                              >
                                <p className="font-semibold">
                                  {stintForecast.riskLevel.toUpperCase()} RISK
                                </p>
                                <p className="mt-1">{stintForecast.warning}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-xl border border-neutral-800 bg-black p-3 text-sm">
                    <p className="text-neutral-400">Saved setup:</p>
                    <p className="mt-1 text-white">
                      {training.slots} slot(s) · {training.trim} · {training.skill} ·{" "}
                      {training.compound}
                    </p>
                    <p className="mt-1 text-white">
                      {formatRaceStrategyLabel(raceStrategy)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className={getCardClassName()}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Practice Session</p>
            <p className="mt-1 text-sm text-neutral-400">
              Runs Free Practice for both team drivers using their own Friday setup.
            </p>
          </div>

          <button
            type="button"
            onClick={onRunPractice}
            disabled={!canRunPractice}
            className={[
              "rounded-2xl px-4 py-3 text-sm font-semibold transition",
              !canRunPractice
                ? "cursor-not-allowed border border-neutral-800 bg-neutral-900 text-neutral-500"
                : "border border-white bg-white text-black hover:opacity-90",
            ].join(" ")}
          >
            {weekend.practice.isCompleted ? "Practice Completed" : "Run Free Practice"}
          </button>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {weekend.driverIds.map((driverId) => {
            const result = weekend.practice.resultsByDriver[driverId];

            return (
              <div
                key={driverId}
                className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4"
              >
                <p className="text-sm font-semibold text-white">{getDriverName(driverId)}</p>

                {result ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-neutral-500">Position</p>
                      <p className="mt-1 text-sm text-white">P{result.playerPosition}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Best Lap</p>
                      <p className="mt-1 text-sm text-white">
                        {formatLapTime(result.playerBestLapMs)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-neutral-400">No practice result yet.</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className={getCardClassName()}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Qualifying Session</p>
            <p className="mt-1 text-sm text-neutral-400">
              Runs Qualifying for both team drivers.
            </p>
          </div>

          <button
            type="button"
            onClick={onRunQualifying}
            disabled={!canRunQualifying}
            className={[
              "rounded-2xl px-4 py-3 text-sm font-semibold transition",
              !canRunQualifying
                ? "cursor-not-allowed border border-neutral-800 bg-neutral-900 text-neutral-500"
                : "border border-white bg-white text-black hover:opacity-90",
            ].join(" ")}
          >
            {weekend.qualifying.isCompleted ? "Qualifying Completed" : "Run Qualifying"}
          </button>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {weekend.driverIds.map((driverId) => {
            const result = weekend.qualifying.resultsByDriver[driverId];

            return (
              <div
                key={driverId}
                className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4"
              >
                <p className="text-sm font-semibold text-white">{getDriverName(driverId)}</p>

                {result ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-neutral-500">Grid Position</p>
                      <p className="mt-1 text-sm text-white">P{result.playerPosition}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Best Lap</p>
                      <p className="mt-1 text-sm text-white">
                        {formatLapTime(result.playerBestLapMs)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-neutral-400">No qualifying result yet.</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className={getCardClassName()}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Race Session</p>
            <p className="mt-1 text-sm text-neutral-400">
              Runs the race for both team drivers using their own custom strategy.
            </p>
          </div>

          <button
            type="button"
            onClick={onRunRace}
            disabled={!canRunRace}
            className={[
              "rounded-2xl px-4 py-3 text-sm font-semibold transition",
              !canRunRace
                ? "cursor-not-allowed border border-neutral-800 bg-neutral-900 text-neutral-500"
                : "border border-white bg-white text-black hover:opacity-90",
            ].join(" ")}
          >
            {weekend.race.isCompleted ? "Race Completed" : "Run Race"}
          </button>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {weekend.driverIds.map((driverId) => {
            const result = weekend.race.resultsByDriver[driverId];

            return (
              <div
                key={driverId}
                className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4"
              >
                <p className="text-sm font-semibold text-white">{getDriverName(driverId)}</p>

                {result ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-neutral-500">Finish</p>
                      <p className="mt-1 text-sm text-white">P{result.finishPosition}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Start</p>
                      <p className="mt-1 text-sm text-white">P{result.startPosition}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Points</p>
                      <p className="mt-1 text-sm text-white">
                        {getChampionshipPoints(result.finishPosition)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Race Time</p>
                      <p className="mt-1 text-sm text-white">
                        {formatRaceTime(result.totalRaceTimeMs)}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs text-neutral-500">Used Strategy</p>
                      <p className="mt-1 text-sm text-white">
                        {formatRaceStrategyLabel(result.raceStrategy)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-neutral-400">No race result yet.</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className={getCardClassName()}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Post-Race Processing</p>
            <p className="mt-1 text-sm text-neutral-400">
              Applies post-race rewards and wear for both drivers.
            </p>
          </div>

          <button
            type="button"
            onClick={onApplyPostRace}
            disabled={!weekend.race.isCompleted || weekend.postRace.rewardsApplied}
            className={[
              "rounded-2xl px-4 py-3 text-sm font-semibold transition",
              !weekend.race.isCompleted || weekend.postRace.rewardsApplied
                ? "cursor-not-allowed border border-neutral-800 bg-neutral-900 text-neutral-500"
                : "border border-white bg-white text-black hover:opacity-90",
            ].join(" ")}
          >
            {weekend.postRace.rewardsApplied ? "Post-Race Applied" : "Apply Post-Race"}
          </button>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {weekend.driverIds.map((driverId) => {
            const result = weekend.postRace.resultsByDriver[driverId];

            return (
              <div
                key={driverId}
                className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4"
              >
                <p className="text-sm font-semibold text-white">{getDriverName(driverId)}</p>

                {result ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-neutral-500">Credits</p>
                      <p className="mt-1 text-sm text-white">
                        +{result.rewards.creditsEarned}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Driver XP</p>
                      <p className="mt-1 text-sm text-white">
                        +{result.rewards.driverXpEarned}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Morale</p>
                      <p className="mt-1 text-sm text-white">
                        {result.rewards.moraleChange >= 0 ? "+" : ""}
                        {result.rewards.moraleChange}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Fitness Loss</p>
                      <p className="mt-1 text-sm text-white">
                        -{result.rewards.fitnessLoss}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-neutral-400">No post-race result yet.</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className={getCardClassName()}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Next Weekend</p>
            <p className="mt-1 text-sm text-neutral-400">
              Once standings and post-race processing are done, you can advance to the next round.
            </p>
          </div>

          <button
            type="button"
            onClick={onAdvanceToNextWeekend}
            disabled={!canAdvanceToNextWeekend}
            className={[
              "rounded-2xl px-4 py-3 text-sm font-semibold transition",
              !canAdvanceToNextWeekend
                ? "cursor-not-allowed border border-neutral-800 bg-neutral-900 text-neutral-500"
                : "border border-white bg-white text-black hover:opacity-90",
            ].join(" ")}
          >
            Advance To Next Weekend
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-300">
          Current season round pointer: <span className="text-white">{seasonState.currentRound}</span>
        </div>
      </section>

      <section className={getCardClassName()}>
        <p className="text-sm font-semibold text-white">Season Standings</p>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Driver Championship
            </p>

            {seasonState.driverStandings.length > 0 ? (
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-neutral-500">
                    <tr>
                      <th className="pb-2 pr-4 font-medium">Pos</th>
                      <th className="pb-2 pr-4 font-medium">Driver</th>
                      <th className="pb-2 pr-4 font-medium">Pts</th>
                      <th className="pb-2 pr-4 font-medium">W</th>
                      <th className="pb-2 pr-4 font-medium">Pod</th>
                      <th className="pb-2 pr-4 font-medium">R</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seasonState.driverStandings.map((entry, index) => (
                      <tr key={entry.driverId} className="text-neutral-300">
                        <td className="py-2 pr-4">{index + 1}</td>
                        <td className="py-2 pr-4">{entry.driverName}</td>
                        <td className="py-2 pr-4">{entry.points}</td>
                        <td className="py-2 pr-4">{entry.wins}</td>
                        <td className="py-2 pr-4">{entry.podiums}</td>
                        <td className="py-2 pr-4">{entry.races}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-neutral-800 bg-black p-3 text-sm text-neutral-400">
                No driver standings yet.
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Team Championship
            </p>

            {seasonState.teamStandings.length > 0 ? (
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-neutral-500">
                    <tr>
                      <th className="pb-2 pr-4 font-medium">Pos</th>
                      <th className="pb-2 pr-4 font-medium">Team</th>
                      <th className="pb-2 pr-4 font-medium">Pts</th>
                      <th className="pb-2 pr-4 font-medium">W</th>
                      <th className="pb-2 pr-4 font-medium">Pod</th>
                      <th className="pb-2 pr-4 font-medium">R</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seasonState.teamStandings.map((entry, index) => (
                      <tr key={entry.teamId} className="text-neutral-300">
                        <td className="py-2 pr-4">{index + 1}</td>
                        <td className="py-2 pr-4">{entry.teamName}</td>
                        <td className="py-2 pr-4">{entry.points}</td>
                        <td className="py-2 pr-4">{entry.wins}</td>
                        <td className="py-2 pr-4">{entry.podiums}</td>
                        <td className="py-2 pr-4">{entry.races}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-neutral-800 bg-black p-3 text-sm text-neutral-400">
                No team standings yet.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}