import type { TrainingPlan } from "@/types/training"

export const starterTrainingPlan: TrainingPlan = {
  slots: [
    {
      trim: "quali",
      skill: "straight-line",
      compound: "soft",
    },
    {
      trim: "race",
      skill: "tyre-management",
      compound: "medium",
    },
    {
      trim: "balanced",
      skill: "consistency",
      compound: "hard",
    },
  ],
}