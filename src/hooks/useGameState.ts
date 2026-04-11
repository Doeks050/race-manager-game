"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { clearGameState, loadGameState, saveGameState } from "@/lib/gameState"
import { createDefaultRaceStrategy } from "@/lib/raceStrategy"
import {
  buildFullFieldRoundResults,
  classifyPracticeResultsAgainstField,
  classifyQualifyingResultsAgainstField,
  classifyRaceResultsAgainstField,
} from "@/lib/fullField"
import { applyWeekendToSeason, createInitialSeasonState } from "@/lib/season"
import {
  completeWeekendPractice,
  completeWeekendPostRace,
  completeWeekendQualifying,
  completeWeekendRace,
  markWeekendRewardsApplied,
  setWeekendDriverStrategy,
  setWeekendDriverTraining,
} from "@/lib/weekend"
import {
  advanceToNextWeekend,
  canAdvanceWeekend,
  createWeekendFromCalendarRound,
} from "@/lib/weekendAdvance"
import { buildWeekendPostRaceResult } from "@/lib/weekendPostRace"
import { simulateWeekendPractice } from "@/lib/weekendPractice"
import { simulateWeekendQualifying } from "@/lib/weekendQualifying"
import { simulateWeekendRace } from "@/lib/weekendRace"
import { DEV_WEEKEND_MODE, getWeekendSessionInfo } from "@/lib/weekendSession"
import {
  applyMultipleCompoundUsageToAllocation,
  countTyreSetsInAllocation,
  createTyreAllocationMapForWeekend,
  createWeekendTyreAllocation,
  createWeekendTyreAllocationFromCounts,
  ensureTyreAllocationForEvent,
  getTyreAllocationForEvent,
  getTyreCountsByCompound,
  replaceTyreAllocationForEvent,
  summarizeWeekendTyreAllocation,
  WEEKEND_TYRE_SET_CAP,
} from "@/lib/tyreAllocation"
import {
  applyPostRaceDriverWear,
  canAffordPartUpgrade,
  canRecoverDriverFitness,
  canRecoverDriverMorale,
  createStarterAppTeam,
  getDerivedCarStats,
  getDriverFitnessRecoveryCost,
  getDriverMoraleRecoveryCost,
  getPartUpgradeCost,
  getRaceDrivers,
  getReserveDrivers,
  normalizeLoadedTeam,
  recoverDriverFitness,
  recoverDriverMorale,
  setRaceSeatDriver,
  TEAM_PART_KEYS,
  upgradeTeamPart,
} from "@/lib/playerTeam"
import type { PersistedGameState, TeamPartKey } from "@/types/gameState"
import type { DriverRaceStrategy } from "@/types/raceStrategy"
import type { SeasonState } from "@/types/season"
import type {
  WeekendTyreAllocation,
  WeekendTyreAllocationMap,
  WeekendTyreAllocationSummaryRow,
} from "@/types/tyreAllocation"
import type { TyreType } from "@/types/tyre"
import type { WeekendPostRaceResult } from "@/types/weekendPostRace"
import type { WeekendPracticeResult } from "@/types/weekendPractice"
import type {
  WeekendQualifyingResult,
  WeekendTrainingSelection,
  WeekendTyreCompoundId,
} from "@/types/weekendQualifying"
import type { WeekendRaceResult } from "@/types/weekendRace"
import type { WeekendState } from "@/types/weekend"

export type AppWeekendState = WeekendState<
  WeekendTrainingSelection,
  WeekendPracticeResult,
  WeekendQualifyingResult,
  WeekendRaceResult,
  WeekendPostRaceResult
>

type SessionTyreValidation = {
  canRun: boolean
  issue: string | null
  requiredByCompound: Record<WeekendTyreCompoundId, number>
}

function createInitialWeekend(): AppWeekendState {
  const weekend = createWeekendFromCalendarRound({
    season: 1,
    round: 1,
    teamId: "starter-team",
    activeDriverId: "driver-1",
  })

  if (!weekend) {
    throw new Error("Could not create initial weekend from calendar round 1.")
  }

  return weekend as AppWeekendState
}

function createInitialTyreAllocations(weekend: AppWeekendState): WeekendTyreAllocationMap {
  return createTyreAllocationMapForWeekend(weekend)
}

