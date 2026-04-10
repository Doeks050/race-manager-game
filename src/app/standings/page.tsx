"use client";

import Link from "next/link";
import { useGameState } from "@/hooks/useGameState";

export default function StandingsPage() {
  const { seasonState, team } = useGameState();

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
        <section className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Standings</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">Championship Tables</h1>
              <p className="mt-2 text-sm text-neutral-400">
                Full field driver and team standings for the current saved season.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Back to Dashboard</Link>
              <Link href="/team" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Team</Link>
              <Link href="/upgrades" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Upgrades</Link>
              <Link href="/recovery" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Recovery</Link>
              <Link href="/management" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Management</Link>
              <Link href="/weekend" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Weekend</Link>
              <Link href="/results" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-neutral-500">Results</Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">Season</p>
            <p className="mt-2 text-sm text-white">{seasonState.season}</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">Current Round</p>
            <p className="mt-2 text-sm text-white">{seasonState.currentRound}</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">Your Team</p>
            <p className="mt-2 text-sm text-white">{team.name}</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
            <p className="text-sm font-semibold text-white">Driver Championship</p>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-neutral-500">
                  <tr>
                    <th className="pb-2 pr-4 font-medium">Pos</th>
                    <th className="pb-2 pr-4 font-medium">Driver</th>
                    <th className="pb-2 pr-4 font-medium">Team</th>
                    <th className="pb-2 pr-4 font-medium">Pts</th>
                    <th className="pb-2 pr-4 font-medium">W</th>
                    <th className="pb-2 pr-4 font-medium">Pod</th>
                    <th className="pb-2 pr-4 font-medium">R</th>
                  </tr>
                </thead>
                <tbody>
                  {seasonState.driverStandings.map((entry, index) => (
                    <tr key={entry.driverId} className="text-neutral-300">
                      <td className="py-2 pr-4">{index + 1}</td>
                      <td className="py-2 pr-4">{entry.driverName}</td>
                      <td className="py-2 pr-4">{entry.teamName}</td>
                      <td className="py-2 pr-4">{entry.points}</td>
                      <td className="py-2 pr-4">{entry.wins}</td>
                      <td className="py-2 pr-4">{entry.podiums}</td>
                      <td className="py-2 pr-4">{entry.races}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
            <p className="text-sm font-semibold text-white">Team Championship</p>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-neutral-500">
                  <tr>
                    <th className="pb-2 pr-4 font-medium">Pos</th>
                    <th className="pb-2 pr-4 font-medium">Team</th>
                    <th className="pb-2 pr-4 font-medium">Pts</th>
                    <th className="pb-2 pr-4 font-medium">W</th>
                    <th className="pb-2 pr-4 font-medium">Pod</th>
                    <th className="pb-2 pr-4 font-medium">R</th>
                  </tr>
                </thead>
                <tbody>
                  {seasonState.teamStandings.map((entry, index) => (
                    <tr key={entry.teamId} className="text-neutral-300">
                      <td className="py-2 pr-4">{index + 1}</td>
                      <td className="py-2 pr-4">{entry.teamName}</td>
                      <td className="py-2 pr-4">{entry.points}</td>
                      <td className="py-2 pr-4">{entry.wins}</td>
                      <td className="py-2 pr-4">{entry.podiums}</td>
                      <td className="py-2 pr-4">{entry.races}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
          <p className="text-sm font-semibold text-white">Recent Round Results</p>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-neutral-500">
                <tr>
                  <th className="pb-2 pr-4 font-medium">Round</th>
                  <th className="pb-2 pr-4 font-medium">Circuit</th>
                  <th className="pb-2 pr-4 font-medium">Driver</th>
                  <th className="pb-2 pr-4 font-medium">Team</th>
                  <th className="pb-2 pr-4 font-medium">Pos</th>
                  <th className="pb-2 pr-4 font-medium">Pts</th>
                </tr>
              </thead>
              <tbody>
                {seasonState.roundResults.slice(-20).reverse().map((entry, index) => (
                  <tr key={`${entry.round}-${entry.driverId}-${index}`} className="text-neutral-300">
                    <td className="py-2 pr-4">{entry.round}</td>
                    <td className="py-2 pr-4">{entry.circuitId}</td>
                    <td className="py-2 pr-4">{entry.driverName}</td>
                    <td className="py-2 pr-4">{entry.teamName}</td>
                    <td className="py-2 pr-4">{entry.finishPosition}</td>
                    <td className="py-2 pr-4">{entry.pointsEarned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}