import { DEFAULT_WEEKEND_TYRE_ALLOCATION } from "../data/tyreAllocation";
import type {
  WeekendTyreAllocation,
  WeekendTyreAllocationMap,
  WeekendTyreAllocationTemplate,
  WeekendTyreCompound,
  WeekendTyreSessionType,
  WeekendTyreSet,
} from "../types/tyreAllocation";

function buildTyreSetId(
  eventId: string,
  compound: WeekendTyreCompound,
  index: number
): string {
  return `${eventId}-${compound}-${index + 1}`;
}

function buildTyreSetLabel(
  compound: WeekendTyreCompound,
  index: number
): string {
  return `${compound} #${index + 1}`;
}

function buildTyreSet(
  eventId: string,
  compound: WeekendTyreCompound,
  index: number
): WeekendTyreSet {
  return {
    id: buildTyreSetId(eventId, compound, index),
    compound,
    label: buildTyreSetLabel(compound, index),
    wear: 0,
    status: "available",
    usedInSessions: [],
  };
}

export function createWeekendTyreAllocation(
  eventId: string,
  template: WeekendTyreAllocationTemplate = DEFAULT_WEEKEND_TYRE_ALLOCATION
): WeekendTyreAllocation {
  const sets: WeekendTyreSet[] = [];

  for (const entry of template.dry) {
    for (let index = 0; index < entry.count; index += 1) {
      sets.push(buildTyreSet(eventId, entry.compound, index));
    }
  }

  for (const entry of template.wet) {
    for (let index = 0; index < entry.count; index += 1) {
      sets.push(buildTyreSet(eventId, entry.compound, index));
    }
  }

  return {
    eventId,
    sets,
  };
}

export function createEmptyWeekendTyreAllocationMap(): WeekendTyreAllocationMap {
  return {};
}

export function getAllTyreSets(
  allocation: WeekendTyreAllocation
): WeekendTyreSet[] {
  return allocation.sets;
}

export function getTyreSetsByCompound(
  allocation: WeekendTyreAllocation,
  compound: WeekendTyreCompound
): WeekendTyreSet[] {
  return allocation.sets.filter((set) => set.compound === compound);
}

export function getAvailableTyreSets(
  allocation: WeekendTyreAllocation
): WeekendTyreSet[] {
  return allocation.sets.filter((set) => set.status === "available");
}

export function getAvailableTyreSetsByCompound(
  allocation: WeekendTyreAllocation,
  compound: WeekendTyreCompound
): WeekendTyreSet[] {
  return allocation.sets.filter(
    (set) => set.compound === compound && set.status === "available"
  );
}

export function getAvailableTyreSetCount(
  allocation: WeekendTyreAllocation,
  compound: WeekendTyreCompound
): number {
  return getAvailableTyreSetsByCompound(allocation, compound).length;
}

export function findTyreSetById(
  allocation: WeekendTyreAllocation,
  setId: string
): WeekendTyreSet | undefined {
  return allocation.sets.find((set) => set.id === setId);
}

export function hasTyreAllocationForEvent(
  allocationMap: WeekendTyreAllocationMap,
  eventId: string
): boolean {
  return Boolean(allocationMap[eventId]);
}

export function getTyreAllocationForEvent(
  allocationMap: WeekendTyreAllocationMap,
  eventId: string
): WeekendTyreAllocation | undefined {
  return allocationMap[eventId];
}

export function setTyreAllocationForEvent(
  allocationMap: WeekendTyreAllocationMap,
  allocation: WeekendTyreAllocation
): WeekendTyreAllocationMap {
  return {
    ...allocationMap,
    [allocation.eventId]: allocation,
  };
}

export function removeTyreAllocationForEvent(
  allocationMap: WeekendTyreAllocationMap,
  eventId: string
): WeekendTyreAllocationMap {
  const nextMap: WeekendTyreAllocationMap = { ...allocationMap };
  delete nextMap[eventId];
  return nextMap;
}

export function markTyreSetUsed(
  allocation: WeekendTyreAllocation,
  setId: string,
  sessionType: WeekendTyreSessionType,
  addedWear: number
): WeekendTyreAllocation {
  return {
    ...allocation,
    sets: allocation.sets.map((set) => {
      if (set.id !== setId) {
        return set;
      }

      const nextWear = Math.max(0, Math.min(100, set.wear + addedWear));
      const alreadyUsedInSession = set.usedInSessions.includes(sessionType);

      return {
        ...set,
        wear: nextWear,
        status: "used",
        usedInSessions: alreadyUsedInSession
          ? set.usedInSessions
          : [...set.usedInSessions, sessionType],
      };
    }),
  };
}

export function markNextAvailableTyreSetUsed(
  allocation: WeekendTyreAllocation,
  compound: WeekendTyreCompound,
  sessionType: WeekendTyreSessionType,
  addedWear: number
): { allocation: WeekendTyreAllocation; usedSetId?: string } {
  const nextAvailableSet = allocation.sets.find(
    (set) => set.compound === compound && set.status === "available"
  );

  if (!nextAvailableSet) {
    return {
      allocation,
      usedSetId: undefined,
    };
  }

  return {
    allocation: markTyreSetUsed(
      allocation,
      nextAvailableSet.id,
      sessionType,
      addedWear
    ),
    usedSetId: nextAvailableSet.id,
  };
}

export function lockTyreSet(
  allocation: WeekendTyreAllocation,
  setId: string
): WeekendTyreAllocation {
  return {
    ...allocation,
    sets: allocation.sets.map((set) => {
      if (set.id !== setId) {
        return set;
      }

      return {
        ...set,
        status: "locked",
      };
    }),
  };
}

export function unlockTyreSet(
  allocation: WeekendTyreAllocation,
  setId: string
): WeekendTyreAllocation {
  return {
    ...allocation,
    sets: allocation.sets.map((set) => {
      if (set.id !== setId) {
        return set;
      }

      if (set.status !== "locked") {
        return set;
      }

      return {
        ...set,
        status: "available",
      };
    }),
  };
}

export function resetTyreAllocationWear(
  allocation: WeekendTyreAllocation
): WeekendTyreAllocation {
  return {
    ...allocation,
    sets: allocation.sets.map((set) => ({
      ...set,
      wear: 0,
      status: "available",
      usedInSessions: [],
    })),
  };
}