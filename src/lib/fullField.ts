import { getChampionshipPoints } from "@/lib/season";
import { FULL_FIELD_TEAMS, getAllFieldDrivers } from "@/data/fullField";
import type { SeasonRoundResult } from "@/types/season";
import type { WeekendPracticeResult } from "@/types/weekendPractice";
import type { WeekendQualifyingResult } from "@/types/weekendQualifying";
import type { WeekendRaceResult } from "@/types/weekendRace";

function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function seededNoise(key: string, min: number, max: number): number {
  const hash = hashString(key);
  const normalized = (hash % 10000) / 10000;
  return min + (max - min) * normalized;
}

function getCircuitBaseQualiLap(circuitId: string): number {
  switch (circuitId) {
    case "melbourne":
      return 81_800;
    case "bahrain":
      return 89_900;
    case "jeddah":
      return 79_800;
    case "monza":
      return 80_600;
    case "monaco":
      return 73_100;
    default:
      return 82_500;
  }
}

function getCircuitBaseRaceTime(circuitId: string): number {
  switch (circuitId) {
    case "melbourne":
      return 5_070_000;
    case "bahrain":
      return 5_390_000;
    case "jeddah":
      return 4_720_000;
    case "monza":
      return 4_470_000;
    case "monaco":
      return 6_020_000;
    default:
      return 5_100_000;
  }
}

function getWeatherQualiAdjustment(weatherId: string): number {
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
      return 6400;
    case "mixed":
      return 2200;
    default:
      return 0;
  }
}

function getWeatherRaceAdjustment(weatherId: string): number {
  switch (weatherId) {
    case "sunny":
      return 0;
    case "cloudy":
      return 3_000;
    case "cold":
      return 6_000;
    case "light-rain":
      return 55_000;
    case "heavy-rain":
      return 145_000;
    case "mixed":
      return 72_000;
    default:
      return 0;
  }
}

function buildAiPracticeLap(params: {
  driverId: string;
  circuitId: string;
  weatherId: string;
  round: number;
  pace: number;
  consistency: number;
  qualifying: number;
  teamPerformance: number;
}): number {
  const base = getCircuitBaseQualiLap(params.circuitId);
  const weather = getWeatherQualiAdjustment(params.weatherId);

  const performanceGain =
    params.pace * 72 +
    params.qualifying * 66 +
    params.teamPerformance * 58 +
    params.consistency * 20;

  const noise = seededNoise(
    `practice-${params.round}-${params.circuitId}-${params.driverId}`,
    -650,
    900
  );

  return Math.round(base + weather - performanceGain + noise);
}

function buildAiQualiLap(params: {
  driverId: string;
  circuitId: string;
  weatherId: string;
  round: number;
  pace: number;
  consistency: number;
  qualifying: number;
  teamPerformance: number;
}): number {
  const base = getCircuitBaseQualiLap(params.circuitId);
  const weather = getWeatherQualiAdjustment(params.weatherId);

  const performanceGain =
    params.pace * 76 +
    params.qualifying * 84 +
    params.teamPerformance * 61 +
    params.consistency * 18;

  const noise = seededNoise(
    `quali-${params.round}-${params.circuitId}-${params.driverId}`,
    -520,
    760
  );

  return Math.round(base + weather - performanceGain + noise);
}

function buildAiRaceTime(params: {
  driverId: string;
  circuitId: string;
  weatherId: string;
  round: number;
  pace: number;
  consistency: number;
  tyreManagement: number;
  racecraft: number;
  teamPerformance: number;
}): number {
  const base = getCircuitBaseRaceTime(params.circuitId);
  const weather = getWeatherRaceAdjustment(params.weatherId);

  const performanceGain =
    params.pace * 2400 +
    params.consistency * 1300 +
    params.tyreManagement * 1100 +
    params.racecraft * 1500 +
    params.teamPerformance * 1800;

  const noise = seededNoise(
    `race-${params.round}-${params.circuitId}-${params.driverId}`,
    -16000,
    22000
  );

  return Math.round(base + weather - performanceGain + noise);
}

export function classifyPracticeResultsAgainstField(params: {
  round: number;
  circuitId: string;
  weatherId: string;
  playerResultsByDriver: Record<string, WeekendPracticeResult | null>;
}): Record<string, WeekendPracticeResult | null> {
  const fieldDrivers = getAllFieldDrivers();

  const allEntries = fieldDrivers.map((driver) => {
    const playerResult = params.playerResultsByDriver[driver.id];

    const lapTimeMs =
      playerResult?.playerBestLapMs ??
      buildAiPracticeLap({
        driverId: driver.id,
        circuitId: params.circuitId,
        weatherId: params.weatherId,
        round: params.round,
        pace: driver.pace,
        consistency: driver.consistency,
        qualifying: driver.qualifying,
        teamPerformance: driver.teamPerformance,
      });

    return {
      driverId: driver.id,
      lapTimeMs,
    };
  });

  allEntries.sort((a, b) => a.lapTimeMs - b.lapTimeMs);

  const finishingMap = new Map<string, number>();
  allEntries.forEach((entry, index) => {
    finishingMap.set(entry.driverId, index + 1);
  });

  const nextResults: Record<string, WeekendPracticeResult | null> = {
    ...params.playerResultsByDriver,
  };

  Object.entries(params.playerResultsByDriver).forEach(([driverId, result]) => {
    if (!result) {
      return;
    }

    nextResults[driverId] = {
      ...result,
      playerPosition: finishingMap.get(driverId) ?? result.playerPosition,
    };
  });

  return nextResults;
}

