import type {
  WeekendPracticeBoosts,
  WeekendPracticeEntry,
  WeekendPracticeResult,
} from "@/types/weekendPractice";
import type { WeekendTrainingSelection } from "@/types/weekendQualifying";

interface SimulateWeekendPracticeInput {
  teamId: string;
  circuitId: string;
  weatherId: string;
  activeDriverId: string;
  trainingPlan: WeekendTrainingSelection | null;
}

const PLAYER_DRIVER_NAMES: Record<string, string> = {
  "driver-1": "Driver 1",
  "driver-2": "Driver 2",
};

const AI_FIELD = [
  { driverId: "ai-01", driverName: "M. Veyron", teamId: "team-a" },
  { driverId: "ai-02", driverName: "L. Maren", teamId: "team-b" },
  { driverId: "ai-03", driverName: "T. Solberg", teamId: "team-c" },
  { driverId: "ai-04", driverName: "J. Falk", teamId: "team-d" },
  { driverId: "ai-05", driverName: "R. Kovac", teamId: "team-e" },
  { driverId: "ai-06", driverName: "E. Costa", teamId: "team-f" },
  { driverId: "ai-07", driverName: "D. Armand", teamId: "team-g" },
  { driverId: "ai-08", driverName: "P. Rivas", teamId: "team-h" },
  { driverId: "ai-09", driverName: "N. Vale", teamId: "team-i" },
  { driverId: "ai-10", driverName: "S. Tanaka", teamId: "team-j" },
  { driverId: "ai-11", driverName: "K. Ivers", teamId: "team-k" },
  { driverId: "ai-12", driverName: "A. Dumas", teamId: "team-l" },
  { driverId: "ai-13", driverName: "H. Muller", teamId: "team-m" },
  { driverId: "ai-14", driverName: "B. Silan", teamId: "team-n" },
  { driverId: "ai-15", driverName: "O. Petrov", teamId: "team-o" },
  { driverId: "ai-16", driverName: "C. Novak", teamId: "team-p" },
  { driverId: "ai-17", driverName: "F. Moreau", teamId: "team-q" },
  { driverId: "ai-18", driverName: "G. Sato", teamId: "team-r" },
  { driverId: "ai-19", driverName: "I. Becker", teamId: "team-s" },
];

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function getBaseLapTimeMs(circuitId: string): number {
  switch (circuitId) {
    case "melbourne":
      return 82_300;
    case "bahrain":
      return 90_000;
    case "jeddah":
      return 88_100;
    case "monza":
      return 80_900;
    case "monaco":
      return 73_700;
    default:
      return 84_800;
  }
}

function getWeatherAdjustmentMs(weatherId: string): number {
  switch (weatherId) {
    case "sunny":
      return 0;
    case "cloudy":
      return 150;
    case "cold":
      return 280;
    case "light-rain":
      return 2_000;
    case "heavy-rain":
      return 4_800;
    case "mixed":
      return 1_250;
    default:
      return 0;
  }
}

function buildPracticeBoosts(
  trainingPlan: WeekendTrainingSelection | null
): WeekendPracticeBoosts {
  if (!trainingPlan) {
    return {
      qualiBonusPct: 0.6,
      raceBonusPct: 0.6,
      consistencyBonusPct: 0.4,
      tyreWearReductionPct: 0.5,
      pitstopBonusPct: 0.2,
    };
  }

  let qualiBonusPct = 0.7;
  let raceBonusPct = 0.7;
  let consistencyBonusPct = 0.5;
  let tyreWearReductionPct = 0.6;
  let pitstopBonusPct = 0.2;

  if (trainingPlan.trim === "quali") {
    qualiBonusPct += 1.8;
  } else if (trainingPlan.trim === "race") {
    raceBonusPct += 1.8;
  } else {
    qualiBonusPct += 0.9;
    raceBonusPct += 0.9;
  }

  if (trainingPlan.skill === "consistency") {
    consistencyBonusPct += 1.5;
  }

  if (trainingPlan.skill === "tyre-management") {
    tyreWearReductionPct += 2.0;
  }

  if (trainingPlan.skill === "pitstop") {
    pitstopBonusPct += 1.3;
  }

  if (trainingPlan.skill === "cornering" || trainingPlan.skill === "straight-line") {
    qualiBonusPct += 0.8;
    raceBonusPct += 0.6;
  }

  if (trainingPlan.slots === 1) {
    qualiBonusPct += 0.8;
    raceBonusPct += 0.8;
  } else if (trainingPlan.slots === 2) {
    qualiBonusPct += 0.5;
    raceBonusPct += 0.5;
  } else {
    qualiBonusPct += 0.3;
    raceBonusPct += 0.3;
  }

  return {
    qualiBonusPct: Number(qualiBonusPct.toFixed(1)),
    raceBonusPct: Number(raceBonusPct.toFixed(1)),
    consistencyBonusPct: Number(consistencyBonusPct.toFixed(1)),
    tyreWearReductionPct: Number(tyreWearReductionPct.toFixed(1)),
    pitstopBonusPct: Number(pitstopBonusPct.toFixed(1)),
  };
}

