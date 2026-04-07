"use client";

import { useEffect, useMemo, useState } from "react";
import WeekendFlowPanel from "@/components/race/WeekendFlowPanel";
import {
  applyWeekendToSeason,
  createInitialSeasonState,
} from "@/lib/season";
import {
  completeWeekendPractice,
  completeWeekendQualifying,
  completeWeekendRace,
  completeWeekendPostRace,
  createWeekend,
  markWeekendRewardsApplied,
  setWeekendActiveDriver,
  setWeekendStrategy,
  setWeekendTraining,
} from "@/lib/weekend";
import { buildWeekendPostRaceResult } from "@/lib/weekendPostRace";
import { simulateWeekendPractice } from "@/lib/weekendPractice";
import {
  formatSessionLabel,
  getWeekendSessionInfo,
} from "@/lib/weekendSession";
import { simulateWeekendQualifying } from "@/lib/weekendQualifying";
import { simulateWeekendRace } from "@/lib/weekendRace";
import type { SeasonState } from "@/types/season";
import type { WeekendState } from "@/types/weekend";
import type { WeekendPracticeResult } from "@/types/weekendPractice";
import type {
  WeekendQualifyingResult,
  WeekendTrainingSelection,
} from "@/types/weekendQualifying";
import type { WeekendRaceResult } from "@/types/weekendRace";
import type { WeekendPostRaceResult } from "@/types/weekendPostRace";

function createStableDemoSchedule() {
  return {
    practiceAt: "2026-04-10T18:00:00.000Z",
    qualifyingAt: "2026-04-11T15:00:00.000Z",
    raceAt: "2026-04-12T16:00:00.000Z",
  };
}

function createInitialWeekend(): WeekendState<
  WeekendTrainingSelection,
  WeekendPracticeResult,
  WeekendQualifyingResult,
  WeekendRaceResult,
  WeekendPostRaceResult
> {
  return createWeekend<
    WeekendTrainingSelection,
    WeekendPracticeResult,
    WeekendQualifyingResult,
    WeekendRaceResult,
    WeekendPostRaceResult
  >({
    id: "weekend-1",
    season: 1,
    round: 1,
    teamId: "starter-team",
    circuitId: "melbourne",
    weatherId: "sunny",
    schedule: createStableDemoSchedule(),
    activeDriverId: "driver-1",
  });
}

function formatIsoForDisplay(iso: string): string {
  return iso.replace("T", " ").replace(".000Z", " UTC");
}

