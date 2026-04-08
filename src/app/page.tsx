"use client";

import { createDefaultRaceStrategy } from "@/lib/raceStrategy";
import { applyWeekendToSeason, createInitialSeasonState } from "@/lib/season";
import {
  advanceToNextWeekend,
  canAdvanceWeekend,
  createWeekendFromCalendarRound,
} from "@/lib/weekendAdvance";
import {
  completeWeekendPractice,
  completeWeekendPostRace,
  completeWeekendQualifying,
  completeWeekendRace,
  markWeekendRewardsApplied,
  setWeekendDriverStrategy,
  setWeekendDriverTraining,
} from "@/lib/weekend";
import { buildWeekendPostRaceResult } from "@/lib/weekendPostRace";
import { simulateWeekendPractice } from "@/lib/weekendPractice";
import { simulateWeekendQualifying } from "@/lib/weekendQualifying";
import { simulateWeekendRace } from "@/lib/weekendRace";
import {
  DEV_WEEKEND_MODE,
  formatSessionLabel,
  getWeekendSessionInfo,
} from "@/lib/weekendSession";
import type { DriverRaceStrategy } from "@/types/raceStrategy";
import type { SeasonState } from "@/types/season";
import type { WeekendPostRaceResult } from "@/types/weekendPostRace";
import type { WeekendPracticeResult } from "@/types/weekendPractice";
import type {
  WeekendQualifyingResult,
  WeekendTrainingSelection,
} from "@/types/weekendQualifying";
import type { WeekendRaceResult } from "@/types/weekendRace";
import type { WeekendState } from "@/types/weekend";
import { useEffect, useMemo, useState } from "react";
import WeekendFlowPanel from "@/components/race/WeekendFlowPanel";

type AppWeekendState = WeekendState<
  WeekendTrainingSelection,
  WeekendPracticeResult,
  WeekendQualifyingResult,
  WeekendRaceResult,
  WeekendPostRaceResult
>;

function createInitialWeekend(): AppWeekendState {
  const weekend = createWeekendFromCalendarRound({
    season: 1,
    round: 1,
    teamId: "starter-team",
    activeDriverId: "driver-1",
  });

  if (!weekend) {
    throw new Error("Could not create initial weekend from calendar round 1.");
  }

  return weekend as AppWeekendState;
}

function formatIsoForDisplay(iso: string): string {
  return iso.replace("T", " ").replace(".000Z", " UTC");
}

