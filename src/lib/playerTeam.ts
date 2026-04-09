import type { AppTeamState, TeamPartKey } from "@/types/gameState";

export interface DerivedCarStats {
  power: number;
  acceleration: number;
  grip: number;
  tyreWear: number;
  reliability: number;
  balance: number;
}

export const TEAM_PART_KEYS: TeamPartKey[] = [
  "engine",
  "gearbox",
  "chassis",
  "frontWing",
  "rearWing",
  "suspension",
  "brakes",
  "cooling",
  "floor",
];

export const TEAM_PART_LABELS: Record<TeamPartKey, string> = {
  engine: "Engine",
  gearbox: "Gearbox",
  chassis: "Chassis",
  frontWing: "Front Wing",
  rearWing: "Rear Wing",
  suspension: "Suspension",
  brakes: "Brakes",
  cooling: "Cooling",
  floor: "Floor",
};

// Temporary app-side starter budget until this comes from a dedicated economy bootstrap.
const STARTER_TEAM_CREDITS = 5000;

export function createStarterAppTeam(): AppTeamState {
  return {
    id: "starter-team",
    name: "Starter Team",
    color: "#ffffff",
    sponsor: "Open Grid",
    credits: STARTER_TEAM_CREDITS,
    activeDriverId: "driver-1",
    drivers: [
      { id: "driver-1", name: "Driver 1" },
      { id: "driver-2", name: "Driver 2" },
    ],
    parts: {
      engine: 20,
      gearbox: 20,
      chassis: 20,
      frontWing: 20,
      rearWing: 20,
      suspension: 20,
      brakes: 20,
      cooling: 20,
      floor: 20,
    },
  };
}

export function getPartUpgradeCost(currentValue: number): number {
  return Math.round(200 + currentValue * 35);
}

export function canAffordPartUpgrade(team: AppTeamState, partKey: TeamPartKey): boolean {
  const currentValue = team.parts[partKey];
  return team.credits >= getPartUpgradeCost(currentValue);
}

export function upgradeTeamPart(team: AppTeamState, partKey: TeamPartKey): AppTeamState {
  const currentValue = team.parts[partKey];
  const cost = getPartUpgradeCost(currentValue);

  if (team.credits < cost) {
    return team;
  }

  return {
    ...team,
    credits: team.credits - cost,
    parts: {
      ...team.parts,
      [partKey]: currentValue + 1,
    },
  };
}

export function getDerivedCarStats(team: AppTeamState): DerivedCarStats {
  const p = team.parts;

  const power = Math.round(
    p.engine * 0.6 +
      p.gearbox * 0.2 +
      p.cooling * 0.1 +
      p.floor * 0.1
  );

  const acceleration = Math.round(
    p.engine * 0.3 +
      p.gearbox * 0.3 +
      p.rearWing * 0.1 +
      p.floor * 0.1 +
      p.suspension * 0.2
  );

  const grip = Math.round(
    p.frontWing * 0.2 +
      p.rearWing * 0.2 +
      p.floor * 0.2 +
      p.suspension * 0.2 +
      p.chassis * 0.2
  );

  const tyreWear = Math.round(
    p.suspension * 0.3 +
      p.floor * 0.2 +
      p.chassis * 0.2 +
      p.rearWing * 0.1 +
      p.frontWing * 0.1 +
      p.brakes * 0.1
  );

  const reliability = Math.round(
    p.engine * 0.2 +
      p.gearbox * 0.2 +
      p.brakes * 0.15 +
      p.cooling * 0.25 +
      p.chassis * 0.2
  );

  const balance = Math.round(
    p.frontWing * 0.2 +
      p.rearWing * 0.2 +
      p.floor * 0.15 +
      p.suspension * 0.2 +
      p.chassis * 0.15 +
      p.brakes * 0.1
  );

  return {
    power,
    acceleration,
    grip,
    tyreWear,
    reliability,
    balance,
  };
}