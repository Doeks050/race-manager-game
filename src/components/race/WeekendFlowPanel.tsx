"use client";

import type { WeekendState } from "@/types/weekend";
import type {
  WeekendPermissions,
  WeekendSessionName,
} from "@/types/weekendSession";
import type { WeekendPracticeResult } from "@/types/weekendPractice";
import type {
  WeekendQualifyingResult,
  WeekendTrainingSelection,
  WeekendTrainingSkill,
  WeekendTrainingTrim,
  WeekendTyreCompoundId,
} from "@/types/weekendQualifying";
import {
  formatCountdown,
  formatSessionLabel,
} from "@/lib/weekendSession";
import { formatLapTime } from "@/lib/weekendQualifying";

interface WeekendFlowPanelProps {
  weekend: WeekendState<
    WeekendTrainingSelection,
    WeekendPracticeResult,
    WeekendQualifyingResult
  >;
  currentSession: WeekendSessionName;
  countdownMs: number | null;
  nextSessionLabel: string | null;
  permissions: WeekendPermissions;
  onSelectDriver: (driverId: string) => void;
  onSetTraining: (training: WeekendTrainingSelection) => void;
  onSetStrategy: (strategyPresetId: string) => void;
  onRunPractice: () => void;
  onRunQualifying: () => void;
}

const DRIVER_OPTIONS = [
  { id: "driver-1", name: "Driver 1" },
  { id: "driver-2", name: "Driver 2" },
];

const STRATEGY_OPTIONS = [
  {
    id: "balanced-2-stop",
    name: "Balanced 2-Stop",
    description: "Stabiele race pace met flexibele stintverdeling.",
  },
  {
    id: "aggressive-soft-start",
    name: "Aggressive Soft Start",
    description: "Sterke openingsfase met meer tyre pressure.",
  },
  {
    id: "long-run-medium",
    name: "Long Run Medium",
    description: "Conservatieve strategie met langere eerste stint.",
  },
];

const SLOT_OPTIONS = [1, 2, 3] as const;

const TRIM_OPTIONS: WeekendTrainingTrim[] = ["race", "quali", "balanced"];

const SKILL_OPTIONS: WeekendTrainingSkill[] = [
  "cornering",
  "straight-line",
  "consistency",
  "tyre-management",
  "pitstop",
];

const COMPOUND_OPTIONS: WeekendTyreCompoundId[] = [
  "ultra-soft",
  "super-soft",
  "soft",
  "medium",
  "hard",
  "intermediate",
  "full-wet",
];

function getCardClassName(): string {
  return "rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 shadow-sm";
}

function getPillClassName(isActive: boolean, isDisabled: boolean): string {
  return [
    "rounded-full border px-3 py-1 text-sm transition",
    isDisabled
      ? "cursor-not-allowed border-neutral-800 bg-neutral-950 text-neutral-600"
      : isActive
      ? "border-white bg-white text-black"
      : "border-neutral-700 bg-neutral-950 text-neutral-200 hover:border-neutral-500",
  ].join(" ");
}

function getSessionStatusText(session: WeekendSessionName): string {
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
      return "Race is live. All management actions are locked.";
    case "post_race_management":
      return "Race weekend is finished. Full management is open again.";
    default:
      return session;
  }
}

