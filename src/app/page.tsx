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
    raceDrivers,
    reserveDrivers,
    isMounted,
    hasLoadedSave,
    sessionInfo,
    canAdvanceToNextWeekend,
    handleResetWeekend,
  } = useGameState();

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
        <section className="rounded-3xl border border-neutral-800 bg-neutral-950 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
            Race Manager Game
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Team Dashboard
          </h1>
          <p className="mt-3 max-w-4xl text-sm text-neutral-400">
            Dit is de centrale hub voor jouw managementloop: team, upgrades,
            recovery, session setup, weekendflow, results en standings.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/team"
              className="rounded-2xl border border-white bg-white px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90"
            >
              Team
            </Link>
            <Link
              href="/upgrades"
              className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500"
            >
              Upgrades
            </Link>
            <Link
              href="/recovery"
              className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500"
            >
              Recovery
            </Link>
            <Link
              href="/management"
              className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500"
            >
              Management
            </Link>
            <Link
              href="/weekend"
              className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500"
            >
              Weekend
            </Link>
            <Link
              href="/results"
              className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500"
            >
              Results
            </Link>
            <Link
              href="/standings"
              className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500"
            >
              Standings
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
            <p className="text-xs uppercase tracking-wide text-neutral-500">Credits</p>
            <p className="mt-2 text-sm text-white">{team.credits}</p>
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
            <p className="text-xs uppercase tracking-wide text-neutral-500">Countdown</p>
            <p className="mt-2 text-sm text-white">
              {formatCountdown(isMounted ? sessionInfo.countdownMs : null)}
            </p>
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

        <section className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">Driver Condition</p>
                <p className="mt-1 text-sm text-neutral-400">
                  Race drivers en reserve drivers direct zichtbaar.
                </p>
              </div>

              <Link
                href="/recovery"
                className="rounded-2xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm font-semibold text-white transition hover:border-neutral-500"
              >
                Open Recovery
              </Link>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {team.drivers.map((driver) => {
                const isRaceDriver = team.raceDriverIds.includes(driver.id);
                return (
                  <div
                    key={driver.id}
                    className="rounded-2xl border border-neutral-800 bg-black p-4"
                  >
                    <p className="text-sm font-semibold text-white">{driver.name}</p>
                    <div className="mt-3 grid gap-2 text-sm">
                      <p className="text-neutral-300">
                        Fitness: <span className="text-white">{driver.fitness}</span>
                      </p>
                      <p className="text-neutral-300">
                        Morale: <span className="text-white">{driver.morale}</span>
                      </p>
                      <p className="text-neutral-300">
                        Experience: <span className="text-white">{driver.experience}</span>
                      </p>
                      <p className="text-neutral-300">
                        Role:{" "}
                        <span className="text-white">
                          {isRaceDriver ? "Race Driver" : "Reserve Driver"}
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">Current Weekend</p>
                <p className="mt-1 text-sm text-neutral-400">
                  Jouw komende sessies en timings op één plek.
                </p>
              </div>

              <Link
                href="/weekend"
                className="rounded-2xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm font-semibold text-white transition hover:border-neutral-500"
              >
                Open Weekend
              </Link>
            </div>

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

        <section className="grid gap-4 lg:grid-cols-2">
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
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-4">
          <Link
            href="/team"
            className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5 transition hover:border-neutral-600"
          >
            <p className="text-sm font-semibold text-white">Team Overview</p>
            <p className="mt-2 text-sm text-neutral-400">
              Drivers, parts, car stats en lineup info.
            </p>
          </Link>

          <Link
            href="/upgrades"
            className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5 transition hover:border-neutral-600"
          >
            <p className="text-sm font-semibold text-white">Car Development</p>
            <p className="mt-2 text-sm text-neutral-400">
              Besteed credits aan parts en bouw je wagen door.
            </p>
          </Link>

          <Link
            href="/recovery"
            className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5 transition hover:border-neutral-600"
          >
            <p className="text-sm font-semibold text-white">Driver Recovery</p>
            <p className="mt-2 text-sm text-neutral-400">
              Herstel drivers en wissel race seats met reserves.
            </p>
          </Link>

          <Link
            href="/management"
            className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5 transition hover:border-neutral-600"
          >
            <p className="text-sm font-semibold text-white">Session Setup</p>
            <p className="mt-2 text-sm text-neutral-400">
              Training en race strategy per race driver instellen.
            </p>
          </Link>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Link
            href="/weekend"
            className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5 transition hover:border-neutral-600"
          >
            <p className="text-sm font-semibold text-white">Weekend Center</p>
            <p className="mt-2 text-sm text-neutral-400">
              Run practice, qualifying, race en post-race verwerking.
            </p>
          </Link>

          <Link
            href="/results"
            className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5 transition hover:border-neutral-600"
          >
            <p className="text-sm font-semibold text-white">Results Hub</p>
            <p className="mt-2 text-sm text-neutral-400">
              Bekijk sessie-uitkomsten, rewards en weekend summary.
            </p>
          </Link>

          <Link
            href="/standings"
            className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5 transition hover:border-neutral-600"
          >
            <p className="text-sm font-semibold text-white">Championship Tables</p>
            <p className="mt-2 text-sm text-neutral-400">
              Volledige driver- en teamstandings van het veld.
            </p>
          </Link>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
            <p className="text-sm font-semibold text-white">Top 5 Drivers</p>

            <div className="mt-4 flex flex-col gap-3">
              {seasonState.driverStandings.slice(0, 5).map((entry, index) => (
                <div
                  key={entry.driverId}
                  className="rounded-2xl border border-neutral-800 bg-black p-4"
                >
                  <p className="text-sm font-semibold text-white">
                    #{index + 1} · {entry.driverName}
                  </p>
                  <p className="mt-1 text-sm text-neutral-400">
                    {entry.teamName} · {entry.points} pts
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
            <p className="text-sm font-semibold text-white">Top 5 Teams</p>

            <div className="mt-4 flex flex-col gap-3">
              {seasonState.teamStandings.slice(0, 5).map((entry, index) => (
                <div
                  key={entry.teamId}
                  className="rounded-2xl border border-neutral-800 bg-black p-4"
                >
                  <p className="text-sm font-semibold text-white">
                    #{index + 1} · {entry.teamName}
                  </p>
                  <p className="mt-1 text-sm text-neutral-400">
                    {entry.points} pts · {entry.wins} wins
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}