import { tyreCompounds } from "@/data/tyres"
import {
  createWeekendTyreAllocation,
  getTyreAllocationForEvent,
  replaceTyreAllocationForEvent,
} from "@/lib/tyreAllocation"
import {
  ensureTyreAllocationInState,
  getTyreAllocationFromState,
  getTyreAllocationMapFromState,
  replaceTyreAllocationInState,
} from "@/lib/tyreAllocationState"
import { requireWeekendEventId } from "@/lib/weekendEvent"
import type {
  TyreAllocationAvailabilitySummary,
  TyreAllocationStateShape,
  TyreAllocationWeekendSnapshot,
  WeekendSessionTyreUsageEntry,
  WeekendSessionTyreUsageResult,
} from "@/types/tyreAllocationIntegration"
import type { WeekendTyreAllocation } from "@/types/tyreAllocation"
import type { TyreType } from "@/types/tyre"

function getTyreLabel(compound: TyreType): string {
  return tyreCompounds.find((item) => item.id === compound)?.name ?? compound
}

function getTyreSetsByCompound(
  allocation: WeekendTyreAllocation,
  compound: TyreType
) {
  return allocation.sets.filter((set) => set.compound === compound)
}

function getAvailableTyreSetCount(
  allocation: WeekendTyreAllocation,
  compound: TyreType
): number {
  return allocation.sets.filter(
    (set) => set.compound === compound && set.status === "available"
  ).length
}

function markTyreSetUsed(
  allocation: WeekendTyreAllocation,
  setId: string,
  sessionType: "practice" | "qualifying" | "race",
  addedWear: number
): WeekendTyreAllocation {
  return {
    ...allocation,
    sets: allocation.sets.map((set) => {
      if (set.id !== setId) {
        return set
      }

      const alreadyUsedInSession = set.usedInSessions.includes(sessionType)

      return {
        ...set,
        wear: Math.max(0, Math.min(100, set.wear + addedWear)),
        status: "used",
        usedInSessions: alreadyUsedInSession
          ? set.usedInSessions
          : [...set.usedInSessions, sessionType],
      }
    }),
  }
}

function markNextAvailableTyreSetUsed(
  allocation: WeekendTyreAllocation,
  compound: TyreType,
  sessionType: "practice" | "qualifying" | "race",
  addedWear: number
): { allocation: WeekendTyreAllocation; usedSetId?: string } {
  const nextAvailableSet = allocation.sets.find(
    (set) => set.compound === compound && set.status === "available"
  )

  if (!nextAvailableSet) {
    return {
      allocation,
      usedSetId: undefined,
    }
  }

  return {
    allocation: markTyreSetUsed(allocation, nextAvailableSet.id, sessionType, addedWear),
    usedSetId: nextAvailableSet.id,
  }
}

const SUMMARY_COMPOUNDS: TyreType[] = [
  "ultra-soft",
  "super-soft",
  "soft",
  "medium",
  "hard",
  "intermediate",
  "full-wet",
]

export function ensureCurrentWeekendTyreAllocation<
  T extends TyreAllocationStateShape
>(
  state: T,
  weekendContext: unknown
): T & { tyreAllocationsByEventId: Record<string, WeekendTyreAllocation> } {
  const eventId = requireWeekendEventId(weekendContext)
  return ensureTyreAllocationInState(state, eventId)
}

export function getCurrentWeekendTyreAllocation(
  state: TyreAllocationStateShape,
  weekendContext: unknown
): WeekendTyreAllocation | null {
  const eventId = requireWeekendEventId(weekendContext)
  return getTyreAllocationFromState(state, eventId)
}

export function replaceCurrentWeekendTyreAllocation<
  T extends TyreAllocationStateShape
>(
  state: T,
  weekendContext: unknown,
  allocation: WeekendTyreAllocation
): T & { tyreAllocationsByEventId: Record<string, WeekendTyreAllocation> } {
  const eventId = requireWeekendEventId(weekendContext)

  if (allocation.eventId !== eventId) {
    throw new Error(
      `Tried to replace tyre allocation for event "${eventId}" with allocation for "${allocation.eventId}".`
    )
  }

  return replaceTyreAllocationInState(state, allocation)
}

export function buildTyreAllocationAvailabilitySummary(
  allocation: WeekendTyreAllocation
): TyreAllocationAvailabilitySummary[] {
  return SUMMARY_COMPOUNDS.map((compound) => {
    const allSets = getTyreSetsByCompound(allocation, compound)
    const available = getAvailableTyreSetCount(allocation, compound)
    const locked = allSets.filter((set) => set.status === "locked").length
    const used = allSets.filter((set) => set.status === "used").length

    return {
      compound,
      label: getTyreLabel(compound),
      total: allSets.length,
      available,
      locked,
      used,
    }
  })
}

