"use client";

import Link from "next/link";
import { formatLapTime } from "@/lib/weekendQualifying";
import { formatRaceTime } from "@/lib/weekendRace";
import { formatCountdown, formatSessionLabel } from "@/lib/weekendSession";
import { useGameState } from "@/hooks/useGameState";

const DRIVER_NAMES: Record<string, string> = {
  "driver-1": "Driver 1",
  "driver-2": "Driver 2",
};

function getDriverName(driverId: string): string {
  return DRIVER_NAMES[driverId] ?? driverId;
}

export default function ResultsPage() {
  const { weekend, team, isMounted, sessionInfo, handleResetWeekend } = useGameState();

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
                Eén centrale plek voor practice, qualifying, race en post-race uitkomsten van jouw team.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Back to Dashboard</Link>
              <Link href="/team" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Open Team Page</Link>
              <Link href="/upgrades" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Open Upgrades</Link>
              <Link href="/management" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Open Management</Link>
              <Link href="/weekend" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Open Weekend Center</Link>
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

        <section className="grid gap-4 md:grid-cols-5">
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
        </section>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
          <p className="text-sm font-semibold text-white">Practice Results</p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {weekend.driverIds.map((driverId) => {
              const result = weekend.practice.resultsByDriver[driverId];

              return (
                <div key={`practice-${driverId}`} className="rounded-2xl border border-neutral-800 bg-black p-4">
                  <p className="text-sm font-semibold text-white">{getDriverName(driverId)}</p>

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
            {weekend.driverIds.map((driverId) => {
              const result = weekend.qualifying.resultsByDriver[driverId];

              return (
                <div key={`quali-${driverId}`} className="rounded-2xl border border-neutral-800 bg-black p-4">
                  <p className="text-sm font-semibold text-white">{getDriverName(driverId)}</p>

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
            {weekend.driverIds.map((driverId) => {
              const result = weekend.race.resultsByDriver[driverId];

              return (
                <div key={`race-${driverId}`} className="rounded-2xl border border-neutral-800 bg-black p-4">
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

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
            <p className="text-sm font-semibold text-white">Used Race Strategies</p>

            <div className="mt-4 flex flex-col gap-3">
              {weekend.driverIds.map((driverId) => {
                const result = weekend.race.resultsByDriver[driverId];

                return (
                  <div key={`strategy-${driverId}`} className="rounded-2xl border border-neutral-800 bg-black p-4">
                    <p className="text-sm font-semibold text-white">{getDriverName(driverId)}</p>
                    <p className="mt-2 text-sm text-neutral-400">
                      {result
                        ? `${result.raceStrategy.stops} stop(s) · ${result.raceStrategy.stints.join(" → ")}`
                        : "No race strategy used yet."}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
            <p className="text-sm font-semibold text-white">Post-Race Rewards</p>

            <div className="mt-4 flex flex-col gap-3">
              {weekend.driverIds.map((driverId) => {
                const result = weekend.postRace.resultsByDriver[driverId];

                return (
                  <div key={`post-${driverId}`} className="rounded-2xl border border-neutral-800 bg-black p-4">
                    <p className="text-sm font-semibold text-white">{getDriverName(driverId)}</p>

                    {result ? (
                      <div className="mt-2 grid gap-2 sm:grid-cols-2 text-sm text-neutral-300">
                        <p>Credits: <span className="text-white">+{result.rewards.creditsEarned}</span></p>
                        <p>Driver XP: <span className="text-white">+{result.rewards.driverXpEarned}</span></p>
                        <p>Morale: <span className="text-white">{result.rewards.moraleChange >= 0 ? "+" : ""}{result.rewards.moraleChange}</span></p>
                        <p>Fitness Loss: <span className="text-white">-{result.rewards.fitnessLoss}</span></p>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-neutral-400">No post-race result yet.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}