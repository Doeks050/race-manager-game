import type { PersistedGameState } from "@/types/gameState"

export const GAME_STATE_STORAGE_KEY = "race-manager-game-state"

function isBrowser(): boolean {
  return typeof window !== "undefined"
}

function normalizePersistedGameState(
  state: Omit<PersistedGameState, "tyreAllocationsByEventId"> &
    Partial<Pick<PersistedGameState, "tyreAllocationsByEventId">>
): PersistedGameState {
  return {
    ...state,
    tyreAllocationsByEventId: state.tyreAllocationsByEventId ?? {},
  }
}

export function saveGameState(state: PersistedGameState): void {
  if (!isBrowser()) {
    return
  }

  window.localStorage.setItem(GAME_STATE_STORAGE_KEY, JSON.stringify(state))
}

export function loadGameState(): PersistedGameState | null {
  if (!isBrowser()) {
    return null
  }

  const raw = window.localStorage.getItem(GAME_STATE_STORAGE_KEY)

  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as
      | (Omit<PersistedGameState, "tyreAllocationsByEventId"> &
          Partial<Pick<PersistedGameState, "tyreAllocationsByEventId">>)
      | null

    if (!parsed) {
      return null
    }

    return normalizePersistedGameState(parsed)
  } catch {
    return null
  }
}

export function clearGameState(): void {
  if (!isBrowser()) {
    return
  }

  window.localStorage.removeItem(GAME_STATE_STORAGE_KEY)
}