export default function HomePage() {
  const [weekend, setWeekend] = useState<AppWeekendState>(() => createInitialWeekend());
  const [seasonState, setSeasonState] = useState<SeasonState>(() =>
    createInitialSeasonState(1)
  );
  const [isMounted, setIsMounted] = useState(false);
  const [nowMs, setNowMs] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    setNowMs(Date.now());

    const interval = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const sessionInfo = useMemo(() => {
    if (!isMounted) {
      return getWeekendSessionInfo(weekend, 0);
    }

    return getWeekendSessionInfo(weekend, nowMs);
  }, [weekend, nowMs, isMounted]);

  const canAdvanceToNextWeekend = useMemo(() => {
    return canAdvanceWeekend(weekend);
  }, [weekend]);

  const summary = useMemo(() => {
    return {
      devMode: DEV_WEEKEND_MODE,
      currentSession: sessionInfo.currentSession,
      nextSession: sessionInfo.nextSession,
      countdownMs: sessionInfo.countdownMs,
      permissions: sessionInfo.permissions,
      driverSetups: weekend.driverSetups,
      practiceCompleted: weekend.practice.isCompleted,
      qualifyingCompleted: weekend.qualifying.isCompleted,
      raceCompleted: weekend.race.isCompleted,
      postRaceCompleted: weekend.postRace.isCompleted,
      rewardsApplied: weekend.postRace.rewardsApplied,
      seasonCurrentRound: seasonState.currentRound,
      driverStandings: seasonState.driverStandings,
      teamStandings: seasonState.teamStandings,
      schedule: weekend.schedule,
      canAdvanceToNextWeekend,
    };
  }, [sessionInfo, weekend, seasonState, canAdvanceToNextWeekend]);

  function handleSetTraining(driverId: string, training: WeekendTrainingSelection) {
    setWeekend((current: AppWeekendState) =>
      setWeekendDriverTraining(current, driverId, training) as AppWeekendState
    );
  }

  function handleSetStrategy(driverId: string, raceStrategy: DriverRaceStrategy) {
    setWeekend((current: AppWeekendState) =>
      setWeekendDriverStrategy(current, driverId, raceStrategy) as AppWeekendState
    );
  }

  function handleRunPractice() {
    setWeekend((current: AppWeekendState) => {
      if (current.practice.isCompleted) {
        return current;
      }

      const resultsByDriver: Record<string, WeekendPracticeResult | null> = {};

      current.driverIds.forEach((driverId) => {
        const setup = current.driverSetups[driverId];
        const trainingPlan =
          setup?.trainingPlan ?? {
            slots: 1,
            trim: "balanced",
            skill: "consistency",
            compound: "medium",
          };

        resultsByDriver[driverId] = simulateWeekendPractice({
          teamId: current.teamId,
          circuitId: current.circuitId,
          weatherId: current.weatherId,
          activeDriverId: driverId,
          trainingPlan,
        });
      });

      return completeWeekendPractice(current, resultsByDriver) as AppWeekendState;
    });
  }

  function handleRunQualifying() {
    setWeekend((current: AppWeekendState) => {
      if (current.qualifying.isCompleted) {
        return current;
      }

      const resultsByDriver: Record<string, WeekendQualifyingResult | null> = {};

      current.driverIds.forEach((driverId) => {
        const setup = current.driverSetups[driverId];
        const trainingPlan =
          setup?.trainingPlan ?? {
            slots: 1,
            trim: "balanced",
            skill: "consistency",
            compound: "medium",
          };

        resultsByDriver[driverId] = simulateWeekendQualifying({
          teamId: current.teamId,
          circuitId: current.circuitId,
          weatherId: current.weatherId,
          activeDriverId: driverId,
          trainingPlan,
        });
      });

      return completeWeekendQualifying(current, resultsByDriver) as AppWeekendState;
    });
  }

  function handleRunRace() {
    setWeekend((current: AppWeekendState) => {
      if (current.race.isCompleted) {
        return current;
      }

      const resultsByDriver: Record<string, WeekendRaceResult | null> = {};

      current.driverIds.forEach((driverId) => {
        const setup = current.driverSetups[driverId];
        const practiceResult = current.practice.resultsByDriver[driverId];
        const qualifyingResult = current.qualifying.resultsByDriver[driverId];

        resultsByDriver[driverId] = simulateWeekendRace({
          teamId: current.teamId,
          circuitId: current.circuitId,
          weatherId: current.weatherId,
          activeDriverId: driverId,
          raceStrategy: setup?.raceStrategy ?? createDefaultRaceStrategy(2),
          qualifyingPosition: qualifyingResult?.playerPosition ?? null,
          practiceBoosts: practiceResult?.boosts ?? null,
        });
      });

      return completeWeekendRace(current, resultsByDriver) as AppWeekendState;
    });
  }

  function handleApplyPostRace() {
    if (weekend.postRace.rewardsApplied) {
      return;
    }

    const raceResults = Object.values(weekend.race.resultsByDriver).filter(
      (value): value is WeekendRaceResult => value !== null
    );

    if (raceResults.length === 0) {
      return;
    }

    const postRaceResultsByDriver: Record<string, WeekendPostRaceResult | null> = {};

    weekend.driverIds.forEach((driverId) => {
      const raceResult = weekend.race.resultsByDriver[driverId];
      postRaceResultsByDriver[driverId] = raceResult
        ? buildWeekendPostRaceResult(raceResult)
        : null;
    });

    setWeekend((current: AppWeekendState) => {
      if (!current.race.isCompleted || current.postRace.rewardsApplied) {
        return current;
      }

      const withPostRace = completeWeekendPostRace(
        current,
        postRaceResultsByDriver
      ) as AppWeekendState;

      return markWeekendRewardsApplied(withPostRace) as AppWeekendState;
    });

    setSeasonState((currentSeason: SeasonState) =>
      applyWeekendToSeason({
        seasonState: currentSeason,
        weekendId: weekend.id,
        round: weekend.round,
        circuitId: weekend.circuitId,
        raceResults,
      })
    );
  }

  function handleAdvanceToNextWeekend() {
    const result = advanceToNextWeekend({
      currentWeekend: weekend,
      seasonState,
    });

    if (!result.nextWeekend) {
      return;
    }

    setWeekend(result.nextWeekend as AppWeekendState);
    setNowMs(Date.now());
  }

  function handleResetWeekend() {
    setWeekend(createInitialWeekend());
    setSeasonState(createInitialSeasonState(1));
    setNowMs(Date.now());
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
        <section className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
            Race Manager Game
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Timed Weekend Session Flow
          </h1>
          <p className="mt-3 max-w-4xl text-sm text-neutral-400">
            Weekend flow now supports both drivers with custom stint-based strategy.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleResetWeekend}
              className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:border-neutral-500"
            >
              Reset Demo Weekend
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-neutral-800 bg-black p-4">
              <p className="text-xs uppercase tracking-wide text-neutral-500">
                Practice At
              </p>
              <p className="mt-1 text-sm text-white">
                {formatIsoForDisplay(weekend.schedule.practiceAt)}
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-black p-4">
              <p className="text-xs uppercase tracking-wide text-neutral-500">
                Qualifying At
              </p>
              <p className="mt-1 text-sm text-white">
                {formatIsoForDisplay(weekend.schedule.qualifyingAt)}
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-black p-4">
              <p className="text-xs uppercase tracking-wide text-neutral-500">
                Race At
              </p>
              <p className="mt-1 text-sm text-white">
                {formatIsoForDisplay(weekend.schedule.raceAt)}
              </p>
            </div>
          </div>
        </section>

        <WeekendFlowPanel
          weekend={weekend}
          seasonState={seasonState}
          currentSession={sessionInfo.currentSession}
          countdownMs={isMounted ? sessionInfo.countdownMs : null}
          nextSessionLabel={
            sessionInfo.nextSession ? formatSessionLabel(sessionInfo.nextSession) : null
          }
          permissions={sessionInfo.permissions}
          canAdvanceToNextWeekend={canAdvanceToNextWeekend}
          onSetTraining={handleSetTraining}
          onSetStrategy={handleSetStrategy}
          onRunPractice={handleRunPractice}
          onRunQualifying={handleRunQualifying}
          onRunRace={handleRunRace}
          onApplyPostRace={handleApplyPostRace}
          onAdvanceToNextWeekend={handleAdvanceToNextWeekend}
        />

        <section className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
          <p className="text-sm font-semibold text-white">Debug Summary</p>

          <div className="mt-4 overflow-x-auto">
            <pre className="rounded-2xl border border-neutral-800 bg-black p-4 text-xs leading-6 text-neutral-300">
{JSON.stringify(summary, null, 2)}
            </pre>
          </div>
        </section>
      </div>
    </main>
  );
}