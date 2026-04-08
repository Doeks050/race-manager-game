export interface FullFieldDriverEntry {
  id: string;
  name: string;
  pace: number;
  consistency: number;
  tyreManagement: number;
  qualifying: number;
  racecraft: number;
}

export interface FullFieldTeamEntry {
  id: string;
  name: string;
  performance: number;
  drivers: [FullFieldDriverEntry, FullFieldDriverEntry];
}

export const FULL_FIELD_TEAMS: FullFieldTeamEntry[] = [
  {
    id: "starter-team",
    name: "Starter Team",
    performance: 67,
    drivers: [
      {
        id: "driver-1",
        name: "Driver 1",
        pace: 72,
        consistency: 69,
        tyreManagement: 71,
        qualifying: 70,
        racecraft: 71,
      },
      {
        id: "driver-2",
        name: "Driver 2",
        pace: 68,
        consistency: 73,
        tyreManagement: 75,
        qualifying: 67,
        racecraft: 70,
      },
    ],
  },
  {
    id: "aurora-gp",
    name: "Aurora GP",
    performance: 83,
    drivers: [
      {
        id: "aurora-1",
        name: "Luca Serrin",
        pace: 86,
        consistency: 82,
        tyreManagement: 79,
        qualifying: 87,
        racecraft: 84,
      },
      {
        id: "aurora-2",
        name: "Milo Feran",
        pace: 82,
        consistency: 80,
        tyreManagement: 78,
        qualifying: 81,
        racecraft: 82,
      },
    ],
  },
  {
    id: "ironpeak-racing",
    name: "Ironpeak Racing",
    performance: 81,
    drivers: [
      {
        id: "ironpeak-1",
        name: "Ruben Kael",
        pace: 83,
        consistency: 79,
        tyreManagement: 77,
        qualifying: 84,
        racecraft: 82,
      },
      {
        id: "ironpeak-2",
        name: "Niko Vale",
        pace: 80,
        consistency: 81,
        tyreManagement: 80,
        qualifying: 79,
        racecraft: 81,
      },
    ],
  },
  {
    id: "bluecrest",
    name: "Bluecrest",
    performance: 78,
    drivers: [
      {
        id: "bluecrest-1",
        name: "Tomas Virel",
        pace: 79,
        consistency: 80,
        tyreManagement: 76,
        qualifying: 80,
        racecraft: 79,
      },
      {
        id: "bluecrest-2",
        name: "Ivo Maren",
        pace: 77,
        consistency: 78,
        tyreManagement: 79,
        qualifying: 76,
        racecraft: 78,
      },
    ],
  },
  {
    id: "solstice-motorsport",
    name: "Solstice Motorsport",
    performance: 76,
    drivers: [
      {
        id: "solstice-1",
        name: "Enzo Halvek",
        pace: 78,
        consistency: 77,
        tyreManagement: 75,
        qualifying: 79,
        racecraft: 78,
      },
      {
        id: "solstice-2",
        name: "Kai Volner",
        pace: 76,
        consistency: 79,
        tyreManagement: 77,
        qualifying: 75,
        racecraft: 77,
      },
    ],
  },
  {
    id: "redline-dynamics",
    name: "Redline Dynamics",
    performance: 74,
    drivers: [
      {
        id: "redline-1",
        name: "Joren Taal",
        pace: 75,
        consistency: 76,
        tyreManagement: 74,
        qualifying: 76,
        racecraft: 76,
      },
      {
        id: "redline-2",
        name: "Pavel Korr",
        pace: 74,
        consistency: 75,
        tyreManagement: 73,
        qualifying: 74,
        racecraft: 75,
      },
    ],
  },
  {
    id: "velocity-one",
    name: "Velocity One",
    performance: 72,
    drivers: [
      {
        id: "velocity-1",
        name: "Dean Carv",
        pace: 73,
        consistency: 73,
        tyreManagement: 72,
        qualifying: 74,
        racecraft: 73,
      },
      {
        id: "velocity-2",
        name: "Owen Trask",
        pace: 72,
        consistency: 74,
        tyreManagement: 71,
        qualifying: 72,
        racecraft: 74,
      },
    ],
  },
  {
    id: "northstar-racing",
    name: "Northstar Racing",
    performance: 70,
    drivers: [
      {
        id: "northstar-1",
        name: "Alex Verro",
        pace: 71,
        consistency: 72,
        tyreManagement: 70,
        qualifying: 71,
        racecraft: 72,
      },
      {
        id: "northstar-2",
        name: "Seth Carden",
        pace: 70,
        consistency: 71,
        tyreManagement: 72,
        qualifying: 69,
        racecraft: 71,
      },
    ],
  },
  {
    id: "blackwater",
    name: "Blackwater",
    performance: 68,
    drivers: [
      {
        id: "blackwater-1",
        name: "Rian Kosta",
        pace: 69,
        consistency: 69,
        tyreManagement: 70,
        qualifying: 68,
        racecraft: 70,
      },
      {
        id: "blackwater-2",
        name: "Felix Dorn",
        pace: 68,
        consistency: 70,
        tyreManagement: 69,
        qualifying: 67,
        racecraft: 69,
      },
    ],
  },
  {
    id: "cobalt-speed",
    name: "Cobalt Speed",
    performance: 66,
    drivers: [
      {
        id: "cobalt-1",
        name: "Bran Istel",
        pace: 67,
        consistency: 68,
        tyreManagement: 67,
        qualifying: 67,
        racecraft: 68,
      },
      {
        id: "cobalt-2",
        name: "Aron Mesk",
        pace: 66,
        consistency: 67,
        tyreManagement: 68,
        qualifying: 65,
        racecraft: 67,
      },
    ],
  },
];

export function getAllFieldDrivers() {
  return FULL_FIELD_TEAMS.flatMap((team) =>
    team.drivers.map((driver) => ({
      ...driver,
      teamId: team.id,
      teamName: team.name,
      teamPerformance: team.performance,
    }))
  );
}

export function getAllFieldTeams() {
  return FULL_FIELD_TEAMS.map((team) => ({
    teamId: team.id,
    teamName: team.name,
  }));
}