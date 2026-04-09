import type { PersistedGameState } from "@/types/gameState";

export const GAME_STATE_STORAGE_KEY = "race-manager-game-state";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function saveGameState(state: PersistedGameState): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(GAME_STATE_STORAGE_KEY, JSON.stringify(state));
}

export function loadGameState(): PersistedGameState | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(GAME_STATE_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PersistedGameState;
  } catch {
    return null;
  }
}

export function clearGameState(): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(GAME_STATE_STORAGE_KEY);
}