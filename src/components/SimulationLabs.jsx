import React, { useState, useEffect, useRef } from 'react';
import './SimulationLabs.css';

const SCENARIOS = [
  {
    id: 'bull',
    title: 'Bull Market',
    difficulty: 'Beginner',
    trend: 'Strong Uptrend',
    volatility: 'Moderate',
    sentiment: 'Greed / Optimism',
    liquidity: 'High',
    desc: 'Test your ability to trade during strong upward trends and maximize compounding returns.',
    challenges: ['Chasing overextended prices', 'Ignoring risk due to FOMO'],
    hints: 'Trade pullbacks in an uptrend. Confirm higher highs/lows.',
    objectives: [
      { id: 'grow_wave', text: 'Achieve 15% return in the bull wave', target: 15, current: 0 },
      { id: 'limit_loss', text: 'Keep single trade drawdown < 5%', target: 5, current: 0, failIfExceeded: true }
    ]
  },
  {
    id: 'volatility',
    title: 'High Volatility',
    difficulty: 'Advanced',
    trend: 'Rapid Swings',
    volatility: 'Very High',
    sentiment: 'Uncertain / Speculative',
    liquidity: 'Fluctuating',
    desc: 'Manage risk and execute disciplined trades while navigating extreme, rapid price fluctuations.',
    challenges: ['Sudden price spikes', 'False breakouts', 'Fast reversals'],
    hints: 'Utilize smaller position sizes, wait for confirmations, and set wider stop-loss margins.',
    objectives: [
      { id: 'trades_completed', text: 'Complete 2 successful breakout trades', target: 2, current: 0 },
      { id: 'risk_control', text: 'Keep overall risk <= 1.5%', target: 1.5, current: 0 }
    ]
  },
  {
    id: 'recession',
    title: 'Recession Fears',
    difficulty: 'Elite',
    trend: 'Bearish Downtrend',
    volatility: 'Moderate-High',
    sentiment: 'Extreme Fear',
    liquidity: 'Weakening',
    desc: 'Preserve capital and identify defensive sectors (Gold, Utilities, FMCG) during a recession-driven market.',
    challenges: ['Panic selling', 'Weak investor confidence', 'False bear market rallies'],
    hints: 'Reduce tech exposure. Reallocate to defensive consumer staples and government bonds.',
    objectives: [
      { id: 'cap_defend', text: 'Limit total risk exposure to <= 1.0%', target: 1.0, current: 0 },
      { id: 'defend_sector', text: 'Allocate > 40% to Gold and Debt', target: 40, current: 0 }
    ]
  },
  {
    id: 'crash',
    title: 'Market Crash',
    difficulty: 'Black Swan',
    trend: 'Sharp Collapse',
    volatility: 'Extreme',
    sentiment: 'Market Panic',
    liquidity: 'Unstable',
    desc: 'Survive extreme market sell-offs and panic-driven liquidations without blowing up your account.',
    challenges: ['Massive gap downs', 'Liquidations', 'Fear-driven trading spirals'],
    hints: 'Avoid trading during initial sharp waves. Identify solid recovery support zones.',
    objectives: [
      { id: 'panic_ctrl', text: 'Avoid adding positions during sell-offs', target: 1, current: 1 },
      { id: 'rebound_spot', text: 'Spot 1 recovery rebound setup', target: 1, current: 0 }
    ]
  }
];

