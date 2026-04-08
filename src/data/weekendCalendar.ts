export interface WeekendCalendarEntry {
  round: number;
  circuitId: string;
  weatherId: string;
  practiceAt: string;
  qualifyingAt: string;
  raceAt: string;
}

export const WEEKEND_CALENDAR: WeekendCalendarEntry[] = [
  {
    round: 1,
    circuitId: "melbourne",
    weatherId: "sunny",
    practiceAt: "2026-04-10T18:00:00.000Z",
    qualifyingAt: "2026-04-11T15:00:00.000Z",
    raceAt: "2026-04-12T16:00:00.000Z",
  },
  {
    round: 2,
    circuitId: "bahrain",
    weatherId: "cloudy",
    practiceAt: "2026-04-17T18:00:00.000Z",
    qualifyingAt: "2026-04-18T15:00:00.000Z",
    raceAt: "2026-04-19T16:00:00.000Z",
  },
  {
    round: 3,
    circuitId: "jeddah",
    weatherId: "mixed",
    practiceAt: "2026-04-24T18:00:00.000Z",
    qualifyingAt: "2026-04-25T15:00:00.000Z",
    raceAt: "2026-04-26T16:00:00.000Z",
  },
  {
    round: 4,
    circuitId: "monza",
    weatherId: "sunny",
    practiceAt: "2026-05-01T18:00:00.000Z",
    qualifyingAt: "2026-05-02T15:00:00.000Z",
    raceAt: "2026-05-03T16:00:00.000Z",
  },
  {
    round: 5,
    circuitId: "monaco",
    weatherId: "cloudy",
    practiceAt: "2026-05-08T18:00:00.000Z",
    qualifyingAt: "2026-05-09T15:00:00.000Z",
    raceAt: "2026-05-10T16:00:00.000Z",
  },
  {
    round: 6,
    circuitId: "melbourne",
    weatherId: "light-rain",
    practiceAt: "2026-05-15T18:00:00.000Z",
    qualifyingAt: "2026-05-16T15:00:00.000Z",
    raceAt: "2026-05-17T16:00:00.000Z",
  },
  {
    round: 7,
    circuitId: "bahrain",
    weatherId: "sunny",
    practiceAt: "2026-05-22T18:00:00.000Z",
    qualifyingAt: "2026-05-23T15:00:00.000Z",
    raceAt: "2026-05-24T16:00:00.000Z",
  },
  {
    round: 8,
    circuitId: "jeddah",
    weatherId: "heavy-rain",
    practiceAt: "2026-05-29T18:00:00.000Z",
    qualifyingAt: "2026-05-30T15:00:00.000Z",
    raceAt: "2026-05-31T16:00:00.000Z",
  },
];

export function getWeekendCalendarEntry(round: number): WeekendCalendarEntry | null {
  return WEEKEND_CALENDAR.find((entry) => entry.round === round) ?? null;
}

export function getLastCalendarRound(): number {
  return WEEKEND_CALENDAR[WEEKEND_CALENDAR.length - 1]?.round ?? 0;
}