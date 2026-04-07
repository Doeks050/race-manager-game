export interface WeekendPartWear {
  engine: number;
  gearbox: number;
  chassis: number;
  frontWing: number;
  rearWing: number;
  suspension: number;
  brakes: number;
  cooling: number;
  floor: number;
}

export interface WeekendPostRaceRewards {
  creditsEarned: number;
  driverXpEarned: number;
  moraleChange: number;
  fitnessLoss: number;
}

export interface WeekendPostRaceResult {
  sessionName: string;
  processedAt: string;

  finishPosition: number;
  startPosition: number;
  positionsGained: number;

  rewards: WeekendPostRaceRewards;
  partWear: WeekendPartWear;

  summaryLines: string[];
}