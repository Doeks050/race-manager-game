import type {
  WeekendQualifyingEntry,
  WeekendQualifyingResult,
  WeekendTrainingSelection,
} from "@/types/weekendQualifying";

interface SimulateWeekendQualifyingInput {
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
      return 81_500;
    case "bahrain":
      return 89_200;
    case "jeddah":
      return 87_300;
    case "monza":
      return 80_100;
    case "monaco":
      return 72_900;
    default:
      return 84_000;
  }
}

function getWeatherAdjustmentMs(weatherId: string): number {
  switch (weatherId) {
    case "sunny":
      return 0;
    case "cloudy":
      return 180;
    case "cold":
      return 320;
    case "light-rain":
      return 2_400;
    case "heavy-rain":
      return 5_400;
    case "mixed":
      return 1_500;
    default:
      return 0;
  }
}

function getCompoundAdjustmentMs(compoundId: string): number {
  switch (compoundId) {
    case "ultra-soft":
      return -900;
    case "super-soft":
      return -650;
    case "soft":
      return -300;
    case "medium":
      return 0;
    case "hard":
      return 450;
    case "intermediate":
      return 1_800;
    case "full-wet":
      return 3_000;
    default:
      return 0;
  }
}

function getTrainingAdjustmentMs(
  trainingPlan: WeekendTrainingSelection | null
): number {
  if (!trainingPlan) {
    return 0;
  }

  let total = 0;

  if (trainingPlan.trim === "quali") total -= 550;
  if (trainingPlan.trim === "balanced") total -= 180;
  if (trainingPlan.trim === "race") total += 120;

  if (trainingPlan.skill === "cornering") total -= 170;
  if (trainingPlan.skill === "straight-line") total -= 170;
  if (trainingPlan.skill === "consistency") total -= 110;
  if (trainingPlan.skill === "tyre-management") total += 50;
  if (trainingPlan.skill === "pitstop") total += 90;

  if (trainingPlan.slots === 1) total -= 220;
  if (trainingPlan.slots === 2) total -= 120;
  if (trainingPlan.slots === 3) total -= 60;

  total += getCompoundAdjustmentMs(trainingPlan.compound);

  return total;
}

function getPlayerDriverName(driverId: string): string {
  return PLAYER_DRIVER_NAMES[driverId] ?? driverId;
}

function buildAiLapTime(baseLapTimeMs: number, weatherId: string): number {
  const weatherAdjustment = getWeatherAdjustmentMs(weatherId);
  const raw = baseLapTimeMs + weatherAdjustment + randomBetween(-1200, 2200);
  return Math.round(raw);
}

function buildPlayerLapTime(
  baseLapTimeMs: number,
  weatherId: string,
  trainingPlan: WeekendTrainingSelection | null
): number {
  const weatherAdjustment = getWeatherAdjustmentMs(weatherId);
  const trainingAdjustment = getTrainingAdjustmentMs(trainingPlan);
  const randomness = randomBetween(-700, 900);

  return Math.round(
    baseLapTimeMs + weatherAdjustment + trainingAdjustment + randomness
  );
}

export function formatLapTime(ms: number): string {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds - minutes * 60;
  return `${minutes}:${seconds.toFixed(3).padStart(6, "0")}`;
}

export function simulateWeekendQualifying(
  input: SimulateWeekendQualifyingInput
): WeekendQualifyingResult {
  const baseLapTimeMs = getBaseLapTimeMs(input.circuitId);
  const playerLapTimeMs = buildPlayerLapTime(
    baseLapTimeMs,
    input.weatherId,
    input.trainingPlan
  );

  const playerCompound = input.trainingPlan?.compound ?? "medium";

  const allEntries: Omit<WeekendQualifyingEntry, "position" | "gapToPoleMs">[] = [
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
      lapTimeMs: buildAiLapTime(baseLapTimeMs, input.weatherId),
      tyreCompoundId: "soft" as const,
      isPlayer: false,
    })),
  ];

  const sorted = [...allEntries].sort((a, b) => a.lapTimeMs - b.lapTimeMs);
  const poleTime = sorted[0]?.lapTimeMs ?? playerLapTimeMs;

  const entries: WeekendQualifyingEntry[] = sorted.map((entry, index) => ({
    ...entry,
    position: index + 1,
    gapToPoleMs: entry.lapTimeMs - poleTime,
  }));

  const playerEntry = entries.find((entry) => entry.isPlayer);

  return {
    sessionName: "Qualifying",
    circuitId: input.circuitId,
    weatherId: input.weatherId,
    attemptedAt: new Date().toISOString(),
    playerDriverId: input.activeDriverId,
    playerTeamId: input.teamId,
    playerBestLapMs: playerLapTimeMs,
    playerPosition: playerEntry?.position ?? entries.length,
    tyreCompoundId: playerCompound,
    entries,
  };
}