export function classifyQualifyingResultsAgainstField(params: {
  round: number;
  circuitId: string;
  weatherId: string;
  playerResultsByDriver: Record<string, WeekendQualifyingResult | null>;
}): Record<string, WeekendQualifyingResult | null> {
  const fieldDrivers = getAllFieldDrivers();

  const allEntries = fieldDrivers.map((driver) => {
    const playerResult = params.playerResultsByDriver[driver.id];

    const lapTimeMs =
      playerResult?.playerBestLapMs ??
      buildAiQualiLap({
        driverId: driver.id,
        circuitId: params.circuitId,
        weatherId: params.weatherId,
        round: params.round,
        pace: driver.pace,
        consistency: driver.consistency,
        qualifying: driver.qualifying,
        teamPerformance: driver.teamPerformance,
      });

    return {
      driverId: driver.id,
      lapTimeMs,
    };
  });

  allEntries.sort((a, b) => a.lapTimeMs - b.lapTimeMs);

  const positionMap = new Map<string, number>();
  allEntries.forEach((entry, index) => {
    positionMap.set(entry.driverId, index + 1);
  });

  const nextResults: Record<string, WeekendQualifyingResult | null> = {
    ...params.playerResultsByDriver,
  };

  Object.entries(params.playerResultsByDriver).forEach(([driverId, result]) => {
    if (!result) {
      return;
    }

    const position = positionMap.get(driverId) ?? result.playerPosition;

    nextResults[driverId] = {
      ...result,
      playerPosition: position,
      entries: result.entries.map((entry) =>
        entry.isPlayer ? { ...entry, position } : entry
      ),
    };
  });

  return nextResults;
}

export function classifyRaceResultsAgainstField(params: {
  round: number;
  circuitId: string;
  weatherId: string;
  playerResultsByDriver: Record<string, WeekendRaceResult | null>;
}): Record<string, WeekendRaceResult | null> {
  const fieldDrivers = getAllFieldDrivers();

  const allEntries = fieldDrivers.map((driver) => {
    const playerResult = params.playerResultsByDriver[driver.id];

    const totalRaceTimeMs =
      playerResult?.totalRaceTimeMs ??
      buildAiRaceTime({
        driverId: driver.id,
        circuitId: params.circuitId,
        weatherId: params.weatherId,
        round: params.round,
        pace: driver.pace,
        consistency: driver.consistency,
        tyreManagement: driver.tyreManagement,
        racecraft: driver.racecraft,
        teamPerformance: driver.teamPerformance,
      });

    return {
      driverId: driver.id,
      totalRaceTimeMs,
    };
  });

  allEntries.sort((a, b) => a.totalRaceTimeMs - b.totalRaceTimeMs);

  const positionMap = new Map<string, number>();
  allEntries.forEach((entry, index) => {
    positionMap.set(entry.driverId, index + 1);
  });

  const nextResults: Record<string, WeekendRaceResult | null> = {
    ...params.playerResultsByDriver,
  };

  Object.entries(params.playerResultsByDriver).forEach(([driverId, result]) => {
    if (!result) {
      return;
    }

    const finishPosition = positionMap.get(driverId) ?? result.finishPosition;

    nextResults[driverId] = {
      ...result,
      finishPosition,
      positionsGained: result.startPosition - finishPosition,
    };
  });

  return nextResults;
}

export function buildFullFieldRoundResults(params: {
  round: number;
  circuitId: string;
  weatherId: string;
  playerResultsByDriver: Record<string, WeekendRaceResult | null>;
}): SeasonRoundResult[] {
  const fieldDrivers = getAllFieldDrivers();

  const entries = fieldDrivers.map((driver) => {
    const playerResult = params.playerResultsByDriver[driver.id];

    const totalRaceTimeMs =
      playerResult?.totalRaceTimeMs ??
      buildAiRaceTime({
        driverId: driver.id,
        circuitId: params.circuitId,
        weatherId: params.weatherId,
        round: params.round,
        pace: driver.pace,
        consistency: driver.consistency,
        tyreManagement: driver.tyreManagement,
        racecraft: driver.racecraft,
        teamPerformance: driver.teamPerformance,
      });

    return {
      driverId: driver.id,
      driverName: driver.name,
      teamId: driver.teamId,
      teamName: driver.teamName,
      totalRaceTimeMs,
    };
  });

  entries.sort((a, b) => a.totalRaceTimeMs - b.totalRaceTimeMs);

  return entries.map((entry, index) => ({
    round: params.round,
    circuitId: params.circuitId,
    driverId: entry.driverId,
    driverName: entry.driverName,
    teamId: entry.teamId,
    teamName: entry.teamName,
    finishPosition: index + 1,
    pointsEarned: getChampionshipPoints(index + 1),
  }));
}

export function getFullFieldTeams() {
  return FULL_FIELD_TEAMS.map((team) => ({
    teamId: team.id,
    teamName: team.name,
  }));
}