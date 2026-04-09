"use client";

import Link from "next/link";
import WeekendFlowPanel from "@/components/race/WeekendFlowPanel";
import { formatSessionLabel } from "@/lib/weekendSession";
import { useGameState } from "@/hooks/useGameState";

export default function WeekendPage() {
  const {
    weekend,
    seasonState,
    isMounted,
    sessionInfo,
    canAdvanceToNextWeekend,
    handleSetTraining,
    handleSetStrategy,
    handleRunPractice,
    handleRunQualifying,
    handleRunRace,
    handleApplyPostRace,
    handleAdvanceToNextWeekend,
    handleResetWeekend,
  } = useGameState();

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
        <section className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
                Weekend Center
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Round {weekend.round} · {weekend.circuitId}
              </h1>
              <p className="mt-2 text-sm text-neutral-400">
                Session: {formatSessionLabel(sessionInfo.currentSession)}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Back to Dashboard</Link>
              <Link href="/team" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Open Team Page</Link>
              <Link href="/upgrades" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Open Upgrades</Link>
              <Link href="/management" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Open Management</Link>
              <Link href="/results" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Open Results</Link>
              <Link href="/standings" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Open Standings</Link>
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
      </div>
    </main>
  );
}