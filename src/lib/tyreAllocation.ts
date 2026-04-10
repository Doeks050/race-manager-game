import { DEFAULT_WEEKEND_TYRE_ALLOCATION_TEMPLATE } from "@/data/tyreAllocation"
import { tyreCompounds } from "@/data/tyres"
import type {
  WeekendTyreAllocation,
  WeekendTyreAllocationMap,
  WeekendTyreAllocationSummaryRow,
  WeekendTyreAllocationTemplate,
  WeekendTyreSet,
} from "@/types/tyreAllocation"
import type { TyreType } from "@/types/tyre"

const tyreCompoundNameById: Record<TyreType, string> = tyreCompounds.reduce(
  (accumulator, compound) => {
    accumulator[compound.id] = compound.name
    return accumulator
  },
  {} as Record<TyreType, string>
)

function buildTyreSetId(eventId: string, compound: TyreType, index: number): string {
  return `${eventId}-${compound}-${index + 1}`
}

function buildTyreSetLabel(compound: TyreType, index: number): string {
  const compoundName = tyreCompoundNameById[compound] ?? compound
  return `${compoundName} #${index + 1}`
}

function buildTyreSet(eventId: string, compound: TyreType, index: number): WeekendTyreSet {
  return {
    id: buildTyreSetId(eventId, compound, index),
    compound,
    label: buildTyreSetLabel(compound, index),
    wear: 0,
    status: "available",
    usedInSessions: [],
  }
}

export function createWeekendTyreAllocation(
  eventId: string,
  template: WeekendTyreAllocationTemplate = DEFAULT_WEEKEND_TYRE_ALLOCATION_TEMPLATE
): WeekendTyreAllocation {
  const sets: WeekendTyreSet[] = []

  for (const entry of template.dry) {
    for (let index = 0; index < entry.count; index += 1) {
      sets.push(buildTyreSet(eventId, entry.compound, index))
    }
  }

  for (const entry of template.wet) {
    for (let index = 0; index < entry.count; index += 1) {
      sets.push(buildTyreSet(eventId, entry.compound, index))
    }
  }

  return {
    eventId,
    sets,
  }
}

export function createTyreAllocationMapForWeekend(weekend: { id: string }): WeekendTyreAllocationMap {
  return {
    [weekend.id]: createWeekendTyreAllocation(weekend.id),
  }
}

export function ensureTyreAllocationForEvent(
  allocationMap: WeekendTyreAllocationMap,
  eventId: string,
  template: WeekendTyreAllocationTemplate = DEFAULT_WEEKEND_TYRE_ALLOCATION_TEMPLATE
): WeekendTyreAllocationMap {
  if (allocationMap[eventId]) {
    return allocationMap
  }

  return {
    ...allocationMap,
    [eventId]: createWeekendTyreAllocation(eventId, template),
  }
}

export function getTyreAllocationForEvent(
  allocationMap: WeekendTyreAllocationMap,
  eventId: string
): WeekendTyreAllocation | null {
  return allocationMap[eventId] ?? null
}

export function replaceTyreAllocationForEvent(
  allocationMap: WeekendTyreAllocationMap,
  allocation: WeekendTyreAllocation
): WeekendTyreAllocationMap {
  return {
    ...allocationMap,
    [allocation.eventId]: allocation,
  }
}

export function getTyreSetsByCompound(
  allocation: WeekendTyreAllocation,
  compound: TyreType
): WeekendTyreSet[] {
  return allocation.sets.filter((set) => set.compound === compound)
}

export function getAvailableTyreSetCount(
  allocation: WeekendTyreAllocation,
  compound: TyreType
): number {
  return allocation.sets.filter(
    (set) => set.compound === compound && set.status === "available"
  ).length
}

export function markTyreSetUsed(
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

export function markNextAvailableTyreSetUsed(
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

export function applyCompoundUsageToAllocation(
  allocation: WeekendTyreAllocation,
  compound: TyreType,
  sessionType: "practice" | "qualifying" | "race",
  wearApplied: number
): {
  allocation: WeekendTyreAllocation
  usedSetId?: string
} {
  return markNextAvailableTyreSetUsed(allocation, compound, sessionType, wearApplied)
}

export function applyMultipleCompoundUsageToAllocation(
  allocation: WeekendTyreAllocation,
  compounds: TyreType[],
  sessionType: "practice" | "qualifying" | "race",
  wearAppliedPerSet: number
): {
  allocation: WeekendTyreAllocation
  usedSetIds: string[]
} {
  let nextAllocation = allocation
  const usedSetIds: string[] = []

  for (const compound of compounds) {
    const result = markNextAvailableTyreSetUsed(
      nextAllocation,
      compound,
      sessionType,
      wearAppliedPerSet
    )

    nextAllocation = result.allocation

    if (result.usedSetId) {
      usedSetIds.push(result.usedSetId)
    }
  }

  return {
    allocation: nextAllocation,
    usedSetIds,
  }
}

export function summarizeWeekendTyreAllocation(
  allocation: WeekendTyreAllocation
): WeekendTyreAllocationSummaryRow[] {
  return tyreCompounds.map((compound) => {
    const matchingSets = allocation.sets.filter((set) => set.compound === compound.id)

    return {
      compound: compound.id,
      label: compound.name,
      total: matchingSets.length,
      available: matchingSets.filter((set) => set.status === "available").length,
      used: matchingSets.filter((set) => set.status === "used").length,
      locked: matchingSets.filter((set) => set.status === "locked").length,
    }
  })
}