function buildPracticeNotes(
  boosts: WeekendPracticeBoosts,
  trainingPlan: WeekendTrainingSelection | null
): string[] {
  const notes: string[] = [];

  if (!trainingPlan) {
    notes.push("No dedicated Friday training plan was set.");
    notes.push("The team extracted only baseline weekend data.");
    return notes;
  }

  notes.push(`Friday program focused on ${trainingPlan.trim} trim work.`);
  notes.push(`Primary coaching focus: ${trainingPlan.skill}.`);
  notes.push(`Reference compound used most effectively: ${trainingPlan.compound}.`);

  if (boosts.qualiBonusPct >= boosts.raceBonusPct) {
    notes.push("The car responded strongest on single-lap balance.");
  } else {
    notes.push("The long-run package looked stronger than the qualifying trim.");
  }

  if (boosts.tyreWearReductionPct >= 2) {
    notes.push("Tyre degradation data improved meaningfully for the weekend.");
  }

  return notes;
}

function getPlayerDriverName(driverId: string): string {
  return PLAYER_DRIVER_NAMES[driverId] ?? driverId;
}

export function simulateWeekendPractice(
  input: SimulateWeekendPracticeInput
): WeekendPracticeResult {
  const baseLapTimeMs = getBaseLapTimeMs(input.circuitId);
  const weatherAdjustment = getWeatherAdjustmentMs(input.weatherId);
  const boosts = buildPracticeBoosts(input.trainingPlan);

  const playerLapTimeMs = Math.round(
    baseLapTimeMs +
      weatherAdjustment -
      boosts.qualiBonusPct * 140 -
      boosts.consistencyBonusPct * 60 +
      randomBetween(-900, 850)
  );

  const playerCompound = input.trainingPlan?.compound ?? "medium";

  const allEntries: Omit<WeekendPracticeEntry, "position" | "gapToP1Ms">[] = [
    {
      driverId: input.activeDriverId,
      driverName: getPlayerDriverName(input.activeDriverId),
      teamId: input.teamId,
      lapTimeMs: playerLapTimeMs,
      tyreCompoundId: playerCompound,
      isPlayer: true,
    },
    ...AI_FIELD.map((driver) => ({
      driverId: driver.driverId,
      driverName: driver.driverName,
      teamId: driver.teamId,
      lapTimeMs: Math.round(
        baseLapTimeMs + weatherAdjustment + randomBetween(-1100, 2100)
      ),
      tyreCompoundId: "soft" as const,
      isPlayer: false,
    })),
  ];

  const sorted = [...allEntries].sort((a, b) => a.lapTimeMs - b.lapTimeMs);
  const p1Time = sorted[0]?.lapTimeMs ?? playerLapTimeMs;

  const entries: WeekendPracticeEntry[] = sorted.map((entry, index) => ({
    ...entry,
    position: index + 1,
    gapToP1Ms: entry.lapTimeMs - p1Time,
  }));

  const playerEntry = entries.find((entry) => entry.isPlayer);

  return {
    sessionName: "Free Practice",
    circuitId: input.circuitId,
    weatherId: input.weatherId,
    attemptedAt: new Date().toISOString(),
    playerDriverId: input.activeDriverId,
    playerTeamId: input.teamId,
    playerPosition: playerEntry?.position ?? entries.length,
    playerBestLapMs: playerLapTimeMs,
    tyreCompoundId: playerCompound,
    boosts,
    notes: buildPracticeNotes(boosts, input.trainingPlan),
    entries,
  };
}