export default function WeekendFlowPanel({
  weekend,
  currentSession,
  countdownMs,
  nextSessionLabel,
  permissions,
  onSelectDriver,
  onSetTraining,
  onSetStrategy,
  onRunPractice,
  onRunQualifying,
}: WeekendFlowPanelProps) {
  const currentTraining =
    weekend.trainingPlan ?? ({
      slots: 1,
      trim: "balanced",
      skill: "consistency",
      compound: "medium",
    } satisfies WeekendTrainingSelection);

  const selectedStrategyId = weekend.strategyPresetId ?? "balanced-2-stop";
  const practiceResult = weekend.practice.result;
  const qualifyingResult = weekend.qualifying.result;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
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
                {formatSessionLabel(currentSession)}
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
                {nextSessionLabel ? `To ${nextSessionLabel}` : "No next session"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className={`${getCardClassName()} lg:col-span-1`}>
          <p className="text-sm font-semibold text-white">Weekend Timeline</p>

          <div className="mt-4 flex flex-col gap-2">
            {(
              [
                "pre_practice_management",
                "practice",
                "pre_qualifying_management",
                "qualifying",
                "parc_ferme",
                "race",
                "post_race_management",
              ] as const
            ).map((session) => {
              const isCurrent = currentSession === session;

              return (
                <div
                  key={session}
                  className={[
                    "rounded-xl border px-3 py-2 text-sm",
                    isCurrent
                      ? "border-white bg-white text-black"
                      : "border-neutral-800 bg-neutral-950 text-neutral-400",
                  ].join(" ")}
                >
                  {formatSessionLabel(session)}
                </div>
              );
            })}
          </div>
        </div>

        <div className={`${getCardClassName()} lg:col-span-2`}>
          <p className="text-sm font-semibold text-white">Permissions</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
              <p className="text-xs text-neutral-500">Upgrades</p>
              <p className="mt-1 text-sm text-white">
                {permissions.canUpgrade ? "Open" : "Locked"}
              </p>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
              <p className="text-xs text-neutral-500">Driver</p>
              <p className="mt-1 text-sm text-white">
                {permissions.canChangeDriver ? "Open" : "Locked"}
              </p>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
              <p className="text-xs text-neutral-500">Recovery</p>
              <p className="mt-1 text-sm text-white">
                {permissions.canRecoverDriver ? "Open" : "Locked"}
              </p>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
              <p className="text-xs text-neutral-500">Training</p>
              <p className="mt-1 text-sm text-white">
                {permissions.canEditTraining ? "Open" : "Locked"}
              </p>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
              <p className="text-xs text-neutral-500">Strategy</p>
              <p className="mt-1 text-sm text-white">
                {permissions.canEditStrategy ? "Open" : "Locked"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className={getCardClassName()}>
          <p className="text-sm font-semibold text-white">Management Setup</p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-sm text-neutral-300">Active Driver</p>
              <div className="flex flex-wrap gap-2">
                {DRIVER_OPTIONS.map((driver) => {
                  const isActive = weekend.activeDriverId === driver.id;
                  return (
                    <button
                      key={driver.id}
                      type="button"
                      disabled={!permissions.canChangeDriver}
                      className={getPillClassName(
                        isActive,
                        !permissions.canChangeDriver
                      )}
                      onClick={() => onSelectDriver(driver.id)}
                    >
                      {driver.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm text-neutral-300">Race Strategy</p>
              <div className="flex flex-col gap-3">
                {STRATEGY_OPTIONS.map((strategy) => {
                  const isActive = weekend.strategyPresetId === strategy.id;

                  return (
                    <button
                      key={strategy.id}
                      type="button"
                      disabled={!permissions.canEditStrategy}
                      onClick={() => onSetStrategy(strategy.id)}
                      className={[
                        "rounded-2xl border p-4 text-left transition",
                        !permissions.canEditStrategy
                          ? "cursor-not-allowed border-neutral-800 bg-neutral-950 text-neutral-600"
                          : isActive
                          ? "border-white bg-white text-black"
                          : "border-neutral-800 bg-neutral-950 text-neutral-100 hover:border-neutral-600",
                      ].join(" ")}
                    >
                      <p className="text-sm font-semibold">{strategy.name}</p>
                      <p
                        className={[
                          "mt-1 text-sm",
                          !permissions.canEditStrategy
                            ? "text-neutral-600"
                            : isActive
                            ? "text-black/70"
                            : "text-neutral-400",
                        ].join(" ")}
                      >
                        {strategy.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              <p className="mt-3 text-xs text-neutral-500">
                Active strategy: {selectedStrategyId}
              </p>
            </div>
          </div>
        </div>

        <div className={getCardClassName()}>
          <p className="text-sm font-semibold text-white">Friday Training Setup</p>

          <div className="mt-4 flex flex-col gap-4">
            <div>
              <p className="mb-2 text-sm text-neutral-300">Slots</p>
              <div className="flex flex-wrap gap-2">
                {SLOT_OPTIONS.map((slots) => {
                  const isActive = currentTraining.slots === slots;

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
                        onSetTraining({
                          ...currentTraining,
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
              <p className="mb-2 text-sm text-neutral-300">Trim</p>
              <div className="flex flex-wrap gap-2">
                {TRIM_OPTIONS.map((trim) => {
                  const isActive = currentTraining.trim === trim;

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
                        onSetTraining({
                          ...currentTraining,
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
              <p className="mb-2 text-sm text-neutral-300">Skill Focus</p>
              <div className="flex flex-wrap gap-2">
                {SKILL_OPTIONS.map((skill) => {
                  const isActive = currentTraining.skill === skill;

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
                        onSetTraining({
                          ...currentTraining,
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
              <p className="mb-2 text-sm text-neutral-300">Compound Focus</p>
              <div className="flex flex-wrap gap-2">
                {COMPOUND_OPTIONS.map((compound) => {
                  const isActive = currentTraining.compound === compound;

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
                        onSetTraining({
                          ...currentTraining,
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

            <button
              type="button"
              onClick={onRunPractice}
              disabled={currentSession !== "practice" || weekend.practice.isCompleted}
              className={[
                "rounded-2xl px-4 py-3 text-sm font-semibold transition",
                currentSession !== "practice" || weekend.practice.isCompleted
                  ? "cursor-not-allowed border border-neutral-800 bg-neutral-900 text-neutral-500"
                  : "border border-white bg-white text-black hover:opacity-90",
              ].join(" ")}
            >
              {weekend.practice.isCompleted ? "Practice Completed" : "Run Free Practice"}
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className={getCardClassName()}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">Practice Result</p>
              <p className="mt-1 text-sm text-neutral-400">
                Friday result shows what your training delivered.
              </p>
            </div>
          </div>

          {practiceResult ? (
            <div className="mt-4 flex flex-col gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                  <p className="text-xs text-neutral-500">Position</p>
                  <p className="mt-1 text-2xl font-semibold text-white">
                    P{practiceResult.playerPosition}
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                  <p className="text-xs text-neutral-500">Best Lap</p>
                  <p className="mt-1 text-2xl font-semibold text-white">
                    {formatLapTime(practiceResult.playerBestLapMs)}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                <p className="text-xs uppercase tracking-wide text-neutral-500">
                  Weekend Gains
                </p>

                <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <div>
                    <p className="text-xs text-neutral-500">Quali Boost</p>
                    <p className="mt-1 text-sm text-white">
                      +{practiceResult.boosts.qualiBonusPct}%
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-neutral-500">Race Boost</p>
                    <p className="mt-1 text-sm text-white">
                      +{practiceResult.boosts.raceBonusPct}%
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-neutral-500">Consistency</p>
                    <p className="mt-1 text-sm text-white">
                      +{practiceResult.boosts.consistencyBonusPct}%
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-neutral-500">Tyre Wear Reduction</p>
                    <p className="mt-1 text-sm text-white">
                      -{practiceResult.boosts.tyreWearReductionPct}%
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-neutral-500">Pitstop Bonus</p>
                    <p className="mt-1 text-sm text-white">
                      +{practiceResult.boosts.pitstopBonusPct}%
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-neutral-500">Reference Compound</p>
                    <p className="mt-1 text-sm text-white">
                      {practiceResult.tyreCompoundId}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                <p className="text-xs uppercase tracking-wide text-neutral-500">
                  Practice Notes
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  {practiceResult.notes.map((note, index) => (
                    <p key={index} className="text-sm text-neutral-300">
                      • {note}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-400">
              No Friday result yet.
            </div>
          )}
        </div>

        <div className={getCardClassName()}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">Qualifying Result</p>
              <p className="mt-1 text-sm text-neutral-400">
                Saturday qualifying unlocks the final parc fermé window.
              </p>
            </div>

            <button
              type="button"
              onClick={onRunQualifying}
              disabled={
                currentSession !== "qualifying" || weekend.qualifying.isCompleted
              }
              className={[
                "rounded-2xl px-4 py-3 text-sm font-semibold transition",
                currentSession !== "qualifying" || weekend.qualifying.isCompleted
                  ? "cursor-not-allowed border border-neutral-800 bg-neutral-900 text-neutral-500"
                  : "border border-white bg-white text-black hover:opacity-90",
              ].join(" ")}
            >
              {weekend.qualifying.isCompleted ? "Qualifying Completed" : "Run Qualifying"}
            </button>
          </div>

          {qualifyingResult ? (
            <div className="mt-4 flex flex-col gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                  <p className="text-xs text-neutral-500">Grid Position</p>
                  <p className="mt-1 text-2xl font-semibold text-white">
                    P{qualifyingResult.playerPosition}
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                  <p className="text-xs text-neutral-500">Best Lap</p>
                  <p className="mt-1 text-2xl font-semibold text-white">
                    {formatLapTime(qualifyingResult.playerBestLapMs)}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                <p className="text-xs uppercase tracking-wide text-neutral-500">
                  Top 10
                </p>

                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-neutral-500">
                      <tr>
                        <th className="pb-2 pr-4 font-medium">Pos</th>
                        <th className="pb-2 pr-4 font-medium">Driver</th>
                        <th className="pb-2 pr-4 font-medium">Team</th>
                        <th className="pb-2 pr-4 font-medium">Lap</th>
                        <th className="pb-2 pr-4 font-medium">Gap</th>
                      </tr>
                    </thead>
                    <tbody>
                      {qualifyingResult.entries.slice(0, 10).map((entry) => (
                        <tr
                          key={entry.driverId}
                          className={entry.isPlayer ? "text-white" : "text-neutral-300"}
                        >
                          <td className="py-2 pr-4">{entry.position}</td>
                          <td className="py-2 pr-4">
                            {entry.driverName}
                            {entry.isPlayer ? " (You)" : ""}
                          </td>
                          <td className="py-2 pr-4">{entry.teamId}</td>
                          <td className="py-2 pr-4">{formatLapTime(entry.lapTimeMs)}</td>
                          <td className="py-2 pr-4">
                            {entry.position === 1
                              ? "—"
                              : `+${(entry.gapToPoleMs / 1000).toFixed(3)}s`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {currentSession === "parc_ferme" && (
                <div className="rounded-2xl border border-amber-700/50 bg-amber-950/20 p-4 text-sm text-amber-200">
                  Parc fermé is active. Only race strategy can still be changed.
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-400">
              No qualifying result yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}