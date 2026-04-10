"use client";

import Link from "next/link";
import { FULL_FIELD_TEAMS } from "@/data/fullField";
import { TEAM_PART_LABELS } from "@/lib/playerTeam";
import { formatCountdown, formatSessionLabel } from "@/lib/weekendSession";
import { useGameState } from "@/hooks/useGameState";

function getPlayerTeamMeta(teamId: string) {
  return (
    FULL_FIELD_TEAMS.find((team) => team.id === teamId) ?? {
      id: teamId,
      name: teamId,
      performance: 0,
      drivers: [],
    }
  );
}

export default function TeamPage() {
  const {
    weekend,
    seasonState,
    team,
    raceDrivers,
    reserveDrivers,
    derivedCarStats,
    isMounted,
    sessionInfo,
    upgradesOverview,
    handleResetWeekend,
  } = useGameState();

  const playerTeamMeta = getPlayerTeamMeta(weekend.teamId);
  const teamStanding =
    seasonState.teamStandings.find((entry) => entry.teamId === weekend.teamId) ?? null;

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
        <section className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
                Team Page
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">{team.name}</h1>
              <p className="mt-2 text-sm text-neutral-400">
                Centrale team-overview voor lineup, driver condition, car stats en part progressie.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Back to Dashboard</Link>
              <Link href="/upgrades" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Upgrades</Link>
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
            <p className="text-xs uppercase tracking-wide text-neutral-500">Team Standing</p>
            <p className="mt-2 text-sm text-white">
              {teamStanding
                ? `#${seasonState.teamStandings.findIndex((entry) => entry.teamId === weekend.teamId) + 1}`
                : "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">Team Points</p>
            <p className="mt-2 text-sm text-white">{teamStanding ? teamStanding.points : 0}</p>
          </div>

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
            <p className="mt-2 text-sm text-white">
              {formatCountdown(isMounted ? sessionInfo.countdownMs : null)}
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
            <p className="text-sm font-semibold text-white">Team Overview</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-neutral-800 bg-black p-4">
                <p className="text-xs text-neutral-500">Team Name</p>
                <p className="mt-1 text-sm text-white">{team.name}</p>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-black p-4">
                <p className="text-xs text-neutral-500">Sponsor</p>
                <p className="mt-1 text-sm text-white">{team.sponsor}</p>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-black p-4">
                <p className="text-xs text-neutral-500">Color</p>
                <p className="mt-1 text-sm text-white">{team.color}</p>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-black p-4">
                <p className="text-xs text-neutral-500">Meta Performance</p>
                <p className="mt-1 text-sm text-white">{playerTeamMeta.performance}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
            <p className="text-sm font-semibold text-white">Quick Links</p>

            <div className="mt-4 flex flex-col gap-3">
              <Link href="/upgrades" className="rounded-2xl border border-neutral-800 bg-black p-4 text-sm text-white transition hover:border-neutral-600">Open Upgrades</Link>
              <Link href="/recovery" className="rounded-2xl border border-neutral-800 bg-black p-4 text-sm text-white transition hover:border-neutral-600">Open Recovery / Rotation</Link>
              <Link href="/management" className="rounded-2xl border border-neutral-800 bg-black p-4 text-sm text-white transition hover:border-neutral-600">Open Management</Link>
              <Link href="/weekend" className="rounded-2xl border border-neutral-800 bg-black p-4 text-sm text-white transition hover:border-neutral-600">Open Weekend</Link>
              <Link href="/results" className="rounded-2xl border border-neutral-800 bg-black p-4 text-sm text-white transition hover:border-neutral-600">Open Results</Link>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
            <p className="text-sm font-semibold text-white">Race Drivers</p>
            <div className="mt-4 grid gap-4">
              {raceDrivers.map((driver, index) => (
                <div
                  key={driver.id}
                  className="rounded-2xl border border-neutral-800 bg-black p-4"
                >
                  <p className="text-xs text-neutral-500">Seat {index + 1}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{driver.name}</p>
                  <p className="mt-2 text-sm text-neutral-300">
                    Fitness <span className="text-white">{driver.fitness}</span> · Morale{" "}
                    <span className="text-white">{driver.morale}</span> · XP{" "}
                    <span className="text-white">{driver.experience}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
            <p className="text-sm font-semibold text-white">Reserve Drivers</p>
            <div className="mt-4 grid gap-4">
              {reserveDrivers.map((driver) => (
                <div
                  key={driver.id}
                  className="rounded-2xl border border-neutral-800 bg-black p-4"
                >
                  <p className="text-sm font-semibold text-white">{driver.name}</p>
                  <p className="mt-2 text-sm text-neutral-300">
                    Fitness <span className="text-white">{driver.fitness}</span> · Morale{" "}
                    <span className="text-white">{driver.morale}</span> · XP{" "}
                    <span className="text-white">{driver.experience}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
          <p className="text-sm font-semibold text-white">Car Stats</p>

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
          <p className="text-sm font-semibold text-white">Current Parts</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {upgradesOverview.map((entry) => (
              <div key={entry.partKey} className="rounded-2xl border border-neutral-800 bg-black p-4">
                <p className="text-xs text-neutral-500">{TEAM_PART_LABELS[entry.partKey]}</p>
                <p className="mt-1 text-sm text-white">Value {entry.currentValue}</p>
                <p className="mt-1 text-xs text-neutral-500">Next cost: {entry.cost}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}