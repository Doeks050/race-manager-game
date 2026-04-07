"use client";

import { useEffect, useMemo, useState } from "react";
import WeekendFlowPanel from "@/components/race/WeekendFlowPanel";
import {
  completeWeekendPractice,
  completeWeekendQualifying,
  createWeekend,
  setWeekendActiveDriver,
  setWeekendStrategy,
  setWeekendTraining,
} from "@/lib/weekend";
import { simulateWeekendPractice } from "@/lib/weekendPractice";
import {
  formatSessionLabel,
  getWeekendSessionInfo,
} from "@/lib/weekendSession";
import { simulateWeekendQualifying } from "@/lib/weekendQualifying";
import type { WeekendState } from "@/types/weekend";
import type { WeekendPracticeResult } from "@/types/weekendPractice";
import type { WeekendQualifyingResult, WeekendTrainingSelection } from "@/types/weekendQualifying";

function createDemoSchedule() {
  const now = Date.now();

  return {
    practiceAt: new Date(now + 2 * 60 * 1000).toISOString(),
    qualifyingAt: new Date(now + 4 * 60 * 1000).toISOString(),
    raceAt: new Date(now + 6 * 60 * 1000).toISOString(),
  };
}

function createInitialWeekend(): WeekendState<
  WeekendTrainingSelection,
  WeekendPracticeResult,
  WeekendQualifyingResult
> {
  return createWeekend<
    WeekendTrainingSelection,
    WeekendPracticeResult,
    WeekendQualifyingResult
  >({
    id: "weekend-1",
    season: 1,
    round: 1,
    teamId: "starter-team",
    circuitId: "melbourne",
    weatherId: "sunny",
    schedule: createDemoSchedule(),
    activeDriverId: "driver-1",
  });
}

export default function HomePage() {
  const [weekend, setWeekend] = useState<
    WeekendState<
      WeekendTrainingSelection,
      WeekendPracticeResult,
      WeekendQualifyingResult
    >
  >(() => createInitialWeekend());

  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const sessionInfo = useMemo(() => {
    return getWeekendSessionInfo(weekend, nowMs);
  }, [weekend, nowMs]);

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
      schedule: weekend.schedule,
    };
  }, [sessionInfo, weekend]);

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

  function handleResetWeekend() {
    setWeekend(createInitialWeekend());
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
                {new Date(weekend.schedule.practiceAt).toLocaleString()}
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-black p-4">
              <p className="text-xs uppercase tracking-wide text-neutral-500">
                Qualifying At
              </p>
              <p className="mt-1 text-sm text-white">
                {new Date(weekend.schedule.qualifyingAt).toLocaleString()}
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-black p-4">
              <p className="text-xs uppercase tracking-wide text-neutral-500">
                Race At
              </p>
              <p className="mt-1 text-sm text-white">
                {new Date(weekend.schedule.raceAt).toLocaleString()}
              </p>
            </div>
          </div>
        </section>

        <WeekendFlowPanel
          weekend={weekend}
          currentSession={sessionInfo.currentSession}
          countdownMs={sessionInfo.countdownMs}
          nextSessionLabel={
            sessionInfo.nextSession ? formatSessionLabel(sessionInfo.nextSession) : null
          }
          permissions={sessionInfo.permissions}
          onSelectDriver={handleSelectDriver}
          onSetTraining={handleSetTraining}
          onSetStrategy={handleSetStrategy}
          onRunPractice={handleRunPractice}
          onRunQualifying={handleRunQualifying}
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