function createFreshGameState() {
  const weekend = createInitialWeekend()

  return {
    weekend,
    seasonState: createInitialSeasonState(1),
    team: createStarterAppTeam(),
    tyreAllocationsByEventId: createInitialTyreAllocations(weekend),
  }
}

function syncWeekendRaceDrivers(
  current: AppWeekendState,
  raceDriverIds: [string, string]
): AppWeekendState {
  const ensureTraining = (driverId: string) =>
    current.driverSetups[driverId]?.trainingPlan ?? {
      slots: 1 as const,
      trim: "balanced" as const,
      skill: "consistency" as const,
      compound: "medium" as const,
    }

  const ensureStrategy = (driverId: string) =>
    current.driverSetups[driverId]?.raceStrategy ?? createDefaultRaceStrategy(2)

  return {
    ...current,
    activeDriverId: raceDriverIds[0],
    driverIds: [...raceDriverIds],
    driverSetups: {
      [raceDriverIds[0]]: {
        driverId: raceDriverIds[0],
        trainingPlan: ensureTraining(raceDriverIds[0]),
        raceStrategy: ensureStrategy(raceDriverIds[0]),
      },
      [raceDriverIds[1]]: {
        driverId: raceDriverIds[1],
        trainingPlan: ensureTraining(raceDriverIds[1]),
        raceStrategy: ensureStrategy(raceDriverIds[1]),
      },
    },
    practice: {
      ...current.practice,
      resultsByDriver: {
        [raceDriverIds[0]]: current.practice.resultsByDriver[raceDriverIds[0]] ?? null,
        [raceDriverIds[1]]: current.practice.resultsByDriver[raceDriverIds[1]] ?? null,
      },
    },
    qualifying: {
      ...current.qualifying,
      resultsByDriver: {
        [raceDriverIds[0]]: current.qualifying.resultsByDriver[raceDriverIds[0]] ?? null,
        [raceDriverIds[1]]: current.qualifying.resultsByDriver[raceDriverIds[1]] ?? null,
      },
    },
    race: {
      ...current.race,
      resultsByDriver: {
        [raceDriverIds[0]]: current.race.resultsByDriver[raceDriverIds[0]] ?? null,
        [raceDriverIds[1]]: current.race.resultsByDriver[raceDriverIds[1]] ?? null,
      },
    },
    postRace: {
      ...current.postRace,
      resultsByDriver: {
        [raceDriverIds[0]]: current.postRace.resultsByDriver[raceDriverIds[0]] ?? null,
        [raceDriverIds[1]]: current.postRace.resultsByDriver[raceDriverIds[1]] ?? null,
      },
    },
  }
}

function applySessionCompoundUsageToMap(params: {
  allocationMap: WeekendTyreAllocationMap
  eventId: string
  compounds: TyreType[]
  sessionType: "practice" | "qualifying" | "race"
  wearAppliedPerSet: number
}): WeekendTyreAllocationMap {
  const ensuredMap = ensureTyreAllocationForEvent(params.allocationMap, params.eventId)
  const currentAllocation =
    getTyreAllocationForEvent(ensuredMap, params.eventId) ??
    createWeekendTyreAllocation(params.eventId)

  const result = applyMultipleCompoundUsageToAllocation(
    currentAllocation,
    params.compounds,
    params.sessionType,
    params.wearAppliedPerSet
  )

  return replaceTyreAllocationForEvent(ensuredMap, result.allocation)
}

function createEmptyRequiredCompoundCounts(): Record<WeekendTyreCompoundId, number> {
  return {
    "ultra-soft": 0,
    "super-soft": 0,
    soft: 0,
    medium: 0,
    hard: 0,
    intermediate: 0,
    "full-wet": 0,
  }
}

function countRequiredCompounds(
  compounds: WeekendTyreCompoundId[]
): Record<WeekendTyreCompoundId, number> {
  const counts = createEmptyRequiredCompoundCounts()

  for (const compound of compounds) {
    counts[compound] += 1
  }

  return counts
}

