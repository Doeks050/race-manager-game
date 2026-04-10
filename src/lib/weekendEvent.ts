import type { WeekendEventReference } from "../types/tyreAllocationIntegration";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function readStringProperty(source: UnknownRecord, key: string): string | undefined {
  const value = source[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function readNestedRecord(source: UnknownRecord, key: string): UnknownRecord | undefined {
  const value = source[key];
  return isRecord(value) ? value : undefined;
}

export function resolveWeekendEventId(input: unknown): string | undefined {
  if (!isRecord(input)) {
    return undefined;
  }

  const directCandidates = [
    "eventId",
    "currentEventId",
    "weekendEventId",
    "activeEventId",
    "roundId",
    "weekendId",
    "id",
  ];

  for (const key of directCandidates) {
    const direct = readStringProperty(input, key);
    if (direct) {
      return direct;
    }
  }

  const nestedCandidates = ["weekend", "currentWeekend", "activeWeekend", "weekendState"];

  for (const nestedKey of nestedCandidates) {
    const nested = readNestedRecord(input, nestedKey);
    if (!nested) {
      continue;
    }

    const nestedResolved = resolveWeekendEventId(nested);
    if (nestedResolved) {
      return nestedResolved;
    }
  }

  return undefined;
}

export function requireWeekendEventId(input: unknown): string {
  const eventId = resolveWeekendEventId(input);

  if (!eventId) {
    throw new Error(
      "Could not resolve current weekend event id from the provided state/context."
    );
  }

  return eventId;
}

export function getWeekendEventReference(input: unknown): WeekendEventReference | undefined {
  const eventId = resolveWeekendEventId(input);

  if (!eventId) {
    return undefined;
  }

  return { eventId };
}