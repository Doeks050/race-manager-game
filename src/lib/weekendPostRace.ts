import type { WeekendRaceResult } from "@/types/weekendRace";
import type {
  WeekendPartWear,
  WeekendPostRaceResult,
  WeekendPostRaceRewards,
} from "@/types/weekendPostRace";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function buildRewards(finishPosition: number, positionsGained: number): WeekendPostRaceRewards {
  const creditsTable: Record<number, number> = {
    1: 3000,
    2: 2400,
    3: 2000,
    4: 1700,
    5: 1500,
    6: 1300,
    7: 1150,
    8: 1000,
    9: 900,
    10: 800,
    11: 700,
    12: 600,
    13: 520,
    14: 450,
    15: 400,
    16: 360,
    17: 320,
    18: 280,
    19: 240,
    20: 200,
  };

  const xpTable: Record<number, number> = {
    1: 280,
    2: 240,
    3: 210,
    4: 185,
    5: 170,
    6: 155,
    7: 140,
    8: 130,
    9: 120,
    10: 110,
    11: 100,
    12: 90,
    13: 82,
    14: 74,
    15: 66,
    16: 58,
    17: 50,
    18: 44,
    19: 38,
    20: 32,
  };

  const baseCredits = creditsTable[finishPosition] ?? 200;
  const baseXp = xpTable[finishPosition] ?? 32;

  const gainedBonusCredits = Math.max(0, positionsGained) * 55;
  const gainedBonusXp = Math.max(0, positionsGained) * 8;

  const moraleBase =
    finishPosition <= 3
      ? 7
      : finishPosition <= 8
      ? 4
      : finishPosition <= 12
      ? 1
      : -2;

  const moraleFromMovement =
    positionsGained >= 4 ? 3 : positionsGained >= 2 ? 2 : positionsGained <= -4 ? -3 : positionsGained <= -2 ? -2 : 0;

  const fitnessLoss =
    finishPosition <= 5 ? 12 : finishPosition <= 10 ? 11 : finishPosition <= 15 ? 10 : 9;

  return {
    creditsEarned: baseCredits + gainedBonusCredits,
    driverXpEarned: baseXp + gainedBonusXp,
    moraleChange: moraleBase + moraleFromMovement,
    fitnessLoss,
  };
}

function buildPartWear(race: WeekendRaceResult): WeekendPartWear {
  const eventWear =
    race.events.filter((event) => event.type === "engine-issue").length * 2 +
    race.events.filter((event) => event.type === "puncture").length * 1;

  const positionStress = race.finishPosition <= 5 ? 1 : 0;
  const raceLengthFactor = race.stints.length >= 3 ? 1 : 0;

  return {
    engine: 2 + eventWear + positionStress,
    gearbox: 2 + raceLengthFactor,
    chassis: 1 + raceLengthFactor,
    frontWing: 1 + positionStress,
    rearWing: 1 + positionStress,
    suspension: 2 + raceLengthFactor,
    brakes: 2 + raceLengthFactor,
    cooling: 1 + eventWear,
    floor: 1 + raceLengthFactor,
  };
}

function buildSummaryLines(
  race: WeekendRaceResult,
  rewards: WeekendPostRaceRewards
): string[] {
  const lines: string[] = [];

  lines.push(`Finished P${race.finishPosition} after starting P${race.startPosition}.`);

  if (race.positionsGained > 0) {
    lines.push(`Strong race execution gained ${race.positionsGained} position(s).`);
  } else if (race.positionsGained < 0) {
    lines.push(`Race pace dropped ${Math.abs(race.positionsGained)} position(s).`);
  } else {
    lines.push("Start and finish position stayed the same.");
  }

  lines.push(`Team earned ${rewards.creditsEarned} credits from this weekend.`);
  lines.push(`Driver earned ${rewards.driverXpEarned} XP.`);
  lines.push(`Morale changed by ${rewards.moraleChange >= 0 ? "+" : ""}${rewards.moraleChange}.`);
  lines.push(`Fitness reduced by ${rewards.fitnessLoss}.`);

  if (race.events.length > 0) {
    lines.push(`Race contained ${race.events.length} notable event(s).`);
  }

  return lines;
}

export function buildWeekendPostRaceResult(
  race: WeekendRaceResult
): WeekendPostRaceResult {
  const rewards = buildRewards(race.finishPosition, race.positionsGained);
  const partWear = buildPartWear(race);

  return {
    sessionName: "Post-Race",
    processedAt: new Date().toISOString(),
    finishPosition: race.finishPosition,
    startPosition: race.startPosition,
    positionsGained: race.positionsGained,
    rewards,
    partWear,
    summaryLines: buildSummaryLines(race, rewards),
  };
}

export function applyMoraleDelta(currentMorale: number, delta: number): number {
  return clamp(currentMorale + delta, 0, 100);
}

export function applyFitnessLoss(currentFitness: number, loss: number): number {
  return clamp(currentFitness - loss, 0, 100);
}