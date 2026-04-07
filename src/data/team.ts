import { defaultCar } from "@/data/carParts"
import { starterDrivers } from "@/data/drivers"
import type { Team } from "@/types/team"

export const starterTeam: Team = {
  id: "team-1",
  name: "Velocity GP",
  color: "#ff5a36",
  sponsor: "NovaCore",
  credits: 50000,
  parts: defaultCar,
  drivers: starterDrivers,
  activeDriverId: starterDrivers[0].id,
}