function buildSessionTyreValidation(params: {
  compounds: WeekendTyreCompoundId[]
  allocation: WeekendTyreAllocation | null
  sessionLabel: string
}): SessionTyreValidation {
  const requiredByCompound = countRequiredCompounds(params.compounds)

  if (!params.allocation) {
    return {
      canRun: false,
      issue: `No tyre allocation found for ${params.sessionLabel}.`,
      requiredByCompound,
    }
  }

  const shortages: string[] = []

  for (const [compound, required] of Object.entries(requiredByCompound) as Array<
    [WeekendTyreCompoundId, number]
  >) {
    if (required <= 0) {
      continue
    }

    const available = params.allocation.sets.filter(
      (set) => set.compound === compound && set.status === "available"
    ).length

    if (available < required) {
      shortages.push(`${compound} ${available}/${required}`)
    }
  }

  if (shortages.length > 0) {
    return {
      canRun: false,
      issue: `Not enough tyre sets for ${params.sessionLabel}: ${shortages.join(" · ")}`,
      requiredByCompound,
    }
  }

  return {
    canRun: true,
    issue: null,
    requiredByCompound,
  }
}

export function useGameState() {
  const [weekend, setWeekend] = useState<AppWeekendState>(() => createInitialWeekend())
  const [seasonState, setSeasonState] = useState<SeasonState>(() =>
    createInitialSeasonState(1)
  )
  const [team, setTeam] = useState(() => createStarterAppTeam())
  const [tyreAllocationsByEventId, setTyreAllocationsByEventId] =
    useState<WeekendTyreAllocationMap>(() => createInitialTyreAllocations(createInitialWeekend()))
  const [isMounted, setIsMounted] = useState(false)
  const [hasLoadedSave, setHasLoadedSave] = useState(false)
  const [nowMs, setNowMs] = useState(0)
  const hasInitializedFromStorage = useRef(false)

  useEffect(() => {
    setIsMounted(true)
    setNowMs(Date.now())

    const savedState = loadGameState()

    if (savedState && !hasInitializedFromStorage.current) {
      const loadedTeam = normalizeLoadedTeam(savedState.team)
      const syncedWeekend = syncWeekendRaceDrivers(
        savedState.weekend as AppWeekendState,
        loadedTeam.raceDriverIds
      )

      setWeekend(syncedWeekend)
      setSeasonState(savedState.seasonState)
      setTeam(loadedTeam)
      setTyreAllocationsByEventId(
        ensureTyreAllocationForEvent(savedState.tyreAllocationsByEventId, syncedWeekend.id)
      )
      hasInitializedFromStorage.current = true
    } else if (!hasInitializedFromStorage.current) {
      hasInitializedFromStorage.current = true
    }

    setHasLoadedSave(true)

    const interval = window.setInterval(() => {
      setNowMs(Date.now())
    }, 1000)

    return () => {
      window.clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (!hasLoadedSave) {
      return
    }

    setTyreAllocationsByEventId((current) => ensureTyreAllocationForEvent(current, weekend.id))
  }, [weekend.id, hasLoadedSave])

  useEffect(() => {
    if (!hasLoadedSave) {
      return
    }

    const nextState: PersistedGameState = {
      savedAt: new Date().toISOString(),
      weekend,
      seasonState,
      team,
      tyreAllocationsByEventId,
    }

    saveGameState(nextState)
  }, [weekend, seasonState, team, tyreAllocationsByEventId, hasLoadedSave])

  const sessionInfo = useMemo(() => {
    if (!isMounted) {
      return getWeekendSessionInfo(weekend, 0)
    }

    return getWeekendSessionInfo(weekend, nowMs)
  }, [weekend, nowMs, isMounted])

  const canAdvanceToNextWeekend = useMemo(() => {
    return canAdvanceWeekend(weekend)
  }, [weekend])

  const derivedCarStats = useMemo(() => getDerivedCarStats(team), [team])

  const upgradesOverview = useMemo(
    () =>
      TEAM_PART_KEYS.map((partKey) => ({
        partKey,
        currentValue: team.parts[partKey],
        cost: getPartUpgradeCost(team.parts[partKey]),
        canAfford: canAffordPartUpgrade(team, partKey),
      })),
    [team]
  )

  const driverRecoveryOverview = useMemo(
    () =>
      team.drivers.map((driver) => ({
        driverId: driver.id,
        fitnessCost: getDriverFitnessRecoveryCost(driver),
        moraleCost: getDriverMoraleRecoveryCost(driver),
        canRecoverFitness: canRecoverDriverFitness(team, driver.id),
        canRecoverMorale: canRecoverDriverMorale(team, driver.id),
      })),
    [team]
  )

  const raceDrivers = useMemo(() => getRaceDrivers(team), [team])
  const reserveDrivers = useMemo(() => getReserveDrivers(team), [team])

  const currentWeekendTyreAllocation = useMemo<WeekendTyreAllocation | null>(() => {
    return getTyreAllocationForEvent(tyreAllocationsByEventId, weekend.id)
  }, [tyreAllocationsByEventId, weekend.id])

  const currentWeekendTyreAllocationSummary = useMemo<WeekendTyreAllocationSummaryRow[]>(() => {
    if (!currentWeekendTyreAllocation) {
      return []
    }

    return summarizeWeekendTyreAllocation(currentWeekendTyreAllocation)
  }, [currentWeekendTyreAllocation])

  const canEditWeekendTyreLoadout = useMemo(() => {
    return (
      !weekend.practice.isCompleted &&
      !weekend.qualifying.isCompleted &&
      !weekend.race.isCompleted
    )
  }, [weekend])

  const weekendSelectedTyreSetCount = useMemo(() => {
    if (!currentWeekendTyreAllocation) {
      return 0
    }

    return countTyreSetsInAllocation(currentWeekendTyreAllocation)
  }, [currentWeekendTyreAllocation])

  const plannedPracticeCompounds = useMemo<WeekendTyreCompoundId[]>(() => {
    return weekend.driverIds.map((driverId) => {
      const setup = weekend.driverSetups[driverId]
      return setup?.trainingPlan?.compound ?? "medium"
    })
  }, [weekend])

  const plannedQualifyingCompounds = useMemo<WeekendTyreCompoundId[]>(() => {
    return weekend.driverIds.map((driverId) => {
      const setup = weekend.driverSetups[driverId]
      return setup?.trainingPlan?.compound ?? "soft"
    })
  }, [weekend])

  const plannedRaceCompounds = useMemo<WeekendTyreCompoundId[]>(() => {
    return weekend.driverIds.flatMap((driverId) => {
      const setup = weekend.driverSetups[driverId]
      const strategy = setup?.raceStrategy ?? createDefaultRaceStrategy(2)
      return strategy.stints
    })
  }, [weekend])

  const practiceTyreValidation = useMemo(
    () =>
      buildSessionTyreValidation({
        compounds: plannedPracticeCompounds,
        allocation: currentWeekendTyreAllocation,
        sessionLabel: "practice",
      }),
    [plannedPracticeCompounds, currentWeekendTyreAllocation]
  )

  const qualifyingTyreValidation = useMemo(
    () =>
      buildSessionTyreValidation({
        compounds: plannedQualifyingCompounds,
        allocation: currentWeekendTyreAllocation,
        sessionLabel: "qualifying",
      }),
    [plannedQualifyingCompounds, currentWeekendTyreAllocation]
  )

  const raceTyreValidation = useMemo(
    () =>
      buildSessionTyreValidation({
        compounds: plannedRaceCompounds,
        allocation: currentWeekendTyreAllocation,
        sessionLabel: "race",
      }),
    [plannedRaceCompounds, currentWeekendTyreAllocation]
  )

  const summary = useMemo(() => {
    return {
      devMode: DEV_WEEKEND_MODE,
      saveLoaded: hasLoadedSave,
      currentSession: sessionInfo.currentSession,
      nextSession: sessionInfo.nextSession,
      countdownMs: sessionInfo.countdownMs,
      permissions: sessionInfo.permissions,
      team,
      raceDrivers,
      reserveDrivers,
      derivedCarStats,
      upgradesOverview,
      driverRecoveryOverview,
      driverSetups: weekend.driverSetups,
      practiceCompleted: weekend.practice.isCompleted,
      qualifyingCompleted: weekend.qualifying.isCompleted,
      raceCompleted: weekend.race.isCompleted,
      postRaceCompleted: weekend.postRace.isCompleted,
      rewardsApplied: weekend.postRace.rewardsApplied,
      seasonCurrentRound: seasonState.currentRound,
      driverStandingsTop10: seasonState.driverStandings.slice(0, 10),
      teamStandingsTop10: seasonState.teamStandings.slice(0, 10),
      schedule: weekend.schedule,
      canAdvanceToNextWeekend,
      practiceResults: weekend.practice.resultsByDriver,
      qualifyingResults: weekend.qualifying.resultsByDriver,
      raceResults: weekend.race.resultsByDriver,
      currentWeekendTyreAllocation,
      currentWeekendTyreAllocationSummary,
      practiceTyreValidation,
      qualifyingTyreValidation,
      raceTyreValidation,
      canEditWeekendTyreLoadout,
      weekendSelectedTyreSetCount,
      weekendTyreSetCap: WEEKEND_TYRE_SET_CAP,
    }
  }, [
    sessionInfo,
    weekend,
    seasonState,
    team,
    raceDrivers,
    reserveDrivers,
    derivedCarStats,
    upgradesOverview,
    driverRecoveryOverview,
    canAdvanceToNextWeekend,
    hasLoadedSave,
    currentWeekendTyreAllocation,
    currentWeekendTyreAllocationSummary,
    practiceTyreValidation,
    qualifyingTyreValidation,
    raceTyreValidation,
    canEditWeekendTyreLoadout,
    weekendSelectedTyreSetCount,
  ])

  function handleSetTraining(driverId: string, training: WeekendTrainingSelection) {
    setWeekend((current: AppWeekendState) =>
      setWeekendDriverTraining(current, driverId, training) as AppWeekendState
    )
  }

  function handleSetStrategy(driverId: string, raceStrategy: DriverRaceStrategy) {
    setWeekend((current: AppWeekendState) =>
      setWeekendDriverStrategy(current, driverId, raceStrategy) as AppWeekendState
    )
  }

  function handleAdjustWeekendTyreCompound(compound: WeekendTyreCompoundId, delta: number) {
    if (!canEditWeekendTyreLoadout || delta === 0) {
      return
    }

    setTyreAllocationsByEventId((current) => {
      const ensured = ensureTyreAllocationForEvent(current, weekend.id)
      const allocation =
        getTyreAllocationForEvent(ensured, weekend.id) ?? createWeekendTyreAllocation(weekend.id)

      const countsByCompound = getTyreCountsByCompound(allocation)
      const currentCount = countsByCompound[compound] ?? 0
      const nextCount = currentCount + delta

      if (nextCount < 0) {
        return ensured
      }

      const currentTotal = countTyreSetsInAllocation(allocation)
      const nextTotal = currentTotal + delta

      if (nextTotal < 0 || nextTotal > WEEKEND_TYRE_SET_CAP) {
        return ensured
      }

      const nextCounts = {
        ...countsByCompound,
        [compound]: nextCount,
      }

      const nextAllocation = createWeekendTyreAllocationFromCounts(weekend.id, nextCounts)
      return replaceTyreAllocationForEvent(ensured, nextAllocation)
    })
  }

  function handleRunPractice() {
    if (weekend.practice.isCompleted || !practiceTyreValidation.canRun) {
      return
    }

    const practiceCompounds: TyreType[] = plannedPracticeCompounds

    setWeekend((current: AppWeekendState) => {
      if (current.practice.isCompleted) {
        return current
      }

      const rawResultsByDriver: Record<string, WeekendPracticeResult | null> = {}

      current.driverIds.forEach((driverId) => {
        const setup = current.driverSetups[driverId]
        const trainingPlan =
          setup?.trainingPlan ?? {
            slots: 1,
            trim: "balanced",
            skill: "consistency",
            compound: "medium",
          }

        rawResultsByDriver[driverId] = simulateWeekendPractice({
          teamId: current.teamId,
          circuitId: current.circuitId,
          weatherId: current.weatherId,
          activeDriverId: driverId,
          trainingPlan,
        })
      })

      const classifiedResults = classifyPracticeResultsAgainstField({
        round: current.round,
        circuitId: current.circuitId,
        weatherId: current.weatherId,
        playerResultsByDriver: rawResultsByDriver,
      })

      return completeWeekendPractice(current, classifiedResults) as AppWeekendState
    })

    setTyreAllocationsByEventId((current) =>
      applySessionCompoundUsageToMap({
        allocationMap: current,
        eventId: weekend.id,
        compounds: practiceCompounds,
        sessionType: "practice",
        wearAppliedPerSet: 18,
      })
    )
  }

  function handleRunQualifying() {
    if (weekend.qualifying.isCompleted || !qualifyingTyreValidation.canRun) {
      return
    }

    const qualifyingCompounds: TyreType[] = plannedQualifyingCompounds

    setWeekend((current: AppWeekendState) => {
      if (current.qualifying.isCompleted) {
        return current
      }

      const rawResultsByDriver: Record<string, WeekendQualifyingResult | null> = {}

      current.driverIds.forEach((driverId) => {
        const setup = current.driverSetups[driverId]
        const trainingPlan =
          setup?.trainingPlan ?? {
            slots: 1,
            trim: "balanced",
            skill: "consistency",
            compound: "medium",
          }

        rawResultsByDriver[driverId] = simulateWeekendQualifying({
          teamId: current.teamId,
          circuitId: current.circuitId,
          weatherId: current.weatherId,
          activeDriverId: driverId,
          trainingPlan,
        })
      })

      const classifiedResults = classifyQualifyingResultsAgainstField({
        round: current.round,
        circuitId: current.circuitId,
        weatherId: current.weatherId,
        playerResultsByDriver: rawResultsByDriver,
      })

      return completeWeekendQualifying(current, classifiedResults) as AppWeekendState
    })

    setTyreAllocationsByEventId((current) =>
      applySessionCompoundUsageToMap({
        allocationMap: current,
        eventId: weekend.id,
        compounds: qualifyingCompounds,
        sessionType: "qualifying",
        wearAppliedPerSet: 28,
      })
    )
  }

  function handleRunRace() {
    if (weekend.race.isCompleted || !raceTyreValidation.canRun) {
      return
    }

    const raceCompounds: TyreType[] = plannedRaceCompounds

    setWeekend((current: AppWeekendState) => {
      if (current.race.isCompleted) {
        return current
      }

      const rawResultsByDriver: Record<string, WeekendRaceResult | null> = {}

      current.driverIds.forEach((driverId) => {
        const setup = current.driverSetups[driverId]
        const practiceResult = current.practice.resultsByDriver[driverId]
        const qualifyingResult = current.qualifying.resultsByDriver[driverId]

        rawResultsByDriver[driverId] = simulateWeekendRace({
          teamId: current.teamId,
          circuitId: current.circuitId,
          weatherId: current.weatherId,
          activeDriverId: driverId,
          raceStrategy: setup?.raceStrategy ?? createDefaultRaceStrategy(2),
          qualifyingPosition: qualifyingResult?.playerPosition ?? null,
          practiceBoosts: practiceResult?.boosts ?? null,
        })
      })

      const classifiedResults = classifyRaceResultsAgainstField({
        round: current.round,
        circuitId: current.circuitId,
        weatherId: current.weatherId,
        playerResultsByDriver: rawResultsByDriver,
      })

      return completeWeekendRace(current, classifiedResults) as AppWeekendState
    })

    setTyreAllocationsByEventId((current) =>
      applySessionCompoundUsageToMap({
        allocationMap: current,
        eventId: weekend.id,
        compounds: raceCompounds,
        sessionType: "race",
        wearAppliedPerSet: 40,
      })
    )
  }

  function handleApplyPostRace() {
    if (weekend.postRace.rewardsApplied) {
      return
    }

    const playerRaceResults = Object.values(weekend.race.resultsByDriver).filter(
      (value): value is WeekendRaceResult => value !== null
    )

    if (playerRaceResults.length === 0) {
      return
    }

    const postRaceResultsByDriver: Record<string, WeekendPostRaceResult | null> = {}
    let creditsEarnedForTeam = 0
    let maxFitnessLoss = 0
    let moraleDelta = 0

    weekend.driverIds.forEach((driverId) => {
      const raceResult = weekend.race.resultsByDriver[driverId]
      postRaceResultsByDriver[driverId] = raceResult
        ? buildWeekendPostRaceResult(raceResult)
        : null

      if (postRaceResultsByDriver[driverId]) {
        const rewards = postRaceResultsByDriver[driverId]!.rewards
        creditsEarnedForTeam += rewards.creditsEarned
        maxFitnessLoss = Math.max(maxFitnessLoss, rewards.fitnessLoss)
        moraleDelta = rewards.moraleChange
      }
    })

    const roundResults = buildFullFieldRoundResults({
      round: weekend.round,
      circuitId: weekend.circuitId,
      weatherId: weekend.weatherId,
      playerResultsByDriver: weekend.race.resultsByDriver,
    })

    setWeekend((current: AppWeekendState) => {
      if (!current.race.isCompleted || current.postRace.rewardsApplied) {
        return current
      }

      const withPostRace = completeWeekendPostRace(
        current,
        postRaceResultsByDriver
      ) as AppWeekendState

      return markWeekendRewardsApplied(withPostRace) as AppWeekendState
    })

    setSeasonState((currentSeason: SeasonState) =>
      applyWeekendToSeason({
        seasonState: currentSeason,
        weekendId: weekend.id,
        round: weekend.round,
        circuitId: weekend.circuitId,
        roundResults,
      })
    )

    setTeam((currentTeam) => {
      const withCredits = {
        ...currentTeam,
        credits: currentTeam.credits + creditsEarnedForTeam,
      }

      return applyPostRaceDriverWear(withCredits, maxFitnessLoss, moraleDelta)
    })
  }

  function handleAdvanceToNextWeekend() {
    const result = advanceToNextWeekend({
      currentWeekend: weekend,
      seasonState,
    })

    if (!result.nextWeekend) {
      return
    }

    const syncedNextWeekend = syncWeekendRaceDrivers(
      result.nextWeekend as AppWeekendState,
      team.raceDriverIds
    )

    setWeekend(syncedNextWeekend)
    setTyreAllocationsByEventId((current) =>
      ensureTyreAllocationForEvent(current, syncedNextWeekend.id)
    )
    setNowMs(Date.now())
  }

  function handleUpgradePart(partKey: TeamPartKey) {
    setTeam((currentTeam) => upgradeTeamPart(currentTeam, partKey))
  }

  function handleSetRaceSeatDriver(seatIndex: 0 | 1, driverId: string) {
    setTeam((currentTeam) => {
      const nextTeam = setRaceSeatDriver(currentTeam, seatIndex, driverId)

      setWeekend((currentWeekend) =>
        syncWeekendRaceDrivers(currentWeekend as AppWeekendState, nextTeam.raceDriverIds)
      )

      return nextTeam
    })
  }

  function handleRecoverDriverFitness(driverId: string) {
    setTeam((currentTeam) => recoverDriverFitness(currentTeam, driverId))
  }

  function handleRecoverDriverMorale(driverId: string) {
    setTeam((currentTeam) => recoverDriverMorale(currentTeam, driverId))
  }

  function handleResetWeekend() {
    const fresh = createFreshGameState()
    clearGameState()
    setWeekend(syncWeekendRaceDrivers(fresh.weekend, fresh.team.raceDriverIds))
    setSeasonState(fresh.seasonState)
    setTeam(fresh.team)
    setTyreAllocationsByEventId(fresh.tyreAllocationsByEventId)
    setNowMs(Date.now())
  }

  return {
    weekend,
    seasonState,
    team,
    tyreAllocationsByEventId,
    currentWeekendTyreAllocation,
    currentWeekendTyreAllocationSummary,
    practiceTyreValidation,
    qualifyingTyreValidation,
    raceTyreValidation,
    raceDrivers,
    reserveDrivers,
    derivedCarStats,
    upgradesOverview,
    driverRecoveryOverview,
    isMounted,
    hasLoadedSave,
    sessionInfo,
    canAdvanceToNextWeekend,
    canEditWeekendTyreLoadout,
    weekendSelectedTyreSetCount,
    weekendTyreSetCap: WEEKEND_TYRE_SET_CAP,
    summary,
    handleSetTraining,
    handleSetStrategy,
    handleAdjustWeekendTyreCompound,
    handleRunPractice,
    handleRunQualifying,
    handleRunRace,
    handleApplyPostRace,
    handleAdvanceToNextWeekend,
    handleUpgradePart,
    handleSetRaceSeatDriver,
    handleRecoverDriverFitness,
    handleRecoverDriverMorale,
    handleResetWeekend,
  }
}