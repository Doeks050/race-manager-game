import type { Driver } from "@/types/driver"
import type { Team } from "@/types/team"

export function getActiveDriver(team: Team): Driver {
  const activeDriver = team.drivers.find(
    (driver) => driver.id === team.activeDriverId
  )

  if (!activeDriver) {
    throw new Error("Active driver not found in team")
  }

  return activeDriver
}

export function switchActiveDriver(team: Team, driverId: string): Team {
  const driverExists = team.drivers.some((driver) => driver.id === driverId)

  if (!driverExists) {
    throw new Error("Selected driver is not part of this team")
  }

  return {
    ...team,
    activeDriverId: driverId,
  }
}

export function updateDriverInTeam(team: Team, updatedDriver: Driver): Team {
  const driverExists = team.drivers.some((driver) => driver.id === updatedDriver.id)

  if (!driverExists) {
    throw new Error("Updated driver is not part of this team")
  }

  return {
    ...team,
    drivers: team.drivers.map((driver) =>
      driver.id === updatedDriver.id ? updatedDriver : driver
    ),
  }
}