export function getCurrentWeekendTyreSnapshot(
  state: TyreAllocationStateShape,
  weekendContext: unknown
): TyreAllocationWeekendSnapshot | null {
  const allocation = getCurrentWeekendTyreAllocation(state, weekendContext)

  if (!allocation) {
    return null
  }

  return {
    eventId: allocation.eventId,
    allocation,
    summary: buildTyreAllocationAvailabilitySummary(allocation),
  }
}

export function applyTyreSetUsageToAllocation(
  allocation: WeekendTyreAllocation,
  setId: string,
  sessionType: "practice" | "qualifying" | "race",
  wearApplied: number
): WeekendSessionTyreUsageResult {
  const nextAllocation = markTyreSetUsed(allocation, setId, sessionType, wearApplied)
  const usedSet = nextAllocation.sets.find((set) => set.id === setId)

  return {
    allocation: nextAllocation,
    usedSets: usedSet
      ? [
          {
            compound: usedSet.compound,
            setId,
            wearApplied,
            sessionType,
          },
        ]
      : [],
  }
}

export function applyCompoundUsageToAllocation(
  allocation: WeekendTyreAllocation,
  compound: TyreType,
  sessionType: "practice" | "qualifying" | "race",
  wearApplied: number
): WeekendSessionTyreUsageResult {
  const result = markNextAvailableTyreSetUsed(
    allocation,
    compound,
    sessionType,
    wearApplied
  )

  if (!result.usedSetId) {
    return {
      allocation,
      usedSets: [],
    }
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
  }
}

export function applyMultipleCompoundUsageToAllocation(
  allocation: WeekendTyreAllocation,
  compounds: TyreType[],
  sessionType: "practice" | "qualifying" | "race",
  wearAppliedPerSet: number
): WeekendSessionTyreUsageResult {
  let nextAllocation = allocation
  const usedSets: WeekendSessionTyreUsageEntry[] = []

  for (const compound of compounds) {
    const result = markNextAvailableTyreSetUsed(
      nextAllocation,
      compound,
      sessionType,
      wearAppliedPerSet
    )

    nextAllocation = result.allocation

    if (result.usedSetId) {
      usedSets.push({
        compound,
        setId: result.usedSetId,
        wearApplied: wearAppliedPerSet,
        sessionType,
      })
    }
  }

  return {
    allocation: nextAllocation,
    usedSets,
  }
}

export function applyCurrentWeekendCompoundUsage<
  T extends TyreAllocationStateShape
>(
  state: T,
  weekendContext: unknown,
  compound: TyreType,
  sessionType: "practice" | "qualifying" | "race",
  wearApplied: number
): {
  state: T & { tyreAllocationsByEventId: Record<string, WeekendTyreAllocation> }
  result: WeekendSessionTyreUsageResult
} {
  const eventId = requireWeekendEventId(weekendContext)
  const ensuredState = ensureTyreAllocationInState(state, eventId)
  const allocationMap = getTyreAllocationMapFromState(ensuredState)
  const currentAllocation =
    getTyreAllocationForEvent(allocationMap, eventId) ?? createWeekendTyreAllocation(eventId)

  const result = applyCompoundUsageToAllocation(
    currentAllocation,
    compound,
    sessionType,
    wearApplied
  )

  const nextMap = replaceTyreAllocationForEvent(allocationMap, result.allocation)

  return {
    state: {
      ...ensuredState,
      tyreAllocationsByEventId: nextMap,
    },
    result,
  }
}

export function applyCurrentWeekendMultipleCompoundUsage<
  T extends TyreAllocationStateShape
>(
  state: T,
  weekendContext: unknown,
  compounds: TyreType[],
  sessionType: "practice" | "qualifying" | "race",
  wearAppliedPerSet: number
): {
  state: T & { tyreAllocationsByEventId: Record<string, WeekendTyreAllocation> }
  result: WeekendSessionTyreUsageResult
} {
  const eventId = requireWeekendEventId(weekendContext)
  const ensuredState = ensureTyreAllocationInState(state, eventId)
  const allocationMap = getTyreAllocationMapFromState(ensuredState)
  const currentAllocation =
    getTyreAllocationForEvent(allocationMap, eventId) ?? createWeekendTyreAllocation(eventId)

  const result = applyMultipleCompoundUsageToAllocation(
    currentAllocation,
    compounds,
    sessionType,
    wearAppliedPerSet
  )

  const nextMap = replaceTyreAllocationForEvent(allocationMap, result.allocation)

  return {
    state: {
      ...ensuredState,
      tyreAllocationsByEventId: nextMap,
    },
    result,
  }
}