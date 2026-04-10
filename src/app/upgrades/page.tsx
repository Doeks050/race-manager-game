"use client";

import Link from "next/link";
import { TEAM_PART_LABELS } from "@/lib/playerTeam";
import { formatCountdown, formatSessionLabel } from "@/lib/weekendSession";
import { useGameState } from "@/hooks/useGameState";

export default function UpgradesPage() {
  const {
    team,
    upgradesOverview,
    derivedCarStats,
    isMounted,
    sessionInfo,
    handleUpgradePart,
    handleResetWeekend,
  } = useGameState();

  const totalTeamValue = upgradesOverview.reduce(
    (sum, entry) => sum + entry.currentValue,
    0
  );

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
        <section className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
                Upgrades Page
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Car Development
              </h1>
              <p className="mt-2 text-sm text-neutral-400">
                Besteed credits aan onderdelen en verbeter de afgeleide prestaties van je wagen.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Back to Dashboard</Link>
              <Link href="/team" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Team</Link>
              <Link href="/recovery" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Recovery</Link>
              <Link href="/management" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Management</Link>
              <Link href="/weekend" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Weekend</Link>
              <Link href="/results" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Results</Link>
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
            <p className="text-xs uppercase tracking-wide text-neutral-500">Credits</p>
            <p className="mt-2 text-sm text-white">{team.credits}</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">Current Session</p>
            <p className="mt-2 text-sm text-white">{formatSessionLabel(sessionInfo.currentSession)}</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">Countdown</p>
            <p className="mt-2 text-sm text-white">{formatCountdown(isMounted ? sessionInfo.countdownMs : null)}</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">Parts Total</p>
            <p className="mt-2 text-sm text-white">{totalTeamValue}</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">Active Driver</p>
            <p className="mt-2 text-sm text-white">
              {team.drivers.find((driver) => driver.id === team.activeDriverId)?.name ?? team.activeDriverId}
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
          <p className="text-sm font-semibold text-white">Derived Car Stats</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-2xl border border-neutral-800 bg-black p-4"><p className="text-xs text-neutral-500">Power</p><p className="mt-1 text-sm text-white">{derivedCarStats.power}</p></div>
            <div className="rounded-2xl border border-neutral-800 bg-black p-4"><p className="text-xs text-neutral-500">Acceleration</p><p className="mt-1 text-sm text-white">{derivedCarStats.acceleration}</p></div>
            <div className="rounded-2xl border border-neutral-800 bg-black p-4"><p className="text-xs text-neutral-500">Grip</p><p className="mt-1 text-sm text-white">{derivedCarStats.grip}</p></div>
            <div className="rounded-2xl border border-neutral-800 bg-black p-4"><p className="text-xs text-neutral-500">Tyre Wear</p><p className="mt-1 text-sm text-white">{derivedCarStats.tyreWear}</p></div>
            <div className="rounded-2xl border border-neutral-800 bg-black p-4"><p className="text-xs text-neutral-500">Reliability</p><p className="mt-1 text-sm text-white">{derivedCarStats.reliability}</p></div>
            <div className="rounded-2xl border border-neutral-800 bg-black p-4"><p className="text-xs text-neutral-500">Balance</p><p className="mt-1 text-sm text-white">{derivedCarStats.balance}</p></div>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">Part Upgrades</p>
              <p className="mt-1 text-sm text-neutral-400">
                Gebruik de car development laag om je auto stap voor stap te verbeteren.
              </p>
            </div>

            <Link
              href="/team"
              className="rounded-2xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm font-semibold text-white transition hover:border-neutral-500"
            >
              Open Team Overview
            </Link>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {upgradesOverview.map((entry) => (
              <div
                key={entry.partKey}
                className="rounded-2xl border border-neutral-800 bg-black p-4"
              >
                <p className="text-sm font-semibold text-white">
                  {TEAM_PART_LABELS[entry.partKey]}
                </p>

                <div className="mt-3 grid gap-2 text-sm">
                  <p className="text-neutral-300">
                    Current value: <span className="text-white">{entry.currentValue}</span>
                  </p>
                  <p className="text-neutral-300">
                    Upgrade cost: <span className="text-white">{entry.cost}</span>
                  </p>
                  <p className="text-neutral-300">
                    Affordable: <span className="text-white">{entry.canAfford ? "Yes" : "No"}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleUpgradePart(entry.partKey)}
                  disabled={!entry.canAfford}
                  className={[
                    "mt-4 w-full rounded-2xl px-4 py-3 text-sm font-semibold transition",
                    entry.canAfford
                      ? "border border-white bg-white text-black hover:opacity-90"
                      : "cursor-not-allowed border border-neutral-800 bg-neutral-900 text-neutral-500",
                  ].join(" ")}
                >
                  Upgrade +1
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}