import type { WeekendPracticeResult } from "@/types/weekendPractice";
import type { WeekendQualifyingResult } from "@/types/weekendQualifying";
import type { WeekendRaceResult } from "@/types/weekendRace";

function sortEntriesByNumberAsc<T>(
  entries: Array<[string, T | null]>,
  getValue: (result: T) => number
): Array<[string, T]> {
  return entries
    .filter((entry): entry is [string, T] => entry[1] !== null)
    .sort((a, b) => getValue(a[1]) - getValue(b[1]));
}

export function classifyPracticeResults(
  resultsByDriver: Record<string, WeekendPracticeResult | null>
): Record<string, WeekendPracticeResult | null> {
  const ranked = sortEntriesByNumberAsc(
    Object.entries(resultsByDriver),
    (result) => result.playerBestLapMs
  );

  const nextResults: Record<string, WeekendPracticeResult | null> = {
    ...resultsByDriver,
  };

  ranked.forEach(([driverId, result], index) => {
    nextResults[driverId] = {
      ...result,
      playerPosition: index + 1,
    };
  });

  return nextResults;
}

export function classifyQualifyingResults(
  resultsByDriver: Record<string, WeekendQualifyingResult | null>
): Record<string, WeekendQualifyingResult | null> {
  const ranked = sortEntriesByNumberAsc(
    Object.entries(resultsByDriver),
    (result) => result.playerBestLapMs
  );

  const nextResults: Record<string, WeekendQualifyingResult | null> = {
    ...resultsByDriver,
  };

  ranked.forEach(([driverId, result], index) => {
    nextResults[driverId] = {
      ...result,
      playerPosition: index + 1,
      entries: result.entries.map((entry) =>
        entry.isPlayer ? { ...entry, position: index + 1 } : entry
      ),
    };
  });

  return nextResults;
}

export function classifyRaceResults(
  resultsByDriver: Record<string, WeekendRaceResult | null>
): Record<string, WeekendRaceResult | null> {
  const ranked = sortEntriesByNumberAsc(
    Object.entries(resultsByDriver),
    (result) => result.totalRaceTimeMs
  );

  const nextResults: Record<string, WeekendRaceResult | null> = {
    ...resultsByDriver,
  };

  ranked.forEach(([driverId, result], index) => {
    const finishPosition = index + 1;

    nextResults[driverId] = {
      ...result,
      finishPosition,
      positionsGained: result.startPosition - finishPosition,
    };
  });

  return nextResults;
}