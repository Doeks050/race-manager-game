import type { AppDriverState, AppTeamState, TeamPartKey } from "@/types/gameState";

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

const STARTER_TEAM_CREDITS = 5000;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function createStarterAppTeam(): AppTeamState {
  return {
    id: "starter-team",
    name: "Starter Team",
    color: "#ffffff",
    sponsor: "Open Grid",
    credits: STARTER_TEAM_CREDITS,
    raceDriverIds: ["driver-1", "driver-2"],
    reserveDriverIds: ["driver-3", "driver-4"],
    drivers: [
      {
        id: "driver-1",
        name: "Driver 1",
        fitness: 100,
        morale: 100,
        experience: 0,
      },
      {
        id: "driver-2",
        name: "Driver 2",
        fitness: 100,
        morale: 100,
        experience: 0,
      },
      {
        id: "driver-3",
        name: "Driver 3",
        fitness: 100,
        morale: 100,
        experience: 0,
      },
      {
        id: "driver-4",
        name: "Driver 4",
        fitness: 100,
        morale: 100,
        experience: 0,
      },
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

export function normalizeLoadedTeam(raw: unknown): AppTeamState {
  const fresh = createStarterAppTeam();

  if (!raw || typeof raw !== "object") {
    return fresh;
  }

  const candidate = raw as Partial<AppTeamState>;

  const drivers =
    Array.isArray(candidate.drivers) && candidate.drivers.length >= 2
      ? candidate.drivers.map((driver, index) => {
          const d = driver as Partial<AppDriverState>;
          return {
            id: typeof d.id === "string" ? d.id : `driver-${index + 1}`,
            name: typeof d.name === "string" ? d.name : `Driver ${index + 1}`,
            fitness: typeof d.fitness === "number" ? clamp(d.fitness, 0, 100) : 100,
            morale: typeof d.morale === "number" ? clamp(d.morale, 0, 100) : 100,
            experience: typeof d.experience === "number" ? Math.max(0, d.experience) : 0,
          };
        })
      : fresh.drivers;

  const driverIds = drivers.map((driver) => driver.id);

  const raceDriverIds: [string, string] =
    Array.isArray(candidate.raceDriverIds) &&
    candidate.raceDriverIds.length === 2 &&
    driverIds.includes(candidate.raceDriverIds[0]) &&
    driverIds.includes(candidate.raceDriverIds[1]) &&
    candidate.raceDriverIds[0] !== candidate.raceDriverIds[1]
      ? [candidate.raceDriverIds[0], candidate.raceDriverIds[1]]
      : [
          typeof (candidate as { activeDriverId?: string }).activeDriverId === "string" &&
          driverIds.includes((candidate as { activeDriverId?: string }).activeDriverId!)
            ? (candidate as { activeDriverId?: string }).activeDriverId!
            : drivers[0].id,
          drivers.find((driver) => driver.id !== (
            typeof (candidate as { activeDriverId?: string }).activeDriverId === "string" &&
            driverIds.includes((candidate as { activeDriverId?: string }).activeDriverId!)
              ? (candidate as { activeDriverId?: string }).activeDriverId!
              : drivers[0].id
          ))?.id ?? drivers[1].id,
        ];

  const reserveDriverIds = driverIds.filter((id) => !raceDriverIds.includes(id));

  return {
    id: typeof candidate.id === "string" ? candidate.id : fresh.id,
    name: typeof candidate.name === "string" ? candidate.name : fresh.name,
    color: typeof candidate.color === "string" ? candidate.color : fresh.color,
    sponsor: typeof candidate.sponsor === "string" ? candidate.sponsor : fresh.sponsor,
    credits: typeof candidate.credits === "number" ? Math.max(0, candidate.credits) : fresh.credits,
    raceDriverIds,
    reserveDriverIds,
    drivers,
    parts:
      candidate.parts && typeof candidate.parts === "object"
        ? {
            engine: typeof candidate.parts.engine === "number" ? candidate.parts.engine : fresh.parts.engine,
            gearbox: typeof candidate.parts.gearbox === "number" ? candidate.parts.gearbox : fresh.parts.gearbox,
            chassis: typeof candidate.parts.chassis === "number" ? candidate.parts.chassis : fresh.parts.chassis,
            frontWing: typeof candidate.parts.frontWing === "number" ? candidate.parts.frontWing : fresh.parts.frontWing,
            rearWing: typeof candidate.parts.rearWing === "number" ? candidate.parts.rearWing : fresh.parts.rearWing,
            suspension: typeof candidate.parts.suspension === "number" ? candidate.parts.suspension : fresh.parts.suspension,
            brakes: typeof candidate.parts.brakes === "number" ? candidate.parts.brakes : fresh.parts.brakes,
            cooling: typeof candidate.parts.cooling === "number" ? candidate.parts.cooling : fresh.parts.cooling,
            floor: typeof candidate.parts.floor === "number" ? candidate.parts.floor : fresh.parts.floor,
          }
        : fresh.parts,
  };
}

export function getDriverById(team: AppTeamState, driverId: string): AppDriverState | null {
  return team.drivers.find((driver) => driver.id === driverId) ?? null;
}

export function getRaceDrivers(team: AppTeamState): AppDriverState[] {
  return team.raceDriverIds
    .map((driverId) => getDriverById(team, driverId))
    .filter((driver): driver is AppDriverState => driver !== null);
}

export function getReserveDrivers(team: AppTeamState): AppDriverState[] {
  return team.reserveDriverIds
    .map((driverId) => getDriverById(team, driverId))
    .filter((driver): driver is AppDriverState => driver !== null);
}

export function setRaceSeatDriver(
  team: AppTeamState,
  seatIndex: 0 | 1,
  driverId: string
): AppTeamState {
  const exists = team.drivers.some((driver) => driver.id === driverId);

  if (!exists) {
    return team;
  }

  const currentRace = [...team.raceDriverIds] as [string, string];

  if (currentRace[seatIndex] === driverId) {
    return team;
  }

  const otherSeatIndex: 0 | 1 = seatIndex === 0 ? 1 : 0;

  if (currentRace[otherSeatIndex] === driverId) {
    const swapped: [string, string] =
      seatIndex === 0
        ? [driverId, currentRace[0]]
        : [currentRace[1], driverId];

    return {
      ...team,
      raceDriverIds: swapped,
      reserveDriverIds: team.drivers
        .map((driver) => driver.id)
        .filter((id) => !swapped.includes(id)),
    };
  }

  const replacedDriverId = currentRace[seatIndex];
  currentRace[seatIndex] = driverId;

  const reserveDriverIds = team.drivers
    .map((driver) => driver.id)
    .filter((id) => !currentRace.includes(id));

  if (!reserveDriverIds.includes(replacedDriverId)) {
    reserveDriverIds.push(replacedDriverId);
  }

  return {
    ...team,
    raceDriverIds: currentRace,
    reserveDriverIds: reserveDriverIds.filter((id, index, arr) => arr.indexOf(id) === index),
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

export function getDriverFitnessRecoveryCost(driver: AppDriverState): number {
  const missing = Math.max(0, 100 - driver.fitness);
  return missing === 0 ? 0 : Math.round(40 + missing * 6);
}

export function getDriverMoraleRecoveryCost(driver: AppDriverState): number {
  const missing = Math.max(0, 100 - driver.morale);
  return missing === 0 ? 0 : Math.round(30 + missing * 5);
}

export function canRecoverDriverFitness(team: AppTeamState, driverId: string): boolean {
  const driver = getDriverById(team, driverId);
  if (!driver) return false;
  const cost = getDriverFitnessRecoveryCost(driver);
  return cost > 0 && team.credits >= cost;
}

export function canRecoverDriverMorale(team: AppTeamState, driverId: string): boolean {
  const driver = getDriverById(team, driverId);
  if (!driver) return false;
  const cost = getDriverMoraleRecoveryCost(driver);
  return cost > 0 && team.credits >= cost;
}

export function recoverDriverFitness(team: AppTeamState, driverId: string): AppTeamState {
  const driver = getDriverById(team, driverId);

  if (!driver) {
    return team;
  }

  const cost = getDriverFitnessRecoveryCost(driver);

  if (cost <= 0 || team.credits < cost) {
    return team;
  }

  return {
    ...team,
    credits: team.credits - cost,
    drivers: team.drivers.map((entry) =>
      entry.id === driverId
        ? {
            ...entry,
            fitness: 100,
          }
        : entry
    ),
  };
}

export function recoverDriverMorale(team: AppTeamState, driverId: string): AppTeamState {
  const driver = getDriverById(team, driverId);

  if (!driver) {
    return team;
  }

  const cost = getDriverMoraleRecoveryCost(driver);

  if (cost <= 0 || team.credits < cost) {
    return team;
  }

  return {
    ...team,
    credits: team.credits - cost,
    drivers: team.drivers.map((entry) =>
      entry.id === driverId
        ? {
            ...entry,
            morale: 100,
          }
        : entry
    ),
  };
}

export function applyPostRaceDriverWear(
  team: AppTeamState,
  fitnessLoss: number,
  moraleDelta: number
): AppTeamState {
  return {
    ...team,
    drivers: team.drivers.map((driver) =>
      team.raceDriverIds.includes(driver.id)
        ? {
            ...driver,
            fitness: clamp(driver.fitness - fitnessLoss, 0, 100),
            morale: clamp(driver.morale + moraleDelta, 0, 100),
          }
        : driver
    ),
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