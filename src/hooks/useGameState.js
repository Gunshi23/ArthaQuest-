import { useState, useEffect } from 'react';

const DEFAULT_STATE = {
  codename: '',
  avatar: 'cyber_operative_01',
  persona: '',
  level: 1,
  xp: 0,
  diamonds: 120,
  streak: 5,
  objectives: [],
  completedQuests: [],
  completedMissions: [],
  unlockedBadges: [],
  activeView: 'cover',
  portfolioValue: 50000,
  portfolioValueChange: 12.4,
  riskControlScore: 72,
  decisionAccuracy: {
    prediction: 78,
    entry: 65,
    exit: 42,
    riskMgmt: 75
  },
  onboarded: false,
  emmReport: null // Storing the last EMM failed trade breakdown
};

export function useGameState() {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem('arthaquest_state');
      if (saved) {
        return { ...DEFAULT_STATE, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Error reading game state', e);
    }
    return DEFAULT_STATE;
  });

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('arthaquest_state', JSON.stringify(state));
    } catch (e) {
      console.error('Error writing game state', e);
    }
  }, [state]);

  const updateGameState = (key, value) => {
    setState((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const updateMultipleStates = (updates) => {
    setState((prev) => ({
      ...prev,
      ...updates
    }));
  };

  // XP progression system: next level requires level * 1500 XP
  const addXP = (amount) => {
    setState((prev) => {
      let newXP = prev.xp + amount;
      let newLevel = prev.level;
      let xpNeeded = newLevel * 1500;
      let leveledUp = false;

      while (newXP >= xpNeeded) {
        newXP -= xpNeeded;
        newLevel += 1;
        xpNeeded = newLevel * 1500;
        leveledUp = true;
      }

      return {
        ...prev,
        xp: newXP,
        level: newLevel,
        // Trigger alert or state update if leveledUp is needed
      };
    });
  };

  const addDiamonds = (amount) => {
    setState((prev) => ({
      ...prev,
      diamonds: prev.diamonds + amount
    }));
  };

  const unlockBadge = (badgeId) => {
    setState((prev) => {
      if (prev.unlockedBadges.includes(badgeId)) return prev;
      return {
        ...prev,
        unlockedBadges: [...prev.unlockedBadges, badgeId]
      };
    });
  };

  const completeQuest = (questId, xpReward = 1000, badgeId = null) => {
    setState((prev) => {
      const quests = prev.completedQuests.includes(questId)
        ? prev.completedQuests
        : [...prev.completedQuests, questId];
      
      let badges = prev.unlockedBadges;
      if (badgeId && !badges.includes(badgeId)) {
        badges = [...badges, badgeId];
      }

      // Calculate XP addition locally in the state updater
      let newXP = prev.xp + xpReward;
      let newLevel = prev.level;
      let xpNeeded = newLevel * 1500;
      
      while (newXP >= xpNeeded) {
        newXP -= xpNeeded;
        newLevel += 1;
        xpNeeded = newLevel * 1500;
      }

      return {
        ...prev,
        completedQuests: quests,
        unlockedBadges: badges,
        xp: newXP,
        level: newLevel
      };
    });
  };

  const completeMission = (missionId, xpReward = 500) => {
    setState((prev) => {
      const missions = prev.completedMissions.includes(missionId)
        ? prev.completedMissions
        : [...prev.completedMissions, missionId];

      let newXP = prev.xp + xpReward;
      let newLevel = prev.level;
      let xpNeeded = newLevel * 1500;
      
      while (newXP >= xpNeeded) {
        newXP -= xpNeeded;
        newLevel += 1;
        xpNeeded = newLevel * 1500;
      }

      return {
        ...prev,
        completedMissions: missions,
        xp: newXP,
        level: newLevel
      };
    });
  };

  const resetGame = () => {
    setState(DEFAULT_STATE);
    localStorage.removeItem('arthaquest_state');
  };

  return {
    ...state,
    updateGameState,
    updateMultipleStates,
    addXP,
    addDiamonds,
    unlockBadge,
    completeQuest,
    completeMission,
    resetGame
  };
}
