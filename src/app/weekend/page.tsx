"use client";

import Link from "next/link";
import WeekendFlowPanel from "@/components/race/WeekendFlowPanel";
import { formatSessionLabel } from "@/lib/weekendSession";
import { useGameState } from "@/hooks/useGameState";

export default function WeekendPage() {
  const {
    weekend,
    seasonState,
    raceDrivers,
    reserveDrivers,
    isMounted,
    sessionInfo,
    canAdvanceToNextWeekend,
    practiceTyreValidation,
    qualifyingTyreValidation,
    raceTyreValidation,
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
              <Link href="/team" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Team</Link>
              <Link href="/upgrades" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Upgrades</Link>
              <Link href="/recovery" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Recovery</Link>
              <Link href="/management" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Management</Link>
              <Link href="/results" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Results</Link>
              <Link href="/standings" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Standings</Link>
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

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
            <p className="text-sm font-semibold text-white">Current Race Line-up</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
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
          </div>

          <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
            <p className="text-sm font-semibold text-white">Reserve Bench</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {reserveDrivers.map((driver) => (
                <div
                  key={driver.id}
                  className="rounded-2xl border border-neutral-800 bg-black p-4"
                >
                  <p className="text-sm font-semibold text-white">{driver.name}</p>
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
          practiceTyreValidation={practiceTyreValidation}
          qualifyingTyreValidation={qualifyingTyreValidation}
          raceTyreValidation={raceTyreValidation}
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