export default function SimulationLabs({ completeQuest, addXP, addDiamonds }) {
  const [activeLab, setActiveTab] = useState('scenarios'); // 'allocator', 'scenarios'
  const [selectedScenario, setSelectedScenario] = useState(SCENARIOS[0]);
  const [isSimulating, setIsSimulating] = useState(false);

  // Allocator state
  const [equityAlloc, setEquityAlloc] = useState(60);
  const [debtAlloc, setDebtAlloc] = useState(30);
  const [goldAlloc, setGoldAlloc] = useState(10);
  const [selectedSector, setSelectedSector] = useState('Technology');

  // Simulation Running State
  const [simCapital, setSimCapital] = useState(100000);
  const [simDrawdown, setSimDrawdown] = useState(0);
  const [tickerPrice, setTickerPrice] = useState(4250.50);
  const [priceHistory, setPriceHistory] = useState([50, 52, 51, 55, 54, 58, 60, 59]);
  const [simTimer, setSimTimer] = useState(0);
  const [sharesHeld, setSharesHeld] = useState(0);
  const [simCash, setSimCash] = useState(100000);
  const [simMessage, setSimMessage] = useState('');
  const simInterval = useRef(null);

  // ------------------------------------------
  // Dynamic Allocator calculations
  // ------------------------------------------
  const handleAllocChange = (val, type) => {
    const numericVal = parseInt(val);
    if (type === 'equity') {
      const remaining = 100 - numericVal;
      setEquityAlloc(numericVal);
      // Split remaining proportionally between debt and gold
      setDebtAlloc(Math.round(remaining * 0.7));
      setGoldAlloc(Math.round(remaining * 0.3));
    } else if (type === 'debt') {
      const remaining = 100 - equityAlloc - numericVal;
      setDebtAlloc(numericVal);
      setGoldAlloc(Math.max(0, remaining));
    }
  };

  const getPortfolioScore = () => {
    // Portfolio Health Score based on balanced allocation
    let score = 100;
    // Penalize overexposure to equity (risky)
    if (equityAlloc > 75) score -= (equityAlloc - 75) * 1.5;
    // Penalize too little gold (poor hedging)
    if (goldAlloc < 5) score -= (5 - goldAlloc) * 3;
    // Sector specific adjustments
    if (selectedSector === 'Technology' && equityAlloc > 60) score -= 10; // Tech concentration risk
    return Math.max(10, Math.floor(score));
  };

  const getRiskLabel = () => {
    const score = getPortfolioScore();
    if (score > 80) return { label: 'MODERATE', color: 'var(--primary)' };
    if (score > 60) return { label: 'HIGH RISK', color: 'var(--warning)' };
    return { label: 'AGGRESSIVE', color: 'var(--error)' };
  };

  // ------------------------------------------
  // Live Simulation Engine
  // ------------------------------------------
  const startSimulation = () => {
    setIsSimulating(true);
    setSimCapital(100000);
    setSimCash(100000);
    setSharesHeld(0);
    setSimDrawdown(0);
    setSimTimer(0);
    setSimMessage('Simulation session initialized. Awaiting market order entries.');
    
    let basePrice = 4250.50;
    setTickerPrice(basePrice);
    setPriceHistory([50, 52, 51, 55, 54, 58, 60, 59]);

    simInterval.current = setInterval(() => {
      setSimTimer((prev) => {
        const nextTime = prev + 1;
        
        // Procedurally adjust the price history based on selected scenario
        setTickerPrice((prevPrice) => {
          let nextPrice = prevPrice;
          const delta = (Math.random() - 0.5) * 40;
          
          if (selectedScenario.id === 'bull') {
            // Trend upwards
            nextPrice += Math.random() * 20 + 2;
          } else if (selectedScenario.id === 'crash') {
            // Trend downwards heavily
            nextPrice -= Math.random() * 60 + 5;
          } else if (selectedScenario.id === 'recession') {
            // Slowly bleed down
            nextPrice -= Math.random() * 15 - 3;
          } else if (selectedScenario.id === 'volatility') {
            // Crazy swings
            nextPrice += (Math.random() - 0.5) * 120;
          }

          setPriceHistory((prevHist) => {
            // Map price to SVG Y-coordinates (0 to 100)
            const minHist = 3000;
            const maxHist = 6000;
            const yCoord = 90 - ((nextPrice - minHist) / (maxHist - minHist)) * 80;
            const nextHist = [...prevHist, yCoord];
            if (nextHist.length > 20) nextHist.shift();
            return nextHist;
          });

          return parseFloat(Math.max(100, nextPrice).toFixed(2));
        });

        // Trigger completing the simulation after 30 seconds
        if (nextTime >= 30) {
          endSimulation(true);
        }

        return nextTime;
      });
    }, 1000);
  };

  // Run drawdown calculations dynamically as tickerPrice and holding assets shift
  useEffect(() => {
    if (!isSimulating) return;
    const currentHoldingValue = sharesHeld * tickerPrice;
    const totalAssets = simCash + currentHoldingValue;
    setSimCapital(totalAssets);
    
    // Drawdown calculation: comparison of totalAssets relative to 100k starting capital
    const dVal = ((totalAssets - 100000) / 100000) * 100;
    setSimDrawdown(parseFloat(dVal.toFixed(2)));

    // Scenario specific checks
    if (selectedScenario.id === 'recession' && dVal < -10) {
      setSimMessage('Warning: Drawing down significantly. Check your defensive allocation!');
    }
  }, [tickerPrice, sharesHeld, simCash]);

  const handleBuyTrade = () => {
    if (simCash < tickerPrice) {
      setSimMessage('Error: Insufficient liquidity to execute buy order.');
      return;
    }
    const sharesToBuy = Math.floor(simCash / tickerPrice);
    const cost = sharesToBuy * tickerPrice;
    setSharesHeld((prev) => prev + sharesToBuy);
    setSimCash((prev) => prev - cost);
    setSimMessage(`Executed BUY order: +${sharesToBuy} units at $${tickerPrice}.`);
  };

  const handleSellTrade = () => {
    if (sharesHeld === 0) {
      setSimMessage('Error: No active shares held in portfolio to execute sell order.');
      return;
    }
    const revenue = sharesHeld * tickerPrice;
    setSharesHeld(0);
    setSimCash((prev) => prev + revenue);
    setSimMessage(`Executed SELL order: sold all units at $${tickerPrice} for $${revenue.toLocaleString()}.`);
  };

  const endSimulation = (completedSuccessfully = false) => {
    if (simInterval.current) clearInterval(simInterval.current);
    setIsSimulating(false);

    if (completedSuccessfully) {
      // Calculate final return
      const finalReturn = ((simCapital - 100000) / 100000) * 100;
      
      if (selectedScenario.id === 'bull' && finalReturn >= 15) {
        addXP(1000);
        addDiamonds(30);
        setSimMessage(`✓ Simulation Successful! Final return: +${finalReturn.toFixed(2)}% (Target >=15% met). +1000 XP rewarded!`);
      } else if (selectedScenario.id === 'crash' && finalReturn >= -5) {
        addXP(1500);
        addDiamonds(50);
        setSimMessage(`✓ Simulation Successful! capital preserved successfully. Drawdown limited. +1500 XP rewarded!`);
      } else {
        setSimMessage(`Simulation Finished. Final return: ${finalReturn.toFixed(2)}%. Objectives not met. Click RETRY to re-run.`);
      }
    }
  };

  return (
    <div className="labs-container">
      {/* Tab Selector */}
      <div className="labs-tabs glass-card">
        <button 
          className={`lab-tab-btn ${activeLab === 'scenarios' ? 'active' : ''}`}
          onClick={() => { endSimulation(); setActiveTab('scenarios'); }}
        >
          Market Scenario Labs
        </button>
        <button 
          className={`lab-tab-btn ${activeLab === 'allocator' ? 'active' : ''}`}
          onClick={() => { endSimulation(); setActiveTab('allocator'); }}
        >
          Portfolio Allocation Lab
        </button>
      </div>

      {/* 1. SCENARIOS VIEW */}
      {activeLab === 'scenarios' && !isSimulating && (
        <div className="labs-overview glass-card">
          <div className="labs-title-section">
            <span className="subtitle neon-text">TACTICAL PRACTICE</span>
            <h2 className="title">MARKET SCENARIO LABS</h2>
            <p className="desc">Practice trading through historical market environments. Learn sector rotations, crash defense, and capital preservation under extreme scenarios.</p>
          </div>

          <div className="scenarios-grid">
            {SCENARIOS.map((s) => (
              <div 
                key={s.id} 
                className={`scenario-card ${selectedScenario.id === s.id ? 'active' : ''}`}
                onClick={() => setSelectedScenario(s)}
              >
                <div className="scenario-card-header">
                  <span className="sc-difficulty neon-text">{s.difficulty}</span>
                  <span className="sc-trend">{s.trend}</span>
                </div>
                <h4 className="sc-title">{s.title}</h4>
                <p className="sc-desc">{s.desc}</p>
                <div className="sc-click-indicator"></div>
              </div>
            ))}
          </div>

          {/* Scenario Details & Run action */}
          <div className="scenario-details-panel neon-border">
            <h3 className="sd-title">SIMULATION BRIEFING: {selectedScenario.title}</h3>
            
            <div className="sd-info-grid">
              <div className="sd-info-item">
                <span className="sd-lbl">VOLATILITY</span>
                <span className="sd-val">{selectedScenario.volatility}</span>
              </div>
              <div className="sd-info-item">
                <span className="sd-lbl">MARKET SENTIMENT</span>
                <span className="sd-val">{selectedScenario.sentiment}</span>
              </div>
              <div className="sd-info-item">
                <span className="sd-lbl">LIQUIDITY LEVEL</span>
                <span className="sd-val">{selectedScenario.liquidity}</span>
              </div>
            </div>

            <div className="sd-bullets-section">
              <div className="sdb-col">
                <h5 className="sdb-title neon-text-secondary">KEY CHALLENGES</h5>
                <ul>
                  {selectedScenario.challenges.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
              <div className="sdb-col">
                <h5 className="sdb-title neon-text">TACTICAL HINTS</h5>
                <p className="sdb-desc">{selectedScenario.hints}</p>
              </div>
            </div>

            <button className="cyber-btn start-sim-btn" onClick={startSimulation}>
              RUN ACTIVE SIMULATION
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE SIMULATION INTERFACE */}
      {activeLab === 'scenarios' && isSimulating && (
        <div className="active-sim-panel glass-card">
          <div className="sim-header-row">
            <div className="sim-badge neon-text">RUNNING SCENARIO: {selectedScenario.title}</div>
            <div className="sim-timer">ELAPSED: {simTimer}s / 30s</div>
            <button className="close-quest-btn" onClick={() => endSimulation(false)}>TERMINATE</button>
          </div>

          <div className="sim-stats-grid">
            <div className="ss-item">
              <span className="ss-lbl">TOTAL ASSETS</span>
              <span className="ss-val">${simCapital.toLocaleString()}</span>
            </div>
            <div className="ss-item">
              <span className="ss-lbl">RETURN %</span>
              <span className={`ss-val ${simDrawdown >= 0 ? 'text-success' : 'text-error'}`}>
                {simDrawdown >= 0 ? '+' : ''}{simDrawdown}%
              </span>
            </div>
            <div className="ss-item">
              <span className="ss-lbl">TICKER PRICE</span>
              <span className="ss-val neon-text">${tickerPrice.toLocaleString()}</span>
            </div>
            <div className="ss-item">
              <span className="ss-lbl">SHARES HELD</span>
              <span className="ss-val">{sharesHeld} units</span>
            </div>
          </div>

          <div className="sim-body-row">
            {/* Live Chart Canvas */}
            <div className="sim-chart-container">
              <div className="scc-header">VIRTUAL SIMULATION FEED (REAL-TIME)</div>
              <div className="live-chart-canvas">
                <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none">
                  <path
                    d={priceHistory.map((p, i) => `${i === 0 ? 'M' : 'L'} ${(i / (priceHistory.length - 1)) * 200} ${p}`).join(' ')}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
            </div>

            {/* Trading buttons */}
            <div className="sim-trade-controls">
              <h5 className="stc-title">ORDER DESK</h5>
              <div className="cash-balance">LIQUID CASH: ${Math.floor(simCash).toLocaleString()}</div>
              
              <div className="stc-buttons">
                <button className="cyber-btn buy-trade-btn" onClick={handleBuyTrade}>
                  BUY MAXIMUM SHARE
                </button>
                <button className="cyber-btn sell-trade-btn cyber-btn-secondary" onClick={handleSellTrade}>
                  SELL ALL SHARES
                </button>
              </div>

              {simMessage && (
                <div className="sim-terminal-output neon-border">
                  <div className="term-line">&gt; {simMessage}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. PORTFOLIO ALLOCATOR VIEW */}
      {activeLab === 'allocator' && (
        <div className="labs-allocator glass-card">
          <div className="allocator-header">
            <span className="subtitle neon-text">ASSET ALLOCATOR</span>
            <h2 className="title">PORTFOLIO BUILDING LAB</h2>
            <p className="desc">Adjust sliders to construct your wealth asset engine. Balance high-Beta equities with bonds and gold to maximize your overall Portfolio Health Score.</p>
          </div>

          <div className="allocator-workspace">
            {/* Sliders */}
            <div className="allocator-sliders">
              <h3 className="work-title">Portfolio Allocation Ratio</h3>
              
              <div className="alloc-slider-group">
                <div className="slider-labels">
                  <span className="slider-label">EQUITY (STOCKS)</span>
                  <span className="slider-value neon-text">{equityAlloc}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={equityAlloc}
                  onChange={(e) => handleAllocChange(e.target.value, 'equity')}
                  className="cyber-slider"
                />
              </div>

              <div className="alloc-slider-group">
                <div className="slider-labels">
                  <span className="slider-label">DEBT (BONDS)</span>
                  <span className="slider-value neon-text-accent">{debtAlloc}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max={100 - equityAlloc} 
                  value={debtAlloc}
                  onChange={(e) => handleAllocChange(e.target.value, 'debt')}
                  className="cyber-slider"
                />
              </div>

              <div className="alloc-slider-group">
                <div className="slider-labels">
                  <span className="slider-label">GOLD & COMMODITIES</span>
                  <span className="slider-value neon-text-secondary">{goldAlloc}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={goldAlloc}
                  disabled
                  className="cyber-slider"
                />
              </div>

              <div className="sector-group">
                <label className="cyber-label">PRIMARY EQUITY SECTOR CONCENTRATION</label>
                <select 
                  className="cyber-select"
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                >
                  <option value="Technology">Technology (High Volatility, High Beta)</option>
                  <option value="FMCG">FMCG (Defensive, Low Beta)</option>
                  <option value="Banking">Banking (Cyclical, Moderate Beta)</option>
                  <option value="Healthcare">Healthcare (Defensive, Low Beta)</option>
                </select>
              </div>
            </div>

            {/* Health Score metrics */}
            <div className="allocator-metrics">
              <div className="health-gauge glass-card">
                <span className="hg-title">PORTFOLIO HEALTH</span>
                <div className="hg-score neon-text">{getPortfolioScore()}</div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${getPortfolioScore()}%` }}></div>
                </div>
              </div>

              <div className="metrics-side-panels">
                <div className="metric-panel">
                  <span className="mp-lbl">DIVERSIFICATION METER</span>
                  <span className="mp-val neon-text-accent">
                    {equityAlloc > 80 ? 'LOW' : equityAlloc < 40 ? 'HIGH' : 'MODERATE'}
                  </span>
                </div>

                <div className="metric-panel">
                  <span className="mp-lbl">ESTIMATED RISK LEVEL</span>
                  <span className="mp-val" style={{ color: getRiskLabel().color }}>
                    {getRiskLabel().label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
