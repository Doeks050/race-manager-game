import type { Driver } from "@/types/driver"

export const starterDrivers: Driver[] = [
  {
    id: "driver-1",
    name: "Lucas Meyer",
    stats: {
      pace: 20,
      consistency: 20,
      racecraft: 20,
      tyreManagement: 20,
      focus: 20,
    },
    state: {
      fitness: 100,
      morale: 100,
      experience: 0,
    },
  },
  {
    id: "driver-2",
    name: "Noah Petrov",
    stats: {
      pace: 20,
      consistency: 20,
      racecraft: 20,
      tyreManagement: 20,
      focus: 20,
    },
    state: {
      fitness: 100,
      morale: 100,
      experience: 0,
    },
  },
]