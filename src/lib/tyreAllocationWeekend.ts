import {
  createWeekendTyreAllocation,
  getAvailableTyreSetCount,
  getTyreAllocationForEvent,
  getTyreSetsByCompound,
  markNextAvailableTyreSetUsed,
  markTyreSetUsed,
  setTyreAllocationForEvent,
} from "./tyreAllocation";
import {
  ensureTyreAllocationInState,
  getTyreAllocationMapFromState,
  getTyreAllocationFromState,
  replaceTyreAllocationInState,
} from "./tyreAllocationState";
import { requireWeekendEventId } from "./weekendEvent";
import type {
  TyreAllocationAvailabilitySummary,
  TyreAllocationStateShape,
  TyreAllocationWeekendSnapshot,
  WeekendSessionTyreUsageEntry,
  WeekendSessionTyreUsageResult,
} from "../types/tyreAllocationIntegration";
import type {
  WeekendTyreAllocation,
  WeekendTyreAllocationTemplate,
  WeekendTyreCompound,
  WeekendTyreSessionType,
} from "../types/tyreAllocation";

const SUMMARY_COMPOUNDS: WeekendTyreCompound[] = [
  "ultra-soft",
  "super-soft",
  "soft",
  "medium",
  "hard",
  "intermediate",
  "full-wet",
];

export function ensureCurrentWeekendTyreAllocation<
  T extends TyreAllocationStateShape
>(
  state: T,
  weekendContext: unknown,
  template?: WeekendTyreAllocationTemplate
): T & { tyreAllocationsByEventId: Record<string, WeekendTyreAllocation> } {
  const eventId = requireWeekendEventId(weekendContext);
  return ensureTyreAllocationInState(state, eventId, template);
}

export function getCurrentWeekendTyreAllocation(
  state: TyreAllocationStateShape,
  weekendContext: unknown
): WeekendTyreAllocation | undefined {
  const eventId = requireWeekendEventId(weekendContext);
  return getTyreAllocationFromState(state, eventId);
}

export function replaceCurrentWeekendTyreAllocation<
  T extends TyreAllocationStateShape
>(
  state: T,
  weekendContext: unknown,
  allocation: WeekendTyreAllocation
): T & { tyreAllocationsByEventId: Record<string, WeekendTyreAllocation> } {
  const eventId = requireWeekendEventId(weekendContext);

  if (allocation.eventId !== eventId) {
    throw new Error(
      `Tried to replace tyre allocation for event "${eventId}" with allocation for "${allocation.eventId}".`
    );
  }

  return replaceTyreAllocationInState(state, allocation);
}

export function buildTyreAllocationAvailabilitySummary(
  allocation: WeekendTyreAllocation
): TyreAllocationAvailabilitySummary[] {
  return SUMMARY_COMPOUNDS.map((compound) => {
    const allSets = getTyreSetsByCompound(allocation, compound);
    const available = getAvailableTyreSetCount(allocation, compound);
    const locked = allSets.filter((set) => set.status === "locked").length;
    const used = allSets.filter((set) => set.status === "used").length;

    return {
      compound,
      total: allSets.length,
      available,
      locked,
      used,
    };
  });
}

export function getCurrentWeekendTyreSnapshot(
  state: TyreAllocationStateShape,
  weekendContext: unknown
): TyreAllocationWeekendSnapshot | undefined {
  const allocation = getCurrentWeekendTyreAllocation(state, weekendContext);

  if (!allocation) {
    return undefined;
  }

  return {
    eventId: allocation.eventId,
    allocation,
    summary: buildTyreAllocationAvailabilitySummary(allocation),
  };
}

export function applyTyreSetUsageToAllocation(
  allocation: WeekendTyreAllocation,
  setId: string,
  sessionType: WeekendTyreSessionType,
  wearApplied: number
): WeekendSessionTyreUsageResult {
  const nextAllocation = markTyreSetUsed(
    allocation,
    setId,
    sessionType,
    wearApplied
  );

  return {
    allocation: nextAllocation,
    usedSets: [
      {
        compound:
          nextAllocation.sets.find((set) => set.id === setId)?.compound ?? "soft",
        setId,
        wearApplied,
        sessionType,
      },
    ],
  };
}

