import {
  buildRaceStintPlan,
  normalizeRaceStrategyForRaceLaps,
} from "@/lib/raceStrategy";
import type { DriverRaceStrategy } from "@/types/raceStrategy";
import type {
  StrategyForecast,
  StrategyForecastStint,
  StrategyRiskLevel,
} from "@/types/strategyForecast";
import type {
  WeekendTrainingSelection,
  WeekendTyreCompoundId,
} from "@/types/weekendQualifying";

interface DriverProfile {
  pace: number;
  consistency: number;
  tyreManagement: number;
  focus: number;
}

interface CarProfile {
  tyreWear: number;
  grip: number;
  balance: number;
}

interface CircuitProfile {
  raceLaps: number;
  tyreStress: number;
  gripImportance: number;
  powerImportance: number;
}

const DRIVER_PROFILES: Record<string, DriverProfile> = {
  "driver-1": {
    pace: 72,
    consistency: 69,
    tyreManagement: 71,
    focus: 70,
  },
  "driver-2": {
    pace: 68,
    consistency: 73,
    tyreManagement: 75,
    focus: 72,
  },
};

const TEAM_CAR_PROFILES: Record<string, CarProfile> = {
  "starter-team": {
    tyreWear: 62,
    grip: 64,
    balance: 63,
  },
};

const CIRCUIT_PROFILES: Record<string, CircuitProfile> = {
  melbourne: {
    raceLaps: 58,
    tyreStress: 0.58,
    gripImportance: 0.72,
    powerImportance: 0.54,
  },
  bahrain: {
    raceLaps: 57,
    tyreStress: 0.82,
    gripImportance: 0.61,
    powerImportance: 0.68,
  },
  jeddah: {
    raceLaps: 50,
    tyreStress: 0.46,
    gripImportance: 0.57,
    powerImportance: 0.77,
  },
  monza: {
    raceLaps: 53,
    tyreStress: 0.39,
    gripImportance: 0.42,
    powerImportance: 0.89,
  },
  monaco: {
    raceLaps: 78,
    tyreStress: 0.71,
    gripImportance: 0.91,
    powerImportance: 0.23,
  },
};

const COMPOUND_BASES: Record<
  WeekendTyreCompoundId,
  {
    pace: number;
    durability: number;
    wearResistance: number;
  }
