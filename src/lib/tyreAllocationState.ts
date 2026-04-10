import {
  createEmptyWeekendTyreAllocationMap,
  createWeekendTyreAllocation,
  getTyreAllocationForEvent,
  hasTyreAllocationForEvent,
  removeTyreAllocationForEvent,
  setTyreAllocationForEvent,
} from "./tyreAllocation";
import type {
  WeekendTyreAllocation,
  WeekendTyreAllocationMap,
  WeekendTyreAllocationTemplate,
} from "../types/tyreAllocation";

export interface TyreAllocationStateContainer {
  tyreAllocationsByEventId?: WeekendTyreAllocationMap;
}

export function getTyreAllocationMapFromState(
  state: TyreAllocationStateContainer | undefined | null
): WeekendTyreAllocationMap {
  if (!state?.tyreAllocationsByEventId) {
    return createEmptyWeekendTyreAllocationMap();
  }

  return state.tyreAllocationsByEventId;
}

export function getTyreAllocationFromState(
  state: TyreAllocationStateContainer | undefined | null,
  eventId: string
): WeekendTyreAllocation | undefined {
  const allocationMap = getTyreAllocationMapFromState(state);
  return getTyreAllocationForEvent(allocationMap, eventId);
}

export function hasTyreAllocationInState(
  state: TyreAllocationStateContainer | undefined | null,
  eventId: string
): boolean {
  const allocationMap = getTyreAllocationMapFromState(state);
  return hasTyreAllocationForEvent(allocationMap, eventId);
}

export function ensureTyreAllocationInState<T extends TyreAllocationStateContainer>(
  state: T,
  eventId: string,
  template?: WeekendTyreAllocationTemplate
): T & { tyreAllocationsByEventId: WeekendTyreAllocationMap } {
  const currentMap = getTyreAllocationMapFromState(state);

  if (hasTyreAllocationForEvent(currentMap, eventId)) {
    return {
      ...state,
      tyreAllocationsByEventId: currentMap,
    };
  }

  const newAllocation = createWeekendTyreAllocation(eventId, template);
  const nextMap = setTyreAllocationForEvent(currentMap, newAllocation);

  return {
    ...state,
    tyreAllocationsByEventId: nextMap,
  };
}

export function replaceTyreAllocationInState<T extends TyreAllocationStateContainer>(
  state: T,
  allocation: WeekendTyreAllocation
): T & { tyreAllocationsByEventId: WeekendTyreAllocationMap } {
  const currentMap = getTyreAllocationMapFromState(state);
  const nextMap = setTyreAllocationForEvent(currentMap, allocation);

  return {
    ...state,
    tyreAllocationsByEventId: nextMap,
  };
}

export function removeTyreAllocationFromState<T extends TyreAllocationStateContainer>(
  state: T,
  eventId: string
): T & { tyreAllocationsByEventId: WeekendTyreAllocationMap } {
  const currentMap = getTyreAllocationMapFromState(state);
  const nextMap = removeTyreAllocationForEvent(currentMap, eventId);

  return {
    ...state,
    tyreAllocationsByEventId: nextMap,
  };
}

export function ensureTyreAllocationsForEventIds<T extends TyreAllocationStateContainer>(
  state: T,
  eventIds: string[],
  template?: WeekendTyreAllocationTemplate
): T & { tyreAllocationsByEventId: WeekendTyreAllocationMap } {
  let nextState: T & { tyreAllocationsByEventId: WeekendTyreAllocationMap } = {
    ...state,
    tyreAllocationsByEventId: getTyreAllocationMapFromState(state),
  };

  for (const eventId of eventIds) {
    nextState = ensureTyreAllocationInState(nextState, eventId, template);
  }

  return nextState;
}

export function pruneTyreAllocationsToEventIds<T extends TyreAllocationStateContainer>(
  state: T,
  allowedEventIds: string[]
): T & { tyreAllocationsByEventId: WeekendTyreAllocationMap } {
  const allowed = new Set(allowedEventIds);
  const currentMap = getTyreAllocationMapFromState(state);
  const nextMap: WeekendTyreAllocationMap = {};

  for (const [eventId, allocation] of Object.entries(currentMap)) {
    if (allowed.has(eventId)) {
      nextMap[eventId] = allocation;
    }
  }

  return {
    ...state,
    tyreAllocationsByEventId: nextMap,
  };
}