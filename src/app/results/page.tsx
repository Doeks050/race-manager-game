"use client";

import Link from "next/link";
import { formatLapTime } from "@/lib/weekendQualifying";
import { formatRaceTime } from "@/lib/weekendRace";
import { formatCountdown, formatSessionLabel } from "@/lib/weekendSession";
import { useGameState } from "@/hooks/useGameState";

function formatUsedSessions(sessions: string[]): string {
  if (sessions.length === 0) {
    return "Not used yet";
  }

  return sessions.join(" / ");
}

function getTyreStatusClassName(status: string): string {
  switch (status) {
    case "available":
      return "border-emerald-800/60 bg-emerald-950/20 text-emerald-200";
    case "used":
      return "border-orange-800/60 bg-orange-950/20 text-orange-200";
    case "locked":
      return "border-red-800/60 bg-red-950/20 text-red-200";
    default:
      return "border-neutral-800 bg-neutral-950 text-neutral-200";
  }
}

export default function ResultsPage() {
  const {
    weekend,
    team,
    raceDrivers,
    reserveDrivers,
    isMounted,
    sessionInfo,
    currentWeekendTyreAllocation,
    currentWeekendTyreAllocationSummary,
    handleResetWeekend,
  } = useGameState();

  const hasPractice = weekend.practice.isCompleted;
  const hasQualifying = weekend.qualifying.isCompleted;
  const hasRace = weekend.race.isCompleted;
  const hasPostRace = weekend.postRace.rewardsApplied;

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
        <section className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Results Page</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">Weekend Results Overview</h1>
              <p className="mt-2 text-sm text-neutral-400">
                Results van de huidige 2 race drivers. Reserve drivers rijden niet mee in deze weekend output.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Back to Dashboard</Link>
              <Link href="/team" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Team</Link>
              <Link href="/upgrades" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Upgrades</Link>
              <Link href="/recovery" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Recovery</Link>
              <Link href="/management" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Management</Link>
              <Link href="/weekend" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Weekend</Link>
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
            <p className="text-xs uppercase tracking-wide text-neutral-500">Completed Sessions</p>
            <p className="mt-2 text-sm text-white">
              {[hasPractice, hasQualifying, hasRace, hasPostRace].filter(Boolean).length} / 4
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">Round</p>
            <p className="mt-2 text-sm text-white">{weekend.round} · {weekend.circuitId}</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">Credits</p>
            <p className="mt-2 text-sm text-white">{team.credits}</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">Race Drivers</p>
            <p className="mt-2 text-sm text-white">
              {raceDrivers.map((driver) => driver.name).join(" / ")}
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
            <p className="text-sm font-semibold text-white">Weekend Line-up</p>
            <div className="mt-4 grid gap-3">
              {raceDrivers.map((driver, index) => (
                <div key={driver.id} className="rounded-2xl border border-neutral-800 bg-black p-4">
                  <p className="text-xs text-neutral-500">Seat {index + 1}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{driver.name}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
            <p className="text-sm font-semibold text-white">Reserves</p>
            <div className="mt-4 grid gap-3">
              {reserveDrivers.map((driver) => (
                <div key={driver.id} className="rounded-2xl border border-neutral-800 bg-black p-4">
                  <p className="text-sm font-semibold text-white">{driver.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">Weekend Tyre Status</p>
              <p className="mt-1 text-sm text-neutral-400">
                Overzicht van alle gebruikte en resterende sets in dit weekend.
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
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                    <p className="text-xs text-neutral-500">Total</p>
                    <p className="mt-1 text-white">{row.total}</p>
                  </div>
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                    <p className="text-xs text-neutral-500">Available</p>
                    <p className="mt-1 text-white">{row.available}</p>
                  </div>
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                    <p className="text-xs text-neutral-500">Used</p>
                    <p className="mt-1 text-white">{row.used}</p>
                  </div>
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                    <p className="text-xs text-neutral-500">Locked</p>
                    <p className="mt-1 text-white">{row.locked}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <p className="text-sm font-semibold text-white">Individual Sets</p>

            {currentWeekendTyreAllocation ? (
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {currentWeekendTyreAllocation.sets.map((set) => (
                  <div
                    key={set.id}
                    className="rounded-2xl border border-neutral-800 bg-black p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{set.label}</p>
                        <p className="mt-1 text-sm text-neutral-400">{set.compound}</p>
                      </div>

                      <div
                        className={[
                          "rounded-full border px-3 py-1 text-xs font-semibold",
                          getTyreStatusClassName(set.status),
                        ].join(" ")}
                      >
                        {set.status.toUpperCase()}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                        <p className="text-xs text-neutral-500">Wear</p>
                        <p className="mt-1 text-sm text-white">{set.wear}%</p>
                      </div>

                      <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                        <p className="text-xs text-neutral-500">Used In</p>
                        <p className="mt-1 text-sm text-white">{formatUsedSessions(set.usedInSessions)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-neutral-800 bg-black p-4 text-sm text-neutral-400">
                No tyre allocation loaded for this weekend.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
          <p className="text-sm font-semibold text-white">Practice Results</p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {weekend.driverIds.map((driverId, index) => {
              const driver = team.drivers.find((entry) => entry.id === driverId);
              const result = weekend.practice.resultsByDriver[driverId];

              return (
                <div key={`practice-${driverId}`} className="rounded-2xl border border-neutral-800 bg-black p-4">
                  <p className="text-xs text-neutral-500">Seat {index + 1}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{driver?.name ?? driverId}</p>

                  {result ? (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-neutral-500">Position</p>
                        <p className="mt-1 text-sm text-white">P{result.playerPosition}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Best Lap</p>
                        <p className="mt-1 text-sm text-white">{formatLapTime(result.playerBestLapMs)}</p>
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

        <section className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
          <p className="text-sm font-semibold text-white">Qualifying Results</p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {weekend.driverIds.map((driverId, index) => {
              const driver = team.drivers.find((entry) => entry.id === driverId);
              const result = weekend.qualifying.resultsByDriver[driverId];

              return (
                <div key={`quali-${driverId}`} className="rounded-2xl border border-neutral-800 bg-black p-4">
                  <p className="text-xs text-neutral-500">Seat {index + 1}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{driver?.name ?? driverId}</p>

                  {result ? (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-neutral-500">Grid Position</p>
                        <p className="mt-1 text-sm text-white">P{result.playerPosition}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Best Lap</p>
                        <p className="mt-1 text-sm text-white">{formatLapTime(result.playerBestLapMs)}</p>
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

        <section className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
          <p className="text-sm font-semibold text-white">Race Results</p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {weekend.driverIds.map((driverId, index) => {
              const driver = team.drivers.find((entry) => entry.id === driverId);
              const result = weekend.race.resultsByDriver[driverId];

              return (
                <div key={`race-${driverId}`} className="rounded-2xl border border-neutral-800 bg-black p-4">
                  <p className="text-xs text-neutral-500">Seat {index + 1}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{driver?.name ?? driverId}</p>

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
                        <p className="text-xs text-neutral-500">Positions Gained</p>
                        <p className="mt-1 text-sm text-white">
                          {result.positionsGained >= 0 ? "+" : ""}
                          {result.positionsGained}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Race Time</p>
                        <p className="mt-1 text-sm text-white">{formatRaceTime(result.totalRaceTimeMs)}</p>
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
      </div>
    </main>
  );
}