> = {
  "ultra-soft": {
    pace: 98,
    durability: 36,
    wearResistance: 28,
  },
  "super-soft": {
    pace: 92,
    durability: 44,
    wearResistance: 36,
  },
  soft: {
    pace: 84,
    durability: 57,
    wearResistance: 48,
  },
  medium: {
    pace: 74,
    durability: 72,
    wearResistance: 63,
  },
  hard: {
    pace: 62,
    durability: 86,
    wearResistance: 81,
  },
  intermediate: {
    pace: 49,
    durability: 66,
    wearResistance: 58,
  },
  "full-wet": {
    pace: 37,
    durability: 78,
    wearResistance: 72,
  },
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getDriverProfile(driverId: string): DriverProfile {
  return (
    DRIVER_PROFILES[driverId] ?? {
      pace: 70,
      consistency: 70,
      tyreManagement: 70,
      focus: 70,
    }
  );
}

function getCarProfile(teamId: string): CarProfile {
  return (
    TEAM_CAR_PROFILES[teamId] ?? {
      tyreWear: 62,
      grip: 62,
      balance: 62,
    }
  );
}

function getCircuitProfile(circuitId: string): CircuitProfile {
  return (
    CIRCUIT_PROFILES[circuitId] ?? {
      raceLaps: 56,
      tyreStress: 0.6,
      gripImportance: 0.65,
      powerImportance: 0.6,
    }
  );
}

function getWeatherWearFactor(weatherId: string): number {
  switch (weatherId) {
    case "sunny":
      return 1.0;
    case "cloudy":
      return 0.97;
    case "cold":
      return 0.93;
    case "light-rain":
      return 1.08;
    case "heavy-rain":
      return 1.14;
    case "mixed":
      return 1.1;
    default:
      return 1.0;
  }
}

function getTrainingTyreBonus(training: WeekendTrainingSelection | null | undefined): number {
  if (!training) {
    return 0;
  }

  let bonus = 0;

  if (training.skill === "tyre-management") {
    bonus += 8;
  }

  if (training.trim === "race") {
    bonus += 2;
  }

  if (training.slots === 1) {
    bonus += 2;
  } else if (training.slots === 2) {
    bonus += 1;
  }

  return bonus;
}

function buildPaceScore(
  compoundId: WeekendTyreCompoundId,
  driver: DriverProfile,
  car: CarProfile,
  circuit: CircuitProfile,
  training: WeekendTrainingSelection | null | undefined
): number {
  const compound = COMPOUND_BASES[compoundId];

  let score =
    compound.pace +
    driver.pace * 0.18 +
    driver.focus * 0.08 +
    car.grip * 0.14 +
    car.balance * 0.08 +
    circuit.gripImportance * 12;

  if (training?.trim === "quali") {
    score += 2;
  }

  if (training?.trim === "race") {
    score += 1;
  }

  if (training?.compound === compoundId) {
    score += 2;
  }

  return Math.round(score);
}

function buildExpectedLaps(
  compoundId: WeekendTyreCompoundId,
  driver: DriverProfile,
  car: CarProfile,
  circuit: CircuitProfile,
  training: WeekendTrainingSelection | null | undefined,
  weatherId: string
): { expectedCompetitiveLaps: number; expectedMaxLaps: number; wearScore: number } {
  const compound = COMPOUND_BASES[compoundId];
  const trainingTyreBonus = getTrainingTyreBonus(training);
  const weatherFactor = getWeatherWearFactor(weatherId);

  const managementScore =
    driver.tyreManagement * 0.45 +
    driver.consistency * 0.2 +
    car.tyreWear * 0.35 +
    trainingTyreBonus;

  const stressPenalty =
    circuit.tyreStress * 34 +
    (weatherFactor - 1) * 28;

  const rawDurability =
    compound.durability * 0.72 +
    compound.wearResistance * 0.28 +
    managementScore * 0.34 -
    stressPenalty;

  const expectedCompetitiveLaps = clamp(Math.round(rawDurability / 3.45), 6, 40);
  const expectedMaxLaps = clamp(
    Math.round(expectedCompetitiveLaps + compound.wearResistance / 9),
    expectedCompetitiveLaps + 1,
    48
  );

  const wearScore = Math.round(
    100 -
      (compound.wearResistance * 0.5 +
        managementScore * 0.22 -
        circuit.tyreStress * 22 -
        (weatherFactor - 1) * 20)
  );

  return {
    expectedCompetitiveLaps,
    expectedMaxLaps,
    wearScore: clamp(wearScore, 10, 99),
  };
}

function buildRisk(
  plannedLaps: number,
  expectedCompetitiveLaps: number,
  expectedMaxLaps: number
): { riskLevel: StrategyRiskLevel; warning: string } {
  if (plannedLaps <= expectedCompetitiveLaps) {
    return {
      riskLevel: "low",
      warning: "Stable stint length for this compound.",
    };
  }

  if (plannedLaps <= expectedCompetitiveLaps + 2) {
    return {
      riskLevel: "medium",
      warning: "Manageable, but wear will rise late in the stint.",
    };
  }

  if (plannedLaps <= expectedMaxLaps) {
    return {
      riskLevel: "high",
      warning: "High degradation risk near the end of the stint.",
    };
  }

  return {
    riskLevel: "extreme",
    warning: "Very risky. This stint is likely too long for the selected tyre.",
  };
}

function buildSummary(
  stints: StrategyForecastStint[],
  raceLaps: number
): string {
  const highOrWorse = stints.filter(
    (stint) => stint.riskLevel === "high" || stint.riskLevel === "extreme"
  ).length;

  if (highOrWorse === 0) {
    return `Balanced strategy for ${raceLaps} laps. No critical tyre risk detected.`;
  }

  if (highOrWorse === 1) {
    return `Strategy covers ${raceLaps} laps, but one stint carries notable tyre risk.`;
  }

  return `Strategy covers ${raceLaps} laps, but multiple stints look aggressive on wear.`;
}

export function buildStrategyForecast(input: {
  teamId: string;
  driverId: string;
  circuitId: string;
  weatherId: string;
  trainingPlan: WeekendTrainingSelection | null | undefined;
  raceStrategy: DriverRaceStrategy | null | undefined;
}): StrategyForecast {
  const driver = getDriverProfile(input.driverId);
  const car = getCarProfile(input.teamId);
  const circuit = getCircuitProfile(input.circuitId);
  const trainingBonus = getTrainingTyreBonus(input.trainingPlan);
  const weatherWearFactor = getWeatherWearFactor(input.weatherId);
  const normalizedStrategy = normalizeRaceStrategyForRaceLaps(
    input.raceStrategy,
    circuit.raceLaps
  );
  const stintPlan = buildRaceStintPlan(normalizedStrategy, circuit.raceLaps);

  const stints: StrategyForecastStint[] = stintPlan.map((stint, index) => {
    const expected = buildExpectedLaps(
      stint.tyreCompoundId,
      driver,
      car,
      circuit,
      input.trainingPlan,
      input.weatherId
    );

    const paceScore = buildPaceScore(
      stint.tyreCompoundId,
      driver,
      car,
      circuit,
      input.trainingPlan
    );

    const risk = buildRisk(
      stint.lapCount,
      expected.expectedCompetitiveLaps,
      expected.expectedMaxLaps
    );

    return {
      index: index + 1,
      tyreCompoundId: stint.tyreCompoundId,
      plannedLaps: stint.lapCount,
      expectedCompetitiveLaps: expected.expectedCompetitiveLaps,
      expectedMaxLaps: expected.expectedMaxLaps,
      paceScore,
      wearScore: expected.wearScore,
      riskLevel: risk.riskLevel,
      warning: risk.warning,
    };
  });

  return {
    raceLaps: circuit.raceLaps,
    circuitTyreStress: Math.round(circuit.tyreStress * 100),
    carTyreWearScore: car.tyreWear,
    driverTyreManagementScore: driver.tyreManagement,
    trainingTyreManagementBonus: trainingBonus,
    weatherWearFactor,
    summary: buildSummary(stints, circuit.raceLaps),
    stints,
  };
}