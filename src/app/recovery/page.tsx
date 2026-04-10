"use client";

import Link from "next/link";
import { formatCountdown, formatSessionLabel } from "@/lib/weekendSession";
import { useGameState } from "@/hooks/useGameState";

export default function RecoveryPage() {
  const {
    team,
    raceDrivers,
    reserveDrivers,
    driverRecoveryOverview,
    isMounted,
    sessionInfo,
    handleSetRaceSeatDriver,
    handleRecoverDriverFitness,
    handleRecoverDriverMorale,
    handleResetWeekend,
  } = useGameState();

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
        <section className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
                Driver Recovery
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Fitness, Morale & Rotation
              </h1>
              <p className="mt-2 text-sm text-neutral-400">
                Herstel drivers en wissel reserve drivers naar seat 1 of seat 2.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Back to Dashboard</Link>
              <Link href="/team" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Team</Link>
              <Link href="/upgrades" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Upgrades</Link>
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

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">Credits</p>
            <p className="mt-2 text-sm text-white">{team.credits}</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">Race Drivers</p>
            <p className="mt-2 text-sm text-white">{raceDrivers.length}</p>
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

        <section className="grid gap-6 xl:grid-cols-2">
          {team.drivers.map((driver) => {
            const recovery = driverRecoveryOverview.find((entry) => entry.driverId === driver.id);
            const raceSeatIndex = team.raceDriverIds.findIndex((id) => id === driver.id);
            const isRaceDriver = raceSeatIndex !== -1;

            return (
              <section
                key={driver.id}
                className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-white">{driver.name}</p>
                    <p className="mt-1 text-sm text-neutral-400">
                      Recovery en lineup controls.
                    </p>
                  </div>

                  <div className="rounded-xl border border-neutral-800 bg-black px-3 py-2 text-right">
                    <p className="text-xs uppercase tracking-wide text-neutral-500">Role</p>
                    <p className="mt-1 text-sm text-white">
                      {isRaceDriver ? `Race Driver ${raceSeatIndex + 1}` : "Reserve Driver"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-neutral-800 bg-black p-4">
                    <p className="text-xs text-neutral-500">Fitness</p>
                    <p className="mt-1 text-sm text-white">{driver.fitness}</p>
                  </div>

                  <div className="rounded-2xl border border-neutral-800 bg-black p-4">
                    <p className="text-xs text-neutral-500">Morale</p>
                    <p className="mt-1 text-sm text-white">{driver.morale}</p>
                  </div>

                  <div className="rounded-2xl border border-neutral-800 bg-black p-4">
                    <p className="text-xs text-neutral-500">Experience</p>
                    <p className="mt-1 text-sm text-white">{driver.experience}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-neutral-800 bg-black p-4">
                    <p className="text-xs text-neutral-500">Fitness Recovery Cost</p>
                    <p className="mt-1 text-sm text-white">{recovery?.fitnessCost ?? 0}</p>
                  </div>

                  <div className="rounded-2xl border border-neutral-800 bg-black p-4">
                    <p className="text-xs text-neutral-500">Morale Recovery Cost</p>
                    <p className="mt-1 text-sm text-white">{recovery?.moraleCost ?? 0}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  {!isRaceDriver && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSetRaceSeatDriver(0, driver.id)}
                        className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition hover:border-neutral-500"
                      >
                        Put in Seat 1
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSetRaceSeatDriver(1, driver.id)}
                        className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition hover:border-neutral-500"
                      >
                        Put in Seat 2
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRecoverDriverFitness(driver.id)}
                    disabled={!recovery?.canRecoverFitness}
                    className={[
                      "rounded-2xl px-4 py-3 text-sm font-semibold transition",
                      recovery?.canRecoverFitness
                        ? "border border-white bg-white text-black hover:opacity-90"
                        : "cursor-not-allowed border border-neutral-800 bg-neutral-900 text-neutral-500",
                    ].join(" ")}
                  >
                    Recover Fitness
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRecoverDriverMorale(driver.id)}
                    disabled={!recovery?.canRecoverMorale}
                    className={[
                      "rounded-2xl px-4 py-3 text-sm font-semibold transition",
                      recovery?.canRecoverMorale
                        ? "border border-white bg-white text-black hover:opacity-90"
                        : "cursor-not-allowed border border-neutral-800 bg-neutral-900 text-neutral-500",
                    ].join(" ")}
                  >
                    Recover Morale
                  </button>
                </div>
              </section>
            );
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
            <p className="text-sm font-semibold text-white">Current Race Line-up</p>
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
            <p className="text-sm font-semibold text-white">Reserve Bench</p>
            <div className="mt-4 grid gap-3">
              {reserveDrivers.map((driver) => (
                <div key={driver.id} className="rounded-2xl border border-neutral-800 bg-black p-4">
                  <p className="text-sm font-semibold text-white">{driver.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}