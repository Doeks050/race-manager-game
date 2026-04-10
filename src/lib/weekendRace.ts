import {
  buildRaceStintPlan,
  normalizeRaceStrategyForRaceLaps,
} from "@/lib/raceStrategy";
import type { DriverRaceStrategy } from "@/types/raceStrategy";
import type {
  WeekendRaceEvent,
  WeekendRaceResult,
  WeekendRaceStint,
} from "@/types/weekendRace";
import type { WeekendPracticeBoosts } from "@/types/weekendPractice";

interface SimulateWeekendRaceInput {
  teamId: string;
  circuitId: string;
  weatherId: string;
  activeDriverId: string;
  raceStrategy: DriverRaceStrategy;
  qualifyingPosition: number | null;
  practiceBoosts: WeekendPracticeBoosts | null;
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function getBaseLapTimeMs(circuitId: string): number {
  switch (circuitId) {
    case "melbourne":
      return 86000;
    case "bahrain":
      return 94200;
    case "jeddah":
      return 91400;
    case "monza":
      return 83900;
    case "monaco":
      return 76500;
    default:
      return 88500;
  }
}

function getRaceLaps(circuitId: string): number {
  switch (circuitId) {
    case "melbourne":
      return 58;
    case "bahrain":
      return 57;
    case "jeddah":
      return 50;
    case "monza":
      return 53;
    case "monaco":
      return 78;
    default:
      return 56;
  }
}

function getWeatherLapAdjustmentMs(weatherId: string): number {
  switch (weatherId) {
    case "sunny":
      return 0;
    case "cloudy":
      return 120;
    case "cold":
      return 260;
    case "light-rain":
      return 2600;
    case "heavy-rain":
      return 6200;
    case "mixed":
      return 1800;
    default:
      return 0;
  }
}

function buildPracticeAdjustment(boosts: WeekendPracticeBoosts | null): number {
  if (!boosts) {
    return 0;
  }

  const raceGain = boosts.raceBonusPct * 110;
  const consistencyGain = boosts.consistencyBonusPct * 40;
  return Math.round(-(raceGain + consistencyGain));
}

function buildGridAdjustment(startPosition: number): number {
  if (startPosition <= 3) return -420;
  if (startPosition <= 6) return -220;
  if (startPosition <= 10) return 0;
  if (startPosition <= 15) return 220;
  return 520;
}

function buildRandomRaceEvents(
  raceLaps: number,
  weatherId: string
): WeekendRaceEvent[] {
  const events: WeekendRaceEvent[] = [];
  const rolls = Math.random();

  if (rolls > 0.72) {
    events.push({
      lap: Math.max(4, Math.floor(randomBetween(4, raceLaps - 4))),
      type: "driver-mistake",
      label: "Driver mistake in traffic",
      timeDeltaMs: Math.round(randomBetween(1200, 3800)),
    });
  }

  if (Math.random() > 0.86) {
    events.push({
      lap: Math.max(8, Math.floor(randomBetween(8, raceLaps - 5))),
      type: "puncture",
      label: "Late puncture cost time",
      timeDeltaMs: Math.round(randomBetween(6500, 14000)),
    });
  }

  if (
    weatherId === "light-rain" ||
    weatherId === "heavy-rain" ||
    weatherId === "mixed"
  ) {
    if (Math.random() > 0.58) {
      events.push({
        lap: Math.max(6, Math.floor(randomBetween(6, raceLaps - 6))),
        type: "safety-car",
        label: "Safety car compressed the field",
        timeDeltaMs: Math.round(randomBetween(-3200, 1600)),
      });
    }
  }

  if (Math.random() > 0.91) {
    events.push({
      lap: Math.max(10, Math.floor(randomBetween(10, raceLaps - 8))),
      type: "engine-issue",
      label: "Minor engine issue reduced pace",
      timeDeltaMs: Math.round(randomBetween(2800, 9000)),
    });
  }

  return events.sort((a, b) => a.lap - b.lap);
}

function buildStints(
  raceLaps: number,
  baseLapTimeMs: number,
  weatherId: string,
  raceStrategy: DriverRaceStrategy,
  practiceBoosts: WeekendPracticeBoosts | null
): WeekendRaceStint[] {
  const plan = buildRaceStintPlan(raceStrategy, raceLaps);
  const weatherAdjustment = getWeatherLapAdjustmentMs(weatherId);
  const practiceAdjustment = buildPracticeAdjustment(practiceBoosts);

  const stints: WeekendRaceStint[] = [];

  plan.forEach((part, index) => {
    const wearPenalty = index * 140;
    const variance = randomBetween(-180, 260);
    const averageLapTimeMs = Math.round(
      baseLapTimeMs +
        weatherAdjustment +
        practiceAdjustment +
        part.lapAdjustmentMs +
        wearPenalty +
        variance
    );

    const totalTimeMs =
      averageLapTimeMs * part.lapCount + (index > 0 ? 22500 : 0);

    stints.push({
      index: index + 1,
      tyreCompoundId: part.tyreCompoundId,
      startLap: part.startLap,
      endLap: part.endLap,
      lapCount: part.lapCount,
      averageLapTimeMs,
      totalTimeMs,
    });
  });

  return stints;
}

function determineFinishPosition(
  startPosition: number,
  totalRaceTimeMs: number,
  baseLapTimeMs: number,
  raceLaps: number,
  practiceBoosts: WeekendPracticeBoosts | null
): number {
  const referenceRaceTime = baseLapTimeMs * raceLaps;
  const delta = totalRaceTimeMs - referenceRaceTime;

  let movement = 0;

  if (delta < -14000) movement += 4;
  else if (delta < -8000) movement += 3;
  else if (delta < -4000) movement += 2;
  else if (delta < -1500) movement += 1;

  if (delta > 16000) movement -= 4;
  else if (delta > 10000) movement -= 3;
  else if (delta > 5000) movement -= 2;
  else if (delta > 2000) movement -= 1;

  if (practiceBoosts && practiceBoosts.raceBonusPct >= 2.5) {
    movement += 1;
  }

  return Math.max(1, Math.min(20, startPosition - movement));
}

export function formatRaceTime(ms: number): string {
  const totalSeconds = ms / 1000;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${seconds
      .toFixed(3)
      .padStart(6, "0")}`;
  }

  return `${minutes}:${seconds.toFixed(3).padStart(6, "0")}`;
}

export function simulateWeekendRace(
  input: SimulateWeekendRaceInput
): WeekendRaceResult {
  const raceLaps = getRaceLaps(input.circuitId);
  const baseLapTimeMs = getBaseLapTimeMs(input.circuitId);
  const startPosition = input.qualifyingPosition ?? 12;
  const normalizedStrategy = normalizeRaceStrategyForRaceLaps(
    input.raceStrategy,
    raceLaps
  );

  const stints = buildStints(
    raceLaps,
    baseLapTimeMs,
    input.weatherId,
    normalizedStrategy,
    input.practiceBoosts
  );

  const raceEvents = buildRandomRaceEvents(raceLaps, input.weatherId);
  const eventDeltaMs = raceEvents.reduce((sum, event) => sum + event.timeDeltaMs, 0);
  const gridDeltaMs = buildGridAdjustment(startPosition);

  const stintsTimeMs = stints.reduce((sum, stint) => sum + stint.totalTimeMs, 0);
  const totalRaceTimeMs = Math.round(stintsTimeMs + eventDeltaMs + gridDeltaMs);
  const averageLapTimeMs = Math.round(totalRaceTimeMs / raceLaps);

  const finishPosition = determineFinishPosition(
    startPosition,
    totalRaceTimeMs,
    baseLapTimeMs,
    raceLaps,
    input.practiceBoosts
  );

  return {
    sessionName: "Race",
    circuitId: input.circuitId,
    weatherId: input.weatherId,
    attemptedAt: new Date().toISOString(),
    playerDriverId: input.activeDriverId,
    playerTeamId: input.teamId,
    startPosition,
    finishPosition,
    positionsGained: startPosition - finishPosition,
    totalRaceTimeMs,
    averageLapTimeMs,
    raceStrategy: normalizedStrategy,
    practiceBoosts: input.practiceBoosts,
    stints,
    events: raceEvents,
  };
}