export default function HomePage() {
  const [weekend, setWeekend] = useState<
    WeekendState<
      WeekendTrainingSelection,
      WeekendPracticeResult,
      WeekendQualifyingResult,
      WeekendRaceResult,
      WeekendPostRaceResult
    >
  >(() => createInitialWeekend());

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

  const summary = useMemo(() => {
    return {
      currentSession: sessionInfo.currentSession,
      nextSession: sessionInfo.nextSession,
      countdownMs: sessionInfo.countdownMs,
      permissions: sessionInfo.permissions,
      activeDriverId: weekend.activeDriverId,
      strategyPresetId: weekend.strategyPresetId,
      trainingPlan: weekend.trainingPlan,
      practiceCompleted: weekend.practice.isCompleted,
      qualifyingCompleted: weekend.qualifying.isCompleted,
      raceCompleted: weekend.race.isCompleted,
      postRaceCompleted: weekend.postRace.isCompleted,
      rewardsApplied: weekend.postRace.rewardsApplied,
      raceFinishPosition: weekend.race.result?.finishPosition ?? null,
      creditsEarned: weekend.postRace.result?.rewards.creditsEarned ?? null,
      seasonCurrentRound: seasonState.currentRound,
      driverStandings: seasonState.driverStandings,
      teamStandings: seasonState.teamStandings,
      schedule: weekend.schedule,
    };
  }, [sessionInfo, weekend, seasonState]);

  function handleSelectDriver(driverId: string) {
    if (!sessionInfo.permissions.canChangeDriver) {
      return;
    }

    setWeekend((current) => setWeekendActiveDriver(current, driverId));
  }

  function handleSetTraining(training: WeekendTrainingSelection) {
    if (!sessionInfo.permissions.canEditTraining) {
      return;
    }

    setWeekend((current) => setWeekendTraining(current, training));
  }

  function handleSetStrategy(strategyPresetId: string) {
    if (!sessionInfo.permissions.canEditStrategy) {
      return;
    }

    setWeekend((current) => setWeekendStrategy(current, strategyPresetId));
  }

  function handleRunPractice() {
    setWeekend((current) => {
      const currentInfo = getWeekendSessionInfo(current, Date.now());

      if (currentInfo.currentSession !== "practice") {
        return current;
      }

      if (current.practice.isCompleted) {
        return current;
      }

      if (!current.activeDriverId) {
        return current;
      }

      const result = simulateWeekendPractice({
        teamId: current.teamId,
        circuitId: current.circuitId,
        weatherId: current.weatherId,
        activeDriverId: current.activeDriverId,
        trainingPlan: current.trainingPlan,
      });

      return completeWeekendPractice(current, result);
    });
  }

  function handleRunQualifying() {
    setWeekend((current) => {
      const currentInfo = getWeekendSessionInfo(current, Date.now());

      if (currentInfo.currentSession !== "qualifying") {
        return current;
      }

      if (current.qualifying.isCompleted) {
        return current;
      }

      if (!current.activeDriverId) {
        return current;
      }

      const result = simulateWeekendQualifying({
        teamId: current.teamId,
        circuitId: current.circuitId,
        weatherId: current.weatherId,
        activeDriverId: current.activeDriverId,
        trainingPlan: current.trainingPlan,
      });

      return completeWeekendQualifying(current, result);
    });
  }

  function handleRunRace() {
    setWeekend((current) => {
      const currentInfo = getWeekendSessionInfo(current, Date.now());

      if (currentInfo.currentSession !== "race") {
        return current;
      }

      if (current.race.isCompleted) {
        return current;
      }

      if (!current.activeDriverId) {
        return current;
      }

      const result = simulateWeekendRace({
        teamId: current.teamId,
        circuitId: current.circuitId,
        weatherId: current.weatherId,
        activeDriverId: current.activeDriverId,
        strategyPresetId: current.strategyPresetId,
        qualifyingPosition: current.qualifying.result?.playerPosition ?? null,
        practiceBoosts: current.practice.result?.boosts ?? null,
      });

      return completeWeekendRace(current, result);
    });
  }

  function handleApplyPostRace() {
    setWeekend((current) => {
      if (!current.race.isCompleted) {
        return current;
      }

      if (!current.race.result) {
        return current;
      }

      if (current.postRace.rewardsApplied) {
        return current;
      }

      const postRaceResult = buildWeekendPostRaceResult(current.race.result);
      const withPostRace = completeWeekendPostRace(current, postRaceResult);
      return markWeekendRewardsApplied(withPostRace);
    });

    setSeasonState((currentSeason) => {
      if (!weekend.race.result || !weekend.postRace.result && !weekend.race.isCompleted) {
        return currentSeason;
      }

      const raceResult = weekend.race.result;
      const derivedPostRace =
        weekend.postRace.result ?? (raceResult ? buildWeekendPostRaceResult(raceResult) : null);

      if (!raceResult || !derivedPostRace) {
        return currentSeason;
      }

      return applyWeekendToSeason({
        seasonState: currentSeason,
        weekendId: weekend.id,
        round: weekend.round,
        circuitId: weekend.circuitId,
        raceResult,
        postRaceResult: derivedPostRace,
      });
    });
  }

  function handleResetWeekend() {
    setWeekend(createInitialWeekend());
    setSeasonState(createInitialSeasonState(1));

    if (isMounted) {
      setNowMs(Date.now());
    }
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
            De weekend flow is nu tijdgestuurd. Friday practice, Saturday qualifying
            en Sunday race zijn vaste sessies. Tussen de sessies zijn management
            windows open. Na qualifying geldt parc fermé: alleen race strategy mag
            dan nog aangepast worden.
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
          onSelectDriver={handleSelectDriver}
          onSetTraining={handleSetTraining}
          onSetStrategy={handleSetStrategy}
          onRunPractice={handleRunPractice}
          onRunQualifying={handleRunQualifying}
          onRunRace={handleRunRace}
          onApplyPostRace={handleApplyPostRace}
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