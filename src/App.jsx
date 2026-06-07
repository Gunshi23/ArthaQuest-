import React from 'react';
import { useGameState } from './hooks/useGameState';
import ParticleBackground from './components/ParticleBackground';
import Onboarding from './components/Onboarding';
import Navbar from './components/Navbar';
import HomeDashboard from './components/HomeDashboard';
import QuestMap from './components/QuestMap';
import SimulationLabs from './components/SimulationLabs';
import Missions from './components/Missions';
import EMMPortal from './components/EMMPortal';
import ProgressProfile from './components/ProgressProfile';

function App() {
  const {
    codename,
    avatar,
    persona,
    level,
    xp,
    diamonds,
    streak,
    objectives,
    completedQuests,
    completedMissions,
    unlockedBadges,
    activeView,
    portfolioValue,
    portfolioValueChange,
    riskControlScore,
    decisionAccuracy,
    onboarded,
    emmReport,
    updateGameState,
    updateMultipleStates,
    addXP,
    addDiamonds,
    unlockBadge,
    completeQuest,
    completeMission,
    resetGame
  } = useGameState();

  const handleViewChange = (view) => {
    updateGameState('activeView', view);
  };

  const handleOnboardingComplete = (data) => {
    updateMultipleStates(data);
  };

  // Render content based on activeView
  const renderContent = () => {
    switch (activeView) {
      case 'home':
        return (
          <HomeDashboard
            codename={codename}
            level={level}
            portfolioValue={portfolioValue}
            portfolioValueChange={portfolioValueChange}
            riskControlScore={riskControlScore}
            onViewChange={handleViewChange}
          />
        );
      case 'quests':
        return (
          <QuestMap
            level={level}
            completedQuests={completedQuests}
            completeQuest={completeQuest}
            updateGameState={updateGameState}
            onViewChange={handleViewChange}
          />
        );
      case 'labs':
        return (
          <SimulationLabs
            completeQuest={completeQuest}
            addXP={addXP}
            addDiamonds={addDiamonds}
          />
        );
      case 'missions':
        return (
          <Missions
            completedMissions={completedMissions}
            completeMission={completeMission}
            addXP={addXP}
            addDiamonds={addDiamonds}
          />
        );
      case 'emm':
        return (
          <EMMPortal
            emmReport={emmReport}
            onViewChange={handleViewChange}
          />
        );
      case 'progress':
        return (
          <ProgressProfile
            codename={codename}
            avatar={avatar}
            level={level}
            xp={xp}
            unlockedBadges={unlockedBadges}
            riskControlScore={riskControlScore}
            completedQuests={completedQuests}
            completedMissions={completedMissions}
          />
        );
      default:
        return (
          <HomeDashboard
            codename={codename}
            level={level}
            portfolioValue={portfolioValue}
            portfolioValueChange={portfolioValueChange}
            riskControlScore={riskControlScore}
            onViewChange={handleViewChange}
          />
        );
    }
  };

  return (
    <>
      <ParticleBackground />
      {!onboarded ? (
        <Onboarding onComplete={handleOnboardingComplete} />
      ) : (
        <div className="app-layout">
          <Navbar
            codename={codename}
            avatar={avatar}
            level={level}
            xp={xp}
            diamonds={diamonds}
            streak={streak}
            activeView={activeView}
            onViewChange={handleViewChange}
            onReset={resetGame}
          />
          <main className="main-content">
            {renderContent()}
          </main>
        </div>
      )}
    </>
  );
}

export default App;
