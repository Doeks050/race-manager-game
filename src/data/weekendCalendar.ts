import { circuits } from "./circuits";

export type WeekendCalendarEntry = {
  round: number;
  circuitId: string;
};

export const weekendCalendar: WeekendCalendarEntry[] = circuits.map(
  (circuit, index) => ({
    round: index + 1,
    circuitId: circuit.id,
  })
);

export function getCalendarEntryForRound(round: number): WeekendCalendarEntry {
  const found = weekendCalendar.find((entry) => entry.round === round);

  if (found) {
    return found;
  }

  const fallbackCircuit = circuits[(round - 1) % circuits.length];

  return {
    round,
    circuitId: fallbackCircuit.id,
  };
}