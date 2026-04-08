import type { WeekendTyreCompoundId } from "@/types/weekendQualifying";

export type StrategyRiskLevel = "low" | "medium" | "high" | "extreme";

export interface StrategyForecastStint {
  index: number;
  tyreCompoundId: WeekendTyreCompoundId;
  plannedLaps: number;
  expectedCompetitiveLaps: number;
  expectedMaxLaps: number;
  paceScore: number;
  wearScore: number;
  riskLevel: StrategyRiskLevel;
  warning: string;
}

export interface StrategyForecast {
  raceLaps: number;
  circuitTyreStress: number;
  carTyreWearScore: number;
  driverTyreManagementScore: number;
  trainingTyreManagementBonus: number;
  weatherWearFactor: number;
  summary: string;
  stints: StrategyForecastStint[];
}