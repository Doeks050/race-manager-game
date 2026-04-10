import type { WeekendTyreAllocationTemplate } from "@/types/tyreAllocation"

export const DEFAULT_WEEKEND_TYRE_ALLOCATION_TEMPLATE: WeekendTyreAllocationTemplate = {
  dry: [
    { compound: "ultra-soft", count: 1 },
    { compound: "super-soft", count: 2 },
    { compound: "soft", count: 3 },
    { compound: "medium", count: 3 },
    { compound: "hard", count: 2 },
  ],
  wet: [
    { compound: "intermediate", count: 2 },
    { compound: "full-wet", count: 1 },
  ],
}