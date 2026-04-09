"use client";

import Link from "next/link";
import { formatCountdown, formatSessionLabel } from "@/lib/weekendSession";
import { useGameState } from "@/hooks/useGameState";

function formatIsoForDisplay(iso: string): string {
  return iso.replace("T", " ").replace(".000Z", " UTC");
}

export default function HomePage() {
  const {
    weekend,
    seasonState,
    team,
    isMounted,
    hasLoadedSave,
    sessionInfo,
    canAdvanceToNextWeekend,
    handleResetWeekend,
  } = useGameState();

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
        <section className="rounded-3xl border border-neutral-800 bg-neutral-950 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
            Race Manager Game
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Team Dashboard
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-neutral-400">
            Gebruik dit dashboard als centrale hub voor team management, upgrades, weekendflow, standings en resultaten.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/team"
              className="rounded-2xl border border-white bg-white px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90"
            >
              Open Team Page
            </Link>

            <Link
              href="/upgrades"
              className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500"
            >
              Open Upgrades
            </Link>

            <Link
              href="/management"
              className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500"
            >
              Open Management
            </Link>

            <Link
              href="/weekend"
              className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500"
            >
              Open Weekend Center
            </Link>

            <Link
              href="/results"
              className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500"
            >
              Open Results
            </Link>

            <Link
              href="/standings"
              className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500"
            >
              Open Standings
            </Link>

            <button
              type="button"
              onClick={handleResetWeekend}
              className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500"
            >
              Reset Demo Weekend
            </button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Save Status
            </p>
            <p className="mt-2 text-sm text-white">
              {hasLoadedSave ? "Local save active" : "Loading save..."}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Current Session
            </p>
            <p className="mt-2 text-sm text-white">
              {formatSessionLabel(sessionInfo.currentSession)}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Countdown
            </p>
            <p className="mt-2 text-sm text-white">
              {formatCountdown(isMounted ? sessionInfo.countdownMs : null)}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Credits
            </p>
            <p className="mt-2 text-sm text-white">{team.credits}</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Next Weekend Ready
            </p>
            <p className="mt-2 text-sm text-white">
              {canAdvanceToNextWeekend ? "Yes" : "No"}
            </p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
            <p className="text-sm font-semibold text-white">Season Snapshot</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-neutral-800 bg-black p-4">
                <p className="text-xs text-neutral-500">Season</p>
                <p className="mt-1 text-lg font-semibold text-white">{seasonState.season}</p>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-black p-4">
                <p className="text-xs text-neutral-500">Current Round</p>
                <p className="mt-1 text-lg font-semibold text-white">{seasonState.currentRound}</p>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-black p-4">
                <p className="text-xs text-neutral-500">Team</p>
                <p className="mt-1 text-lg font-semibold text-white">{team.name}</p>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-black p-4">
                <p className="text-xs text-neutral-500">Sponsor</p>
                <p className="mt-1 text-lg font-semibold text-white">{team.sponsor}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
            <p className="text-sm font-semibold text-white">Weekend Snapshot</p>

            <div className="mt-4 flex flex-col gap-3">
              <div className="rounded-2xl border border-neutral-800 bg-black p-4">
                <p className="text-xs text-neutral-500">Round</p>
                <p className="mt-1 text-sm text-white">{weekend.round}</p>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-black p-4">
                <p className="text-xs text-neutral-500">Circuit</p>
                <p className="mt-1 text-sm text-white">{weekend.circuitId}</p>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-black p-4">
                <p className="text-xs text-neutral-500">Weather</p>
                <p className="mt-1 text-sm text-white">{weekend.weatherId}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-neutral-800 bg-black p-4">
                  <p className="text-xs text-neutral-500">Practice At</p>
                  <p className="mt-1 text-xs text-white">
                    {formatIsoForDisplay(weekend.schedule.practiceAt)}
                  </p>
                </div>
                <div className="rounded-2xl border border-neutral-800 bg-black p-4">
                  <p className="text-xs text-neutral-500">Qualifying At</p>
                  <p className="mt-1 text-xs text-white">
                    {formatIsoForDisplay(weekend.schedule.qualifyingAt)}
                  </p>
                </div>
                <div className="rounded-2xl border border-neutral-800 bg-black p-4">
                  <p className="text-xs text-neutral-500">Race At</p>
                  <p className="mt-1 text-xs text-white">
                    {formatIsoForDisplay(weekend.schedule.raceAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-6">
          <Link
            href="/team"
            className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5 transition hover:border-neutral-600"
          >
            <p className="text-sm font-semibold text-white">Team Page</p>
            <p className="mt-2 text-sm text-neutral-400">Drivers and current setups.</p>
          </Link>

          <Link
            href="/upgrades"
            className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5 transition hover:border-neutral-600"
          >
            <p className="text-sm font-semibold text-white">Upgrades Page</p>
            <p className="mt-2 text-sm text-neutral-400">Spend credits and improve parts.</p>
          </Link>

          <Link
            href="/management"
            className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5 transition hover:border-neutral-600"
          >
            <p className="text-sm font-semibold text-white">Management Center</p>
            <p className="mt-2 text-sm text-neutral-400">Configure driver training and strategy.</p>
          </Link>

          <Link
            href="/weekend"
            className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5 transition hover:border-neutral-600"
          >
            <p className="text-sm font-semibold text-white">Weekend Center</p>
            <p className="mt-2 text-sm text-neutral-400">Run sessions and post-race.</p>
          </Link>

          <Link
            href="/results"
            className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5 transition hover:border-neutral-600"
          >
            <p className="text-sm font-semibold text-white">Results Page</p>
            <p className="mt-2 text-sm text-neutral-400">Session outcomes and rewards.</p>
          </Link>

          <Link
            href="/standings"
            className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5 transition hover:border-neutral-600"
          >
            <p className="text-sm font-semibold text-white">Standings</p>
            <p className="mt-2 text-sm text-neutral-400">Full championship tables.</p>
          </Link>
        </section>
      </div>
    </main>
  );
}