export function applyCompoundUsageToAllocation(
  allocation: WeekendTyreAllocation,
  compound: WeekendTyreCompound,
  sessionType: WeekendTyreSessionType,
  wearApplied: number
): WeekendSessionTyreUsageResult {
  const result = markNextAvailableTyreSetUsed(
    allocation,
    compound,
    sessionType,
    wearApplied
  );

  if (!result.usedSetId) {
    return {
      allocation,
      usedSets: [],
    };
  }

  return {
    allocation: result.allocation,
    usedSets: [
      {
        compound,
        setId: result.usedSetId,
        wearApplied,
        sessionType,
      },
    ],
  };
}

export function applyMultipleCompoundUsageToAllocation(
  allocation: WeekendTyreAllocation,
  compounds: WeekendTyreCompound[],
  sessionType: WeekendTyreSessionType,
  wearAppliedPerSet: number
): WeekendSessionTyreUsageResult {
  let nextAllocation = allocation;
  const usedSets: WeekendSessionTyreUsageEntry[] = [];

  for (const compound of compounds) {
    const result = markNextAvailableTyreSetUsed(
      nextAllocation,
      compound,
      sessionType,
      wearAppliedPerSet
    );

    nextAllocation = result.allocation;

    if (result.usedSetId) {
      usedSets.push({
        compound,
        setId: result.usedSetId,
        wearApplied: wearAppliedPerSet,
        sessionType,
      });
    }
  }

  return {
    allocation: nextAllocation,
    usedSets,
  };
}

export function applyCurrentWeekendCompoundUsage<
  T extends TyreAllocationStateShape
>(
  state: T,
  weekendContext: unknown,
  compound: WeekendTyreCompound,
  sessionType: WeekendTyreSessionType,
  wearApplied: number
): {
  state: T & { tyreAllocationsByEventId: Record<string, WeekendTyreAllocation> };
  result: WeekendSessionTyreUsageResult;
} {
  const eventId = requireWeekendEventId(weekendContext);
  const ensuredState = ensureTyreAllocationInState(state, eventId);
  const allocationMap = getTyreAllocationMapFromState(ensuredState);
  const currentAllocation =
    getTyreAllocationForEvent(allocationMap, eventId) ??
    createWeekendTyreAllocation(eventId);

  const result = applyCompoundUsageToAllocation(
    currentAllocation,
    compound,
    sessionType,
    wearApplied
  );

  const nextMap = setTyreAllocationForEvent(allocationMap, result.allocation);

  return {
    state: {
      ...ensuredState,
      tyreAllocationsByEventId: nextMap,
    },
    result,
  };
}

export function applyCurrentWeekendMultipleCompoundUsage<
  T extends TyreAllocationStateShape
>(
  state: T,
  weekendContext: unknown,
  compounds: WeekendTyreCompound[],
  sessionType: WeekendTyreSessionType,
  wearAppliedPerSet: number
): {
  state: T & { tyreAllocationsByEventId: Record<string, WeekendTyreAllocation> };
  result: WeekendSessionTyreUsageResult;
} {
  const eventId = requireWeekendEventId(weekendContext);
  const ensuredState = ensureTyreAllocationInState(state, eventId);
  const allocationMap = getTyreAllocationMapFromState(ensuredState);
  const currentAllocation =
    getTyreAllocationForEvent(allocationMap, eventId) ??
    createWeekendTyreAllocation(eventId);

  const result = applyMultipleCompoundUsageToAllocation(
    currentAllocation,
    compounds,
    sessionType,
    wearAppliedPerSet
  );

  const nextMap = setTyreAllocationForEvent(allocationMap, result.allocation);

  return {
    state: {
      ...ensuredState,
      tyreAllocationsByEventId: nextMap,
    },
    result,
  };
}