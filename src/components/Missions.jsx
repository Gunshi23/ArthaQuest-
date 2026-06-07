import React, { useState, useEffect } from 'react';
import './Missions.css';

const HEATMAP_DATA = {
  assets: ['BTC', 'SPY', 'GLD', 'TSLA', 'BND'],
  matrix: [
    [1.0, 0.4, -0.2, 0.6, -0.4],  // BTC correlation with [BTC, SPY, GLD, TSLA, BND]
    [0.4, 1.0, 0.1, 0.7, -0.1],   // SPY correlation
    [-0.2, 0.1, 1.0, -0.1, 0.3],  // GLD correlation
    [0.6, 0.7, -0.1, 1.0, -0.3],  // TSLA correlation
    [-0.4, -0.1, 0.3, -0.3, 1.0]  // BND correlation
  ]
};

export default function Missions({ completedMissions, completeMission, addXP, addDiamonds }) {
  const [activeMission, setActiveMission] = useState(null); // null, 'first_trade', 'diversification', 'weekly'
  const [missionStatus, setMissionStatus] = useState('idle'); // 'idle', 'success', 'failed'

  // First Trade Mission State
  const [stopLoss, setStopLoss] = useState(2300);
  const [targetPrice, setTargetPrice] = useState(2700);
  const [tradeAsset, setTradeAsset] = useState('SC-4029'); // SC-4029, NL-8833

  // Diversification Mission State
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [divScore, setDivScore] = useState(0);

  // Weekly Mission State
  const [newsFeed, setNewsFeed] = useState([
    'FED INTEREST RATE DECISION PENDING...',
    'TECH SECTOR SHOWS UNEXPECTED VOLATILITY...',
    'CRYPTO WHALES MOVE $400M TO COLD STORAGE...',
    'OIL PRICES STABILIZE AT $78.40...'
  ]);
  const [activeSector, setActiveSector] = useState(null);
  const [newsIndex, setNewsIndex] = useState(0);

  // ------------------------------------------
  // Diversification math
  // ------------------------------------------
  const handleToggleAsset = (asset) => {
    setSelectedAssets((prev) => {
      const isSelected = prev.includes(asset);
      const next = isSelected ? prev.filter((a) => a !== asset) : [...prev, asset];
      
      // Calculate correlation score
      if (next.length >= 2) {
        let totalCorrelation = 0;
        let pairsCount = 0;

        for (let i = 0; i < next.length; i++) {
          for (let j = i + 1; j < next.length; j++) {
            const idx1 = HEATMAP_DATA.assets.indexOf(next[i]);
            const idx2 = HEATMAP_DATA.assets.indexOf(next[j]);
            totalCorrelation += Math.abs(HEATMAP_DATA.matrix[idx1][idx2]);
            pairsCount++;
          }
        }

        const avgCorr = totalCorrelation / pairsCount;
        // Low correlation gives higher score: Score = (1 - avgCorr) * 100
        const calculatedScore = Math.floor((1 - avgCorr) * 100);
        setDivScore(calculatedScore);
      } else {
        setDivScore(0);
      }

      return next;
    });
  };

  const handleVerifyDiversification = () => {
    if (selectedAssets.length < 4) {
      alert('Error: You must select at least 4 asset classes to complete this mission.');
      return;
    }

    if (divScore >= 80) {
      setMissionStatus('success');
      completeMission('diversification', 1200);
      addDiamonds(25);
    } else {
      setMissionStatus('failed');
    }
  };

  // ------------------------------------------
  // First Trade validation
  // ------------------------------------------
  const handleExecuteFirstTrade = () => {
    // Current price is roughly $2,441.20
    // Stop loss should be below entry (e.g. between 2100 and 2400)
    // Target should be above entry (e.g. between 2500 and 3000)
    if (stopLoss >= 2441.20 || stopLoss < 2000) {
      alert('Invalid Stop-Loss: Needs to be below market price ($2,441.20) and protect capital.');
      return;
    }
    if (targetPrice <= 2441.20 || targetPrice > 3500) {
      alert('Invalid Target: Needs to be above entry price ($2,441.20) to capture positive reward ratio.');
      return;
    }

    setMissionStatus('success');
    completeMission('first_trade', 500);
    addDiamonds(10);
  };

  // ------------------------------------------
  // Weekly Mission logic
  // ------------------------------------------
  useEffect(() => {
    if (activeMission !== 'weekly') return;

    const t = setInterval(() => {
      setNewsIndex((prev) => (prev + 1) % newsFeed.length);
    }, 4000);

    return () => clearInterval(t);
  }, [activeMission]);

  const handleWeeklyShift = (action) => {
    if (action === 'HEDGE') {
      setMissionStatus('success');
      completeMission('weekly', 750);
      addDiamonds(15);
    } else {
      setMissionStatus('failed');
    }
  };

  return (
    <div className="missions-container">
      
      {/* 1. MISSION LIST TABLE */}
      {!activeMission && (
        <div className="missions-hub glass-card">
          <div className="missions-header">
            <span className="subtitle neon-text-secondary">TACTICAL TRAINING</span>
            <h2 className="title">MISSIONS DESK</h2>
            <p className="desc">Complete rapid tactical operations to earn XP points, diamonds, and qualify for higher leagues.</p>
          </div>

          <div className="missions-stack">
            {/* First Trade Mission */}
            <div className={`mission-card ${completedMissions.includes('first_trade') ? 'completed' : ''}`}>
              <div className="mc-left">
                <span className="difficulty-badge low">DIFF: 1</span>
                <h4 className="mc-title">First Trade Mission</h4>
                <p className="mc-desc">Execute your first strategic entry. Setup correct stop-loss and target thresholds to establish a defined risk ratio.</p>
              </div>
              <div className="mc-right">
                <div className="reward-glow">+500 XP</div>
                <button className="cyber-btn" onClick={() => { setMissionStatus('idle'); setActiveMission('first_trade'); }}>
                  {completedMissions.includes('first_trade') ? 'REPLAY' : 'INITIATE'}
                </button>
              </div>
            </div>

            {/* Diversification Mission */}
            <div className={`mission-card ${completedMissions.includes('diversification') ? 'completed' : ''}`}>
              <div className="mc-left">
                <span className="difficulty-badge moderate">DIFF: 2</span>
                <h4 className="mc-title">Diversification Mission</h4>
                <p className="mc-desc">Use a correlation heatmap matrix to build a 4-asset portfolio and keep the diversification score above 80%.</p>
              </div>
              <div className="mc-right">
                <div className="reward-glow">+1200 XP</div>
                <button className="cyber-btn" onClick={() => { setMissionStatus('idle'); setSelectedAssets([]); setDivScore(0); setActiveMission('diversification'); }}>
                  {completedMissions.includes('diversification') ? 'REPLAY' : 'INITIATE'}
                </button>
              </div>
            </div>

            {/* Weekly Market Mission */}
            <div className={`mission-card ${completedMissions.includes('weekly') ? 'completed' : ''}`}>
              <div className="mc-left">
                <span className="difficulty-badge high">DIFF: 3</span>
                <h4 className="mc-title">Weekly Market Challenge</h4>
                <p className="mc-desc">Analyze live sector index movements and implement hedging or liquidations in response to high volatility events.</p>
              </div>
              <div className="mc-right">
                <div className="reward-glow">+750 XP</div>
                <button className="cyber-btn" onClick={() => { setMissionStatus('idle'); setActiveMission('weekly'); }}>
                  {completedMissions.includes('weekly') ? 'REPLAY' : 'INITIATE'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ACTIVE MISSION: FIRST TRADE */}
      {activeMission === 'first_trade' && (
        <div className="active-mission-panel glass-card">
          <div className="amp-header">
            <span className="amp-tag neon-text">TACTICAL INSTRUCTION // FIRST TRADE</span>
            <button className="close-quest-btn" onClick={() => setActiveMission(null)}>EXIT</button>
          </div>

          <div className="mission-split">
            {/* Left: Signal feed */}
            <div className="signal-desk">
              <h3 className="signal-title">Emerging Sector Signal</h3>
              
              <div className="asset-ticker-box glass-card">
                <div className="atb-header">
                  <span className="atb-name neon-text">SOLAR-CREDIT (SC-4029)</span>
                  <span className="atb-trend text-success">+2.45%</span>
                </div>
                <div className="atb-price">$2,441.20</div>
                <div className="atb-status neon-text-accent">STRONG BUY SIGNAL</div>
                <p className="atb-footnote">A sudden supply crunch in solar cells has triggered buying momentum. Price action projects an immediate breakout.</p>
              </div>
            </div>

            {/* Right: Inputs */}
            <div className="trade-setup-desk">
              <h4 className="tsd-title">Set Risk parameters</h4>
              <p className="tsd-desc">Configure your automated exit protocols (Stop-Loss and Target) to execute the trade.</p>

              {missionStatus === 'idle' ? (
                <div className="tsd-form">
                  <div className="form-group">
                    <label className="cyber-label">STOP-LOSS EXIT PRICE ($)</label>
                    <input 
                      type="number" 
                      className="cyber-input"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(parseInt(e.target.value))}
                    />
                    <small className="help-text">Protects capital if trade fails. Must be below entry ($2,441.20).</small>
                  </div>

                  <div className="form-group">
                    <label className="cyber-label">TARGET TAKE-PROFIT PRICE ($)</label>
                    <input 
                      type="number" 
                      className="cyber-input"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(parseInt(e.target.value))}
                    />
                    <small className="help-text">Exits trade automatically in profit. Must be above entry ($2,441.20).</small>
                  </div>

                  <button className="cyber-btn execute-trade-btn" onClick={handleExecuteFirstTrade}>
                    INITIATE FIRST EXCHANGE
                  </button>
                </div>
              ) : (
                <div className="tsd-feedback success-feedback">
                  <h5 className="feedback-status text-success">✓ TRADE COMPLETED</h5>
                  <p>Order executed successfully! Stop-loss registered at ${stopLoss} and target at ${targetPrice}. Your capital is protected. +500 XP rewarded. +10 Diamonds synced!</p>
                  <button className="cyber-btn" onClick={() => setActiveMission(null)}>RETURN TO DESK</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. ACTIVE MISSION: DIVERSIFICATION */}
      {activeMission === 'diversification' && (
        <div className="active-mission-panel glass-card">
          <div className="amp-header">
            <span className="amp-tag neon-text-accent">TACTICAL INSTRUCTION // DIVERSIFICATION</span>
            <button className="close-quest-btn" onClick={() => setActiveMission(null)}>EXIT</button>
          </div>

          <div className="mission-split">
            {/* Left: Heatmap Grid */}
            <div className="heatmap-section">
              <h3 className="heatmap-title">Correlation Heatmap Matrix</h3>
              <p className="heatmap-desc">Correlation index ranges from -1.0 (opposite movement) to +1.0 (identical movement). Select assets with low/negative correlations.</p>
              
              <div className="heatmap-grid-container">
                <div className="heatmap-header-row">
                  <div className="hm-label-cell"></div>
                  {HEATMAP_DATA.assets.map((a) => <div key={a} className="hm-label-cell">{a}</div>)}
                </div>
                
                {HEATMAP_DATA.assets.map((rowAsset, rowIdx) => (
                  <div key={rowAsset} className="heatmap-row">
                    <div className="hm-label-cell font-bold">{rowAsset}</div>
                    {HEATMAP_DATA.assets.map((colAsset, colIdx) => {
                      const val = HEATMAP_DATA.matrix[rowIdx][colIdx];
                      let bg = 'rgba(239, 68, 68, 0.4)'; // high positive correlation
                      if (val <= 0.0) bg = 'rgba(16, 185, 129, 0.3)'; // negative correlation
                      else if (val <= 0.4) bg = 'rgba(0, 255, 255, 0.2)'; // low correlation
                      
                      return (
                        <div 
                          key={colAsset} 
                          className="hm-val-cell"
                          style={{ backgroundColor: bg }}
                          title={`Correlation between ${rowAsset} and ${colAsset} is ${val}`}
                        >
                          {val}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Asset selection */}
            <div className="alloc-desk">
              <h4 className="ad-title">Select operative assets</h4>
              <p className="ad-desc">Select exactly 4 assets. Keep the average correlation low to score above 80%.</p>

              {missionStatus === 'idle' && (
                <div className="ad-form">
                  <div className="asset-checkboxes-grid">
                    {HEATMAP_DATA.assets.map((a) => {
                      const active = selectedAssets.includes(a);
                      return (
                        <div 
                          key={a} 
                          className={`asset-check-card ${active ? 'active' : ''}`}
                          onClick={() => handleToggleAsset(a)}
                        >
                          <div className="checkbox-dot"></div>
                          <span className="acc-name">{a}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="div-score-panel glass-card">
                    <span className="dsp-lbl">DIVERSIFICATION SCORE</span>
                    <span className="dsp-val neon-text">{divScore}%</span>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${divScore}%` }}></div>
                    </div>
                  </div>

                  <button className="cyber-btn verify-div-btn" onClick={handleVerifyDiversification}>
                    VERIFY PORTFOLIO SHIELD
                  </button>
                </div>
              )}

              {missionStatus === 'success' && (
                <div className="ad-feedback success-feedback">
                  <h5 className="feedback-status text-success">✓ PORTFOLIO DIVERSIFIED</h5>
                  <p>Success! Your diversification score is {divScore}%. By combining low-correlation assets like GLD and BND with volatile equities, you protected the vault. +1200 XP rewarded. +25 Diamonds synced!</p>
                  <button className="cyber-btn" onClick={() => setActiveMission(null)}>RETURN TO DESK</button>
                </div>
              )}

              {missionStatus === 'failed' && (
                <div className="ad-feedback failed-feedback">
                  <h5 className="feedback-status text-error">✗ SCORE CRITICAL</h5>
                  <p>Diversification score ({divScore}%) is below the 80% threshold. You selected high-correlation pairings (like BTC + TSLA + SPY), increasing systemic risk.</p>
                  <button className="cyber-btn retry-btn" onClick={() => { setSelectedAssets([]); setDivScore(0); setMissionStatus('idle'); }}>RETRY</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. ACTIVE MISSION: WEEKLY CHALLENGE */}
      {activeMission === 'weekly' && (
        <div className="active-mission-panel glass-card">
          <div className="amp-header">
            <span className="amp-tag neon-text-secondary">TACTICAL INSTRUCTION // WEEKLY CHALLENGE</span>
            <button className="close-quest-btn" onClick={() => setActiveMission(null)}>EXIT</button>
          </div>

          <div className="weekly-layout">
            {/* Live Tickers & News */}
            <div className="weekly-feed">
              <div className="terminal-header neon-text">LIVE WIRE NEWS DECK</div>
              <div className="news-ticker-panel glass-card">
                <div className="ticker-line neon-text-secondary">&gt;&gt; {newsFeed[newsIndex]}</div>
              </div>

              {/* Sector heatmap returns */}
              <div className="sector-heatmap">
                <div className="sh-title">SECTOR INDEX PERFORMANCES (24H)</div>
                <div className="sh-grid">
                  <div className="sh-item positive">TECH <span className="sh-val">+4.2%</span></div>
                  <div className="sh-item positive">FINANCIALS <span className="sh-val">+1.5%</span></div>
                  <div className="sh-item neutral">ENERGY <span className="sh-val">0.0%</span></div>
                  <div className="sh-item negative">REAL ESTATE <span className="sh-val">-2.1%</span></div>
                  <div className="sh-item positive">HEALTH <span className="sh-val">+2.8%</span></div>
                  <div className="sh-item negative">MATERIALS <span className="sh-val">-3.4%</span></div>
                </div>
              </div>
            </div>

            {/* Decision desk */}
            <div className="weekly-decision">
              <h4 className="wd-title">Operational Directive</h4>
              <p className="wd-desc">A surprise interest rate decision pending from the Fed is creating uncertainty. High-Beta sectors like Technology are spiking, but defensive rotations are starting. Choose your action.</p>

              {missionStatus === 'idle' && (
                <div className="wd-action-grid">
                  <button className="cyber-btn" onClick={() => handleWeeklyShift('DIVERSIFY')}>
                    REALLOCATE TO DEFENSIVE SECTORS
                  </button>
                  <button className="cyber-btn cyber-btn-secondary" onClick={() => handleWeeklyShift('HEDGE')}>
                    BUY PUT OPTION HEDGES ON INDEX
                  </button>
                  <button className="cyber-btn cyber-btn-accent" onClick={() => handleWeeklyShift('LIQUIDATE')}>
                    LIQUIDATE ALL ACTIVE EQUITIES
                  </button>
                </div>
              )}

              {missionStatus === 'success' && (
                <div className="wd-feedback success-feedback">
                  <h5 className="feedback-status text-success">✓ CAPITAL SECURED</h5>
                  <p>Success! By buying put option hedges, you offset potential rate hike crashes while keeping upside gains in Tech active. +750 XP rewarded. +15 Diamonds synced!</p>
                  <button className="cyber-btn" onClick={() => setActiveMission(null)}>RETURN TO DESK</button>
                </div>
              )}

              {missionStatus === 'failed' && (
                <div className="wd-feedback failed-feedback">
                  <h5 className="feedback-status text-error">✗ OPERATIONAL FAILURE</h5>
                  <p>Action failed. The sector allocation chosen did not shield against the rate shock. Re-run sequence.</p>
                  <button className="cyber-btn retry-btn" onClick={() => setMissionStatus('idle')}>RETRY</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
