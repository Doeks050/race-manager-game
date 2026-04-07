import type { StrategyPreset } from "@/types/strategy"

export const starterStrategies: StrategyPreset[] = [
  {
    id: "one-stop-soft-medium",
    name: "One Stop — Soft to Medium",
    description: "Fast opening stint, then manage the race on mediums.",
    startTyreId: "soft",
    stints: [
      { tyreId: "soft", laps: 8 },
      { tyreId: "medium", laps: 10 },
    ],
  },
  {
    id: "one-stop-medium-hard",
    name: "One Stop — Medium to Hard",
    description: "Safer opening pace with stronger late-race stability.",
    startTyreId: "medium",
    stints: [
      { tyreId: "medium", laps: 9 },
      { tyreId: "hard", laps: 9 },
    ],
  },
  {
    id: "two-stop-soft-soft-medium",
    name: "Two Stop — Soft / Soft / Medium",
    description: "Aggressive pace-focused strategy with extra pit loss.",
    startTyreId: "soft",
    stints: [
      { tyreId: "soft", laps: 6 },
      { tyreId: "soft", laps: 6 },
      { tyreId: "medium", laps: 6 },
    ],
  },
]