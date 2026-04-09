"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { clearGameState, loadGameState, saveGameState } from "@/lib/gameState";
import { createDefaultRaceStrategy } from "@/lib/raceStrategy";
import {
  buildFullFieldRoundResults,
  classifyPracticeResultsAgainstField,
  classifyQualifyingResultsAgainstField,
  classifyRaceResultsAgainstField,
} from "@/lib/fullField";
import { applyWeekendToSeason, createInitialSeasonState } from "@/lib/season";
import {
  completeWeekendPractice,
  completeWeekendPostRace,
  completeWeekendQualifying,
  completeWeekendRace,
  markWeekendRewardsApplied,
  setWeekendDriverStrategy,
  setWeekendDriverTraining,
} from "@/lib/weekend";
import {
  advanceToNextWeekend,
  canAdvanceWeekend,
  createWeekendFromCalendarRound,
} from "@/lib/weekendAdvance";
import { buildWeekendPostRaceResult } from "@/lib/weekendPostRace";
import { simulateWeekendPractice } from "@/lib/weekendPractice";
import { simulateWeekendQualifying } from "@/lib/weekendQualifying";
import { simulateWeekendRace } from "@/lib/weekendRace";
import { DEV_WEEKEND_MODE, getWeekendSessionInfo } from "@/lib/weekendSession";
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
  recoverDriverFitness,
  recoverDriverMorale,
  setActiveTeamDriver,
  TEAM_PART_KEYS,
  upgradeTeamPart,
} from "@/lib/playerTeam";
import type { PersistedGameState, TeamPartKey } from "@/types/gameState";
import type { DriverRaceStrategy } from "@/types/raceStrategy";
import type { SeasonState } from "@/types/season";
import type { WeekendPostRaceResult } from "@/types/weekendPostRace";
import type { WeekendPracticeResult } from "@/types/weekendPractice";
import type {
  WeekendQualifyingResult,
  WeekendTrainingSelection,
} from "@/types/weekendQualifying";
import type { WeekendRaceResult } from "@/types/weekendRace";
import type { WeekendState } from "@/types/weekend";

export type AppWeekendState = WeekendState<
  WeekendTrainingSelection,
  WeekendPracticeResult,
  WeekendQualifyingResult,
  WeekendRaceResult,
  WeekendPostRaceResult
>;

function createInitialWeekend(): AppWeekendState {
  const weekend = createWeekendFromCalendarRound({
    season: 1,
    round: 1,
    teamId: "starter-team",
    activeDriverId: "driver-1",
  });

  if (!weekend) {
    throw new Error("Could not create initial weekend from calendar round 1.");
  }

  return weekend as AppWeekendState;
}

function createFreshGameState() {
  return {
    weekend: createInitialWeekend(),
    seasonState: createInitialSeasonState(1),
    team: createStarterAppTeam(),
  };
}

