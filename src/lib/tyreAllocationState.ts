import {
  createWeekendTyreAllocation,
  ensureTyreAllocationForEvent,
  getTyreAllocationForEvent,
  replaceTyreAllocationForEvent,
} from "@/lib/tyreAllocation"
import type {
  WeekendTyreAllocation,
  WeekendTyreAllocationMap,
  WeekendTyreAllocationTemplate,
} from "@/types/tyreAllocation"

export interface TyreAllocationStateContainer {
  tyreAllocationsByEventId?: WeekendTyreAllocationMap
}

export function getTyreAllocationMapFromState(
  state: TyreAllocationStateContainer | undefined | null
): WeekendTyreAllocationMap {
  return state?.tyreAllocationsByEventId ?? {}
}

export function getTyreAllocationFromState(
  state: TyreAllocationStateContainer | undefined | null,
  eventId: string
): WeekendTyreAllocation | null {
  const allocationMap = getTyreAllocationMapFromState(state)
  return getTyreAllocationForEvent(allocationMap, eventId)
}

export function hasTyreAllocationInState(
  state: TyreAllocationStateContainer | undefined | null,
  eventId: string
): boolean {
  return getTyreAllocationFromState(state, eventId) !== null
}

export function ensureTyreAllocationInState<T extends TyreAllocationStateContainer>(
  state: T,
  eventId: string,
  template?: WeekendTyreAllocationTemplate
): T & { tyreAllocationsByEventId: WeekendTyreAllocationMap } {
  const currentMap = getTyreAllocationMapFromState(state)

  return {
    ...state,
    tyreAllocationsByEventId: ensureTyreAllocationForEvent(currentMap, eventId, template),
  }
}

export function replaceTyreAllocationInState<T extends TyreAllocationStateContainer>(
  state: T,
  allocation: WeekendTyreAllocation
): T & { tyreAllocationsByEventId: WeekendTyreAllocationMap } {
  const currentMap = getTyreAllocationMapFromState(state)

  return {
    ...state,
    tyreAllocationsByEventId: replaceTyreAllocationForEvent(currentMap, allocation),
  }
}

export function removeTyreAllocationFromState<T extends TyreAllocationStateContainer>(
  state: T,
  eventId: string
): T & { tyreAllocationsByEventId: WeekendTyreAllocationMap } {
  const currentMap = getTyreAllocationMapFromState(state)
  const nextMap: WeekendTyreAllocationMap = { ...currentMap }

  delete nextMap[eventId]

  return {
    ...state,
    tyreAllocationsByEventId: nextMap,
  }
}

export function ensureTyreAllocationsForEventIds<T extends TyreAllocationStateContainer>(
  state: T,
  eventIds: string[],
  template?: WeekendTyreAllocationTemplate
): T & { tyreAllocationsByEventId: WeekendTyreAllocationMap } {
  let nextMap = getTyreAllocationMapFromState(state)

  for (const eventId of eventIds) {
    nextMap = ensureTyreAllocationForEvent(nextMap, eventId, template)
  }

  return {
    ...state,
    tyreAllocationsByEventId: nextMap,
  }
}

export function pruneTyreAllocationsToEventIds<T extends TyreAllocationStateContainer>(
  state: T,
  allowedEventIds: string[]
): T & { tyreAllocationsByEventId: WeekendTyreAllocationMap } {
  const allowed = new Set(allowedEventIds)
  const currentMap = getTyreAllocationMapFromState(state)
  const nextMap: WeekendTyreAllocationMap = {}

  for (const [eventId, allocation] of Object.entries(currentMap)) {
    if (allowed.has(eventId)) {
      nextMap[eventId] = allocation
    }
  }

  return {
    ...state,
    tyreAllocationsByEventId: nextMap,
  }
}

export function createTyreAllocationStateForEvent(
  eventId: string,
  template?: WeekendTyreAllocationTemplate
): { tyreAllocationsByEventId: WeekendTyreAllocationMap } {
  const allocation = createWeekendTyreAllocation(eventId, template)

  return {
    tyreAllocationsByEventId: {
      [eventId]: allocation,
    },
  }
}