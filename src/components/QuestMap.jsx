import React, { useState, useEffect, useRef } from 'react';
import './QuestMap.css';

export default function QuestMap({
  level,
  completedQuests,
  completeQuest,
  updateGameState,
  onViewChange
}) {
  const [activeQuest, setActiveQuest] = useState(null); // null, 'beginner', 'survival', 'sip'
  
  // Beginner Quest State
  const [beginnerStep, setBeginnerStep] = useState(1); // 1: reading, 2: quiz
  const [quizAnswer, setQuizAnswer] = useState(null); // 'cash', 'gold'
  const [quizStatus, setQuizStatus] = useState(null); // 'correct', 'incorrect'

  // Market Survival State
  const [survivalTime, setSurvivalTime] = useState(0); // in seconds
  const [drawdown, setDrawdown] = useState(-5.2);
  const [assets, setAssets] = useState(50000);
  const [techAllocation, setTechAllocation] = useState(85);
  const [chartPoints, setChartPoints] = useState([50, 48, 45, 47, 43, 40, 39, 36]);
  const [isCritical, setIsCritical] = useState(false);
  const [survivalStatus, setSurvivalStatus] = useState('running'); // 'running', 'success', 'failed'
  const [survivalAction, setSurvivalAction] = useState(null);
  const survivalInterval = useRef(null);

  // SIP Machine State
  const [monthlySip, setMonthlySip] = useState(500);
  const [years, setYears] = useState(10);
  const [showCompoundingShock, setShowCompoundingShock] = useState(false);
  const [sipCompleted, setSipCompleted] = useState(false);

  // ------------------------------------------
  // Market Survival Simulation logic
  // ------------------------------------------
  useEffect(() => {
    if (activeQuest !== 'survival' || survivalStatus !== 'running') {
      if (survivalInterval.current) clearInterval(survivalInterval.current);
      return;
    }

    survivalInterval.current = setInterval(() => {
      setSurvivalTime((prevTime) => {
        const nextTime = prevTime + 1;
        
        // Procedurally decay drawdown and assets
        setDrawdown((prevDd) => {
          let nextDd = prevDd;
          
          if (survivalAction === 'DIVERSIFY') {
            // Recover!
            nextDd += Math.random() * 2.0;
            if (nextDd >= -2.0) {
              setSurvivalStatus('success');
              completeQuest('survival', 2000, 'survivor');
            }
          } else if (survivalAction === 'HEDGE') {
            // Slow down decay
            nextDd -= Math.random() * 0.4;
          } else if (survivalAction === 'LIQUIDATE') {
            // Lock loss
            setSurvivalStatus('success');
            completeQuest('survival', 1000, 'survivor'); // Half reward for panic exit
          } else {
            // HOLD or doing nothing -> standard crash path
            nextDd -= Math.random() * 1.5 + 0.3;
          }

          // Limit / trigger failure
          if (nextDd <= -25.0) {
            setSurvivalStatus('failed');
            // Save failure reports for EMM
            updateGameState('emmReport', {
              questId: 'survival',
              failedValue: 37500,
              finalLossPercent: 25.0,
              lossAmount: 12500,
              whatWentWrong: 'Concentrated 85% of capital in Tech (NVDA/TSLA) with no active stop-loss, causing total wipeout during sector rotation.',
              aiInsight: 'You reacted too late. If you had selected DIVERSIFY when drawdown breached the -10% threshold, you would have saved 80% of your capital.'
            });
          }

          // Trigger critical warning when below -15%
          if (nextDd <= -15.0) {
            setIsCritical(true);
          }

          // Update asset calculations
          setAssets(Math.floor(50000 * (1 + nextDd / 100)));
          
          // Append points to our SVG path array
          setChartPoints((prevPoints) => {
            const mappedY = 50 - nextDd * 2; // Map drawdown percentage to height coordinate (0-100)
            const newPoints = [...prevPoints, mappedY];
            if (newPoints.length > 20) newPoints.shift();
            return newPoints;
          });

          return parseFloat(nextDd.toFixed(2));
        });

        return nextTime;
      });
    }, 1000);

    return () => {
      if (survivalInterval.current) clearInterval(survivalInterval.current);
    };
  }, [activeQuest, survivalStatus, survivalAction]);

  const handleSurvivalAction = (action) => {
    setSurvivalAction(action);
    if (action === 'DIVERSIFY') {
      setTechAllocation(25);
    }
  };

  const resetSurvival = () => {
    setSurvivalTime(0);
    setDrawdown(-5.2);
    setAssets(50000);
    setTechAllocation(85);
    setChartPoints([50, 48, 45, 47, 43, 40, 39, 36]);
    setIsCritical(false);
    setSurvivalStatus('running');
    setSurvivalAction(null);
  };

  // ------------------------------------------
  // SIP Machine Math Calculations
  // ------------------------------------------
  const calculateSipWealth = (sip, yr, rate = 12) => {
    const monthlyRate = rate / 12 / 100;
    const months = yr * 12;
    const totalInvested = sip * months;
    
    // SIP Future Value formula: P * [((1 + i)^n - 1) / i] * (1 + i)
    const maturityValue = Math.floor(
      sip * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate))
    );
    
    const returns = maturityValue - totalInvested;
    const gainPercent = totalInvested > 0 ? Math.floor((returns / totalInvested) * 100) : 0;
    
    return { totalInvested, maturityValue, returns, gainPercent };
  };

  const currentSipData = calculateSipWealth(monthlySip, years);
  const shockSipData = calculateSipWealth(monthlySip, years + 2);

  const handleSipSliderChange = (e, type) => {
    const val = parseInt(e.target.value);
    if (type === 'sip') {
      setMonthlySip(val);
    } else {
      setYears(val);
      // Trigger compounding shock popup when user scrolls past 10 years
      if (val >= 12 && !showCompoundingShock) {
        setShowCompoundingShock(true);
      }
    }
  };

  const handleCompleteSip = () => {
    completeQuest('sip', 2500, 'compound_master');
    setSipCompleted(true);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // ------------------------------------------
  // Beginner Quiz Checks
  // ------------------------------------------
  const handleQuizAnswer = (answer) => {
    setQuizAnswer(answer);
    if (answer === 'cash') {
      setQuizStatus('correct');
      completeQuest('beginner', 1500, 'stock_rookie');
    } else {
      setQuizStatus('incorrect');
    }
  };

  const resetBeginner = () => {
    setBeginnerStep(1);
    setQuizAnswer(null);
    setQuizStatus(null);
  };

  return (
    <div className="quest-container">
      
      {/* 1. QUEST MAP OVERVIEW */}
      {!activeQuest && (
        <div className="quest-map-view glass-card">
          <div className="quest-map-header">
            <span className="subtitle neon-text">CHOOSE YOUR PATH</span>
            <h2 className="title">THE QUEST MAP</h2>
            <p className="desc">Embark on structured learning paths, unlock financial badges, and earn XP points by testing your operational capability.</p>
          </div>

          <div className="quest-timeline">
            <div className="timeline-line"></div>
            
            {/* Quest 1: Beginner Learning */}
            <div className={`quest-node ${completedQuests.includes('beginner') ? 'completed' : 'unlocked'}`}>
              <div className="node-number">01</div>
              <div className="node-details">
                <h4 className="node-title">Beginner Friendly Quest</h4>
                <p className="node-desc">Master the foundations of saving and the psychological mechanics of inflation.</p>
                <div className="node-meta">
                  <span className="xp-tag">+1500 XP</span>
                  <span className="badge-tag">Stock Rookie Badge</span>
                </div>
              </div>
              <button className="cyber-btn node-action-btn" onClick={() => { resetBeginner(); setActiveQuest('beginner'); }}>
                {completedQuests.includes('beginner') ? 'REPLAY PATH' : 'LAUNCH QUEST'}
              </button>
            </div>

            {/* Quest 2: Market Survival */}
            <div className={`quest-node ${completedQuests.includes('survival') ? 'completed' : 'unlocked'}`}>
              <div className="node-number">02</div>
              <div className="node-details">
                <h4 className="node-title">Market Survival Quest</h4>
                <p className="node-desc">Preserve capital in a high volatility simulator through dynamic capital reallocation.</p>
                <div className="node-meta">
                  <span className="xp-tag">+2000 XP</span>
                  <span className="badge-tag">Survivor Badge</span>
                </div>
              </div>
              <button className="cyber-btn node-action-btn" onClick={() => { resetSurvival(); setActiveQuest('survival'); }}>
                {completedQuests.includes('survival') ? 'REPLAY PATH' : 'LAUNCH QUEST'}
              </button>
            </div>

            {/* Quest 3: SIP Machine */}
            <div className={`quest-node ${completedQuests.includes('sip') ? 'completed' : 'unlocked'}`}>
              <div className="node-number">03</div>
              <div className="node-details">
                <h4 className="node-title">SIP Time Machine</h4>
                <p className="node-desc">Adjust monthly variables and time horizons to witness the visual phenomenon of Compounding Shock.</p>
                <div className="node-meta">
                  <span className="xp-tag">+2500 XP</span>
                  <span className="badge-tag">Compounding Master Badge</span>
                </div>
              </div>
              <button className="cyber-btn node-action-btn" onClick={() => { setSipCompleted(false); setShowCompoundingShock(false); setActiveQuest('sip'); }}>
                {completedQuests.includes('sip') ? 'REPLAY PATH' : 'LAUNCH QUEST'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. BEGINNER QUEST ACTIVE SCREEN */}
      {activeQuest === 'beginner' && (
        <div className="active-quest-screen glass-card">
          <div className="active-quest-header">
            <span className="quest-tag neon-text">QUEST 01 // FOUNDATIONS</span>
            <button className="close-quest-btn" onClick={() => setActiveQuest(null)}>EXIT</button>
          </div>

          {beginnerStep === 1 ? (
            <div className="quest-slide">
              <h3 className="slide-title">Level 01: The Seed</h3>
              <div className="concept-box neon-border">
                <h4 className="concept-header neon-text">CONCEPT 1: STORE OF VALUE</h4>
                <p className="concept-body">
                  Money is essentially a tool to store the value of your labor over time. If you work today and earn $10, that money should allow you to buy a similar basket of goods in 5 years.
                </p>
                <p className="concept-body">
                  However, <strong>Inflation</strong> is the slow decay of money. When central banks print cash, each dollar holds less purchasing power, which means cash behaves like a leaking bucket.
                </p>
              </div>
              <button className="cyber-btn next-slide-btn" onClick={() => setBeginnerStep(2)}>
                TAKE MINI CHALLENGE
              </button>
            </div>
          ) : (
            <div className="quest-slide">
              <h3 className="slide-title">Mini Challenge: Inflation Leakage</h3>
              <p className="slide-desc">Based on the Store of Value concept, solve the query below to initialize XP reward.</p>
              
              <div className="quiz-box">
                <div className="quiz-question">Which asset historically loses purchasing power during high inflation cycles?</div>
                <div className="quiz-options">
                  <button 
                    className={`quiz-opt-btn ${quizAnswer === 'cash' ? 'selected' : ''}`}
                    onClick={() => handleQuizAnswer('cash')}
                    disabled={quizStatus !== null}
                  >
                    CASH (Fiat Currency)
                  </button>
                  <button 
                    className={`quiz-opt-btn ${quizAnswer === 'gold' ? 'selected' : ''}`}
                    onClick={() => handleQuizAnswer('gold')}
                    disabled={quizStatus !== null}
                  >
                    GOLD (Scarcity Asset)
                  </button>
                </div>

                {quizStatus === 'correct' && (
                  <div className="quiz-feedback correct-feedback">
                    <span className="feedback-status">✓ ACCESS GRANTED</span>
                    <p>Correct! Cash constant supply growth decays purchasing power, whereas gold maintains hard scarcity. +1500 XP rewarded. "Stock Rookie" Badge Unlocked!</p>
                  </div>
                )}
                
                {quizStatus === 'incorrect' && (
                  <div className="quiz-feedback incorrect-feedback">
                    <span className="feedback-status">✗ ACCESS DENIED</span>
                    <p>Incorrect! Gold is a hard asset that maintains value, cash supply increases. Click RETRY to re-run sequence.</p>
                    <button className="cyber-btn retry-btn" onClick={() => { setQuizAnswer(null); setQuizStatus(null); }}>RETRY</button>
                  </div>
                )}
              </div>
              
              {quizStatus === 'correct' && (
                <button className="cyber-btn finish-quest-btn" onClick={() => setActiveQuest(null)}>
                  COMPLETE QUEST
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. MARKET SURVIVAL ACTIVE SCREEN */}
      {activeQuest === 'survival' && (
        <div className="active-quest-screen glass-card">
          <div className="active-quest-header">
            <span className="quest-tag neon-text-secondary">QUEST 02 // RISK MANAGEMENT</span>
            <button className="close-quest-btn" onClick={() => setActiveQuest(null)}>EXIT</button>
          </div>

          <div className="survival-dashboard">
            {/* Header info panels */}
            <div className="survival-meta-panels">
              <div className="sm-panel">
                <span className="smp-label">STATUS</span>
                <span className={`smp-value ${isCritical ? 'text-error animate-pulse-slow' : 'neon-text'}`}>
                  {isCritical ? 'CRITICAL VOLATILITY' : 'ACTIVE SIMULATION'}
                </span>
              </div>
              <div className="sm-panel">
                <span className="smp-label">PORTFOLIO VALUE</span>
                <span className="smp-value">${assets.toLocaleString()}</span>
              </div>
              <div className="sm-panel">
                <span className="smp-label">LIVE DRAWDOWN</span>
                <span className={`smp-value ${isCritical ? 'text-error' : 'neon-text-secondary'}`}>{drawdown}%</span>
              </div>
              <div className="sm-panel">
                <span className="smp-label">THRESHOLD</span>
                <span className="smp-value text-error">-25.0% LIMIT</span>
              </div>
            </div>

            {/* Left: Simulation Canvas (Ticking Chart) */}
            <div className="survival-body">
              <div className="survival-chart-section">
                <div className="chart-title-bar">
                  <span>MARKET SURVIVAL INDEX CHART</span>
                  <span className="timer-badge">TIME: {survivalTime}s</span>
                </div>
                
                {/* SVG Live Line Drawing */}
                <div className="live-chart-container">
                  <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(239, 68, 68, 0.2)" />
                        <stop offset="100%" stopColor="rgba(2, 6, 23, 0)" />
                      </linearGradient>
                    </defs>
                    
                    {/* Fill */}
                    <path
                      d={`M 0 100 ${chartPoints.map((p, i) => `L ${(i / (chartPoints.length - 1)) * 200} ${p}`).join(' ')} L 200 100 Z`}
                      fill="url(#chart-grad)"
                    />
                    
                    {/* Line */}
                    <path
                      d={chartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${(i / (chartPoints.length - 1)) * 200} ${p}`).join(' ')}
                      fill="none"
                      stroke={isCritical ? "#ef4444" : "#ec4899"}
                      strokeWidth="2"
                    />

                    {/* Critical threshold line at -25% (mapped to y = 100) */}
                    <line x1="0" y1="99" x2="200" y2="99" stroke="rgba(239, 68, 68, 0.3)" strokeWidth="1" strokeDasharray="3 3" />
                  </svg>
                </div>
              </div>

              {/* Right: Allocation & Action controllers */}
              <div className="survival-controls">
                <div className="allocation-status">
                  <div className="as-header">
                    <span>TECHNOLOGY EXPOSURE</span>
                    <span className={techAllocation > 50 ? 'text-error font-bold' : 'text-success'}>
                      {techAllocation}% {techAllocation > 50 ? 'CRITICAL' : 'SECURED'}
                    </span>
                  </div>
                  <div className="progress-bar-container">
                    <div 
                      className={`progress-bar-fill ${techAllocation > 50 ? 'progress-bar-fill-secondary' : ''}`}
                      style={{ 
                        width: `${techAllocation}%`,
                        background: techAllocation > 50 ? 'var(--error)' : 'var(--success)'
                      }}
                    ></div>
                  </div>
                  <p className="as-desc">82% of assets are concentrated in high-Beta tech equities (NVDA, TSLA). Sector rotation has initialized a downward spiral.</p>
                </div>

                {survivalStatus === 'running' && (
                  <div className="action-grid">
                    <button 
                      className="cyber-btn q-action-btn"
                      onClick={() => handleSurvivalAction('DIVERSIFY')}
                      disabled={survivalAction !== null}
                    >
                      DIVERSIFY ASSETS
                    </button>
                    <button 
                      className="cyber-btn q-action-btn cyber-btn-secondary"
                      onClick={() => handleSurvivalAction('LIQUIDATE')}
                      disabled={survivalAction !== null}
                    >
                      LIQUIDATE PORTFOLIO
                    </button>
                    <button 
                      className="cyber-btn q-action-btn cyber-btn-accent"
                      onClick={() => handleSurvivalAction('HEDGE')}
                      disabled={survivalAction !== null}
                    >
                      BUY PUT HEDGES
                    </button>
                    <button 
                      className="cyber-btn q-action-btn locked-btn"
                      onClick={() => handleSurvivalAction('HOLD')}
                      disabled={survivalAction !== null}
                    >
                      HOLD POSITION
                    </button>
                  </div>
                )}

                {/* Success Feedback */}
                {survivalStatus === 'success' && (
                  <div className="simulation-end success-end">
                    <h4 className="end-title neon-text">✓ MISSION COMPLETED</h4>
                    <p className="end-desc">
                      {survivalAction === 'DIVERSIFY' 
                        ? 'Excellent decision! Capital was successfully shifted to low-correlation assets (Gold and Bonds), stabilizing the drawdown. +2000 XP rewarded. "Survivor" Badge unlocked!'
                        : 'Portfolio liquidated. You successfully locked in losses, preventing total capital wipeout, though you missed the recovery cycle. +1000 XP rewarded.'}
                    </p>
                    <button className="cyber-btn return-btn" onClick={() => setActiveQuest(null)}>RETURN TO MAP</button>
                  </div>
                )}

                {/* Failure Feedback */}
                {survivalStatus === 'failed' && (
                  <div className="simulation-end failed-end">
                    <h4 className="end-title text-error">✗ SIMULATION TERMINATED</h4>
                    <p className="end-desc">Drawdown breached the -25.0% risk limit. Total capital wipeout sequence initialized. Level Failed.</p>
                    <div className="end-actions">
                      <button className="cyber-btn cyber-btn-secondary" onClick={resetSurvival}>RETRY SEQUENCE</button>
                      <button className="cyber-btn" onClick={() => onViewChange('emm')}>ANALYZE MISTAKE (EMM)</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. SIP MACHINE ACTIVE SCREEN */}
      {activeQuest === 'sip' && (
        <div className="active-quest-screen glass-card">
          <div className="active-quest-header">
            <span className="quest-tag neon-text-accent">QUEST 03 // SIP TIME MACHINE</span>
            <button className="close-quest-btn" onClick={() => setActiveQuest(null)}>EXIT</button>
          </div>

          <div className="sip-layout">
            {/* Left: Inputs & Sliders */}
            <div className="sip-inputs">
              <h3 className="sip-title">Configure Wealth Engine</h3>
              <p className="sip-desc">Drag sliders to adjust monthly deposit and time horizon variables to see compounding growth scale.</p>
              
              <div className="slider-group">
                <div className="slider-labels">
                  <span className="slider-label">MONTHLY SIP</span>
                  <span className="slider-value neon-text">{formatCurrency(monthlySip)}</span>
                </div>
                <input 
                  type="range" 
                  min="500" 
                  max="50000" 
                  step="500" 
                  value={monthlySip}
                  onChange={(e) => handleSipSliderChange(e, 'sip')}
                  className="cyber-slider"
                  disabled={sipCompleted}
                />
              </div>

              <div className="slider-group">
                <div className="slider-labels">
                  <span className="slider-label">TIME HORIZON</span>
                  <span className="slider-value neon-text-accent">{years} YEARS</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="30" 
                  step="1" 
                  value={years}
                  onChange={(e) => handleSipSliderChange(e, 'years')}
                  className="cyber-slider"
                  disabled={sipCompleted}
                />
              </div>

              <div className="compounding-results">
                <div className="res-row">
                  <span className="res-lbl">Total Invested</span>
                  <span className="res-val">{formatCurrency(currentSipData.totalInvested)}</span>
                </div>
                <div className="res-row">
                  <span className="res-lbl">Maturity Value</span>
                  <span className="res-val neon-text">{formatCurrency(currentSipData.maturityValue)}</span>
                </div>
                <div className="res-row">
                  <span className="res-lbl">Compounding Gains</span>
                  <span className="res-val text-success">+{currentSipData.gainPercent}%</span>
                </div>
              </div>

              {!sipCompleted ? (
                <button className="cyber-btn complete-sip-btn" onClick={handleCompleteSip}>
                  SYNC MATURITY & COMPLETE
                </button>
              ) : (
                <div className="sip-success-banner">
                  <span className="neon-text">✓ COMPILED SUCCESS</span>
                  <p>SIP future values synced. +2500 XP rewarded. "Compounding Master" Badge unlocked in operative logs!</p>
                  <button className="cyber-btn" onClick={() => setActiveQuest(null)}>RETURN TO MAP</button>
                </div>
              )}
            </div>

            {/* Right: Shock & Math Explanation */}
            <div className="sip-visualization">
              {showCompoundingShock && (
                <div className="compounding-shock-card glass-card animate-float neon-border-secondary">
                  <div className="shock-header">
                    <span className="shock-icon">⚡</span>
                    <span className="shock-tag neon-text-secondary">COMPOUNDING SHOCK TRIGGERED</span>
                  </div>
                  <h4 className="shock-title">The Cost of 2 Extra Years</h4>
                  <p className="shock-body">
                    By extending your horizon by just <strong>2 extra years</strong> (from {years} to {years + 2} years), your wealth spikes from:
                  </p>
                  
                  <div className="shock-comparison">
                    <div className="sc-box">
                      <span className="sc-lbl">{years} Years</span>
                      <span className="sc-val">{formatCurrency(currentSipData.maturityValue)}</span>
                    </div>
                    <div className="sc-arrow">➜</div>
                    <div className="sc-box active">
                      <span className="sc-lbl">{years + 2} Years</span>
                      <span className="sc-val neon-text-secondary">{formatCurrency(shockSipData.maturityValue)}</span>
                    </div>
                  </div>

                  <p className="shock-footer">
                    Notice that you only invested {formatCurrency(monthlySip * 24)} more, but your returns increased by <strong>{formatCurrency(shockSipData.maturityValue - currentSipData.maturityValue - (monthlySip * 24))}</strong>! This exponential scaling at the tail end is what we call Compounding Shock.
                  </p>
                  <button className="cyber-btn cyber-btn-secondary close-shock-btn" onClick={() => setShowCompoundingShock(false)}>
                    ACKNOWLEDGE MATRIX
                  </button>
                </div>
              )}

              {!showCompoundingShock && (
                <div className="sip-placeholder-viz glass-card">
                  <div className="curve-header">VISUALIZING MATHEMATICAL WEALTH CURVE</div>
                  <div className="wealth-bar-chart">
                    <div className="wbar invested-bar" style={{ height: '35%' }}>
                      <span className="wb-lbl">Invested</span>
                    </div>
                    <div className="wbar returns-bar animate-pulse-slow" style={{ height: `${Math.min(95, 35 + currentSipData.gainPercent / 6)}%` }}>
                      <span className="wb-lbl font-bold">Returns</span>
                    </div>
                  </div>
                  <p className="viz-footnote">Compounding growth is slow initially, but slopes upwards rapidly. Increase years to scale curves.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