export function useGameState() {
  const [weekend, setWeekend] = useState<AppWeekendState>(() => createInitialWeekend());
  const [seasonState, setSeasonState] = useState<SeasonState>(() =>
    createInitialSeasonState(1)
  );
  const [team, setTeam] = useState(() => createStarterAppTeam());
  const [isMounted, setIsMounted] = useState(false);
  const [hasLoadedSave, setHasLoadedSave] = useState(false);
  const [nowMs, setNowMs] = useState(0);
  const hasInitializedFromStorage = useRef(false);

  useEffect(() => {
    setIsMounted(true);
    setNowMs(Date.now());

    const savedState = loadGameState();

    if (savedState && !hasInitializedFromStorage.current) {
      setWeekend(savedState.weekend as AppWeekendState);
      setSeasonState(savedState.seasonState);
      setTeam(savedState.team ?? createStarterAppTeam());
      hasInitializedFromStorage.current = true;
    } else if (!hasInitializedFromStorage.current) {
      hasInitializedFromStorage.current = true;
    }

    setHasLoadedSave(true);

    const interval = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedSave) {
      return;
    }

    const nextState: PersistedGameState = {
      savedAt: new Date().toISOString(),
      weekend,
      seasonState,
      team,
    };

    saveGameState(nextState);
  }, [weekend, seasonState, team, hasLoadedSave]);

  const sessionInfo = useMemo(() => {
    if (!isMounted) {
      return getWeekendSessionInfo(weekend, 0);
    }

    return getWeekendSessionInfo(weekend, nowMs);
  }, [weekend, nowMs, isMounted]);

  const canAdvanceToNextWeekend = useMemo(() => {
    return canAdvanceWeekend(weekend);
  }, [weekend]);

  const derivedCarStats = useMemo(() => getDerivedCarStats(team), [team]);

  const upgradesOverview = useMemo(
    () =>
      TEAM_PART_KEYS.map((partKey) => ({
        partKey,
        currentValue: team.parts[partKey],
        cost: getPartUpgradeCost(team.parts[partKey]),
        canAfford: canAffordPartUpgrade(team, partKey),
      })),
    [team]
  );

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
  );

  const summary = useMemo(() => {
    return {
      devMode: DEV_WEEKEND_MODE,
      saveLoaded: hasLoadedSave,
      currentSession: sessionInfo.currentSession,
      nextSession: sessionInfo.nextSession,
      countdownMs: sessionInfo.countdownMs,
      permissions: sessionInfo.permissions,
      team,
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
    };
  }, [
    sessionInfo,
    weekend,
    seasonState,
    team,
    derivedCarStats,
    upgradesOverview,
    driverRecoveryOverview,
    canAdvanceToNextWeekend,
    hasLoadedSave,
  ]);

  function handleSetTraining(driverId: string, training: WeekendTrainingSelection) {
    setWeekend((current: AppWeekendState) =>
      setWeekendDriverTraining(current, driverId, training) as AppWeekendState
    );
  }

  function handleSetStrategy(driverId: string, raceStrategy: DriverRaceStrategy) {
    setWeekend((current: AppWeekendState) =>
      setWeekendDriverStrategy(current, driverId, raceStrategy) as AppWeekendState
    );
  }

  function handleRunPractice() {
    setWeekend((current: AppWeekendState) => {
      if (current.practice.isCompleted) {
        return current;
      }

      const rawResultsByDriver: Record<string, WeekendPracticeResult | null> = {};

      current.driverIds.forEach((driverId) => {
        const setup = current.driverSetups[driverId];
        const trainingPlan =
          setup?.trainingPlan ?? {
            slots: 1,
            trim: "balanced",
            skill: "consistency",
            compound: "medium",
          };

        rawResultsByDriver[driverId] = simulateWeekendPractice({
          teamId: current.teamId,
          circuitId: current.circuitId,
          weatherId: current.weatherId,
          activeDriverId: driverId,
          trainingPlan,
        });
      });

      const classifiedResults = classifyPracticeResultsAgainstField({
        round: current.round,
        circuitId: current.circuitId,
        weatherId: current.weatherId,
        playerResultsByDriver: rawResultsByDriver,
      });

      return completeWeekendPractice(current, classifiedResults) as AppWeekendState;
    });
  }

  function handleRunQualifying() {
    setWeekend((current: AppWeekendState) => {
      if (current.qualifying.isCompleted) {
        return current;
      }

      const rawResultsByDriver: Record<string, WeekendQualifyingResult | null> = {};

      current.driverIds.forEach((driverId) => {
        const setup = current.driverSetups[driverId];
        const trainingPlan =
          setup?.trainingPlan ?? {
            slots: 1,
            trim: "balanced",
            skill: "consistency",
            compound: "medium",
          };

        rawResultsByDriver[driverId] = simulateWeekendQualifying({
          teamId: current.teamId,
          circuitId: current.circuitId,
          weatherId: current.weatherId,
          activeDriverId: driverId,
          trainingPlan,
        });
      });

      const classifiedResults = classifyQualifyingResultsAgainstField({
        round: current.round,
        circuitId: current.circuitId,
        weatherId: current.weatherId,
        playerResultsByDriver: rawResultsByDriver,
      });

      return completeWeekendQualifying(current, classifiedResults) as AppWeekendState;
    });
  }

  function handleRunRace() {
    setWeekend((current: AppWeekendState) => {
      if (current.race.isCompleted) {
        return current;
      }

      const rawResultsByDriver: Record<string, WeekendRaceResult | null> = {};

      current.driverIds.forEach((driverId) => {
        const setup = current.driverSetups[driverId];
        const practiceResult = current.practice.resultsByDriver[driverId];
        const qualifyingResult = current.qualifying.resultsByDriver[driverId];

        rawResultsByDriver[driverId] = simulateWeekendRace({
          teamId: current.teamId,
          circuitId: current.circuitId,
          weatherId: current.weatherId,
          activeDriverId: driverId,
          raceStrategy: setup?.raceStrategy ?? createDefaultRaceStrategy(2),
          qualifyingPosition: qualifyingResult?.playerPosition ?? null,
          practiceBoosts: practiceResult?.boosts ?? null,
        });
      });

      const classifiedResults = classifyRaceResultsAgainstField({
        round: current.round,
        circuitId: current.circuitId,
        weatherId: current.weatherId,
        playerResultsByDriver: rawResultsByDriver,
      });

      return completeWeekendRace(current, classifiedResults) as AppWeekendState;
    });
  }

  function handleApplyPostRace() {
    if (weekend.postRace.rewardsApplied) {
      return;
    }

    const playerRaceResults = Object.values(weekend.race.resultsByDriver).filter(
      (value): value is WeekendRaceResult => value !== null
    );

    if (playerRaceResults.length === 0) {
      return;
    }

    const postRaceResultsByDriver: Record<string, WeekendPostRaceResult | null> = {};
    let creditsEarnedForTeam = 0;
    let maxFitnessLoss = 0;
    let moraleDelta = 0;

    weekend.driverIds.forEach((driverId) => {
      const raceResult = weekend.race.resultsByDriver[driverId];
      postRaceResultsByDriver[driverId] = raceResult
        ? buildWeekendPostRaceResult(raceResult)
        : null;

      if (postRaceResultsByDriver[driverId]) {
        const rewards = postRaceResultsByDriver[driverId]!.rewards;
        creditsEarnedForTeam += rewards.creditsEarned;
        maxFitnessLoss = Math.max(maxFitnessLoss, rewards.fitnessLoss);
        moraleDelta = rewards.moraleChange;
      }
    });

    const roundResults = buildFullFieldRoundResults({
      round: weekend.round,
      circuitId: weekend.circuitId,
      weatherId: weekend.weatherId,
      playerResultsByDriver: weekend.race.resultsByDriver,
    });

    setWeekend((current: AppWeekendState) => {
      if (!current.race.isCompleted || current.postRace.rewardsApplied) {
        return current;
      }

      const withPostRace = completeWeekendPostRace(
        current,
        postRaceResultsByDriver
      ) as AppWeekendState;

      return markWeekendRewardsApplied(withPostRace) as AppWeekendState;
    });

    setSeasonState((currentSeason: SeasonState) =>
      applyWeekendToSeason({
        seasonState: currentSeason,
        weekendId: weekend.id,
        round: weekend.round,
        circuitId: weekend.circuitId,
        roundResults,
      })
    );

    setTeam((currentTeam) => {
      const withCredits = {
        ...currentTeam,
        credits: currentTeam.credits + creditsEarnedForTeam,
      };

      return applyPostRaceDriverWear(withCredits, maxFitnessLoss, moraleDelta);
    });
  }

  function handleAdvanceToNextWeekend() {
    const result = advanceToNextWeekend({
      currentWeekend: weekend,
      seasonState,
    });

    if (!result.nextWeekend) {
      return;
    }

    setWeekend(result.nextWeekend as AppWeekendState);
    setNowMs(Date.now());
  }

  function handleUpgradePart(partKey: TeamPartKey) {
    setTeam((currentTeam) => upgradeTeamPart(currentTeam, partKey));
  }

  function handleSetActiveDriver(driverId: string) {
    setTeam((currentTeam) => setActiveTeamDriver(currentTeam, driverId));
  }

  function handleRecoverDriverFitness(driverId: string) {
    setTeam((currentTeam) => recoverDriverFitness(currentTeam, driverId));
  }

  function handleRecoverDriverMorale(driverId: string) {
    setTeam((currentTeam) => recoverDriverMorale(currentTeam, driverId));
  }

  function handleResetWeekend() {
    const fresh = createFreshGameState();
    clearGameState();
    setWeekend(fresh.weekend);
    setSeasonState(fresh.seasonState);
    setTeam(fresh.team);
    setNowMs(Date.now());
  }

  return {
    weekend,
    seasonState,
    team,
    derivedCarStats,
    upgradesOverview,
    driverRecoveryOverview,
    isMounted,
    hasLoadedSave,
    sessionInfo,
    canAdvanceToNextWeekend,
    summary,
    handleSetTraining,
    handleSetStrategy,
    handleRunPractice,
    handleRunQualifying,
    handleRunRace,
    handleApplyPostRace,
    handleAdvanceToNextWeekend,
    handleUpgradePart,
    handleSetActiveDriver,
    handleRecoverDriverFitness,
    handleRecoverDriverMorale,
    handleResetWeekend,
  };
}