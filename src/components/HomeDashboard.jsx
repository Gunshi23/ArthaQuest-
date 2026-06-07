import React, { useState } from 'react';
import './HomeDashboard.css';

export default function HomeDashboard({
  codename,
  level,
  portfolioValue,
  portfolioValueChange,
  riskControlScore,
  onViewChange
}) {
  const [activeTab, setActiveTab] = useState('theory');

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="welcome-banner glass-card">
        <div className="welcome-text">
          <div className="tagline neon-text">COMMAND CENTER ACTIVE</div>
          <h2 className="welcome-title">Welcome back, Operative <span className="highlight-codename">{codename || 'Alex'}</span></h2>
          <p className="welcome-sub">System synchronized. All engines reporting active. Directives set to wealth growth and risk protection.</p>
        </div>
        <div className="streak-circle-container animate-float">
          <div className="streak-circle">
            <span className="streak-num">5</span>
            <span className="streak-label">DAYS</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left Column: Active Module */}
        <div className="dashboard-column-left">
          <div className="module-card glass-card">
            <div className="card-header">
              <div className="module-tag neon-text-accent">QUANTUM VAULT // MODULE 02</div>
              <div className="progress-badge">65% DONE</div>
            </div>
            
            <h3 className="module-title">Unit 04: Correlation & Beta</h3>
            <p className="module-subtitle">Understanding the mathematical symbiosis between asset price movements and systemic market risk.</p>
            
            <div className="module-tabs">
              <button 
                className={`tab-btn ${activeTab === 'theory' ? 'active' : ''}`}
                onClick={() => setActiveTab('theory')}
              >
                Theory
              </button>
              <button 
                className={`tab-btn ${activeTab === 'beta' ? 'active' : ''}`}
                onClick={() => setActiveTab('beta')}
              >
                Beta Index
              </button>
            </div>
            
            <div className="tab-content">
              {activeTab === 'theory' ? (
                <div className="theory-text">
                  <p>In the ArthaQuest ecosystem, risk management isn't just a safety net—it's a competitive advantage. <strong>Correlation</strong> measures the degree to which two assets move in relation to each other, ranging from -1.0 to +1.0.</p>
                  <p>In the Quantum Vault, we move beyond simple linear models to analyze non-linear dependencies. High correlation during market sell-offs leads to systemic collapse if your portfolio is not properly hedged.</p>
                </div>
              ) : (
                <div className="theory-text">
                  <p>While correlation tells us direction, <strong>Beta</strong> tells us intensity. It is the measure of an asset's volatility in relation to the overall market benchmark.</p>
                  <p>A Beta of 1.0 moves exactly with the market. High-performance strategy vaults target assets with a Beta of <strong>&gt;1.5</strong> during bullish cycles for maximum Alpha extraction, while hedging with negative Beta assets during crashes.</p>
                </div>
              )}
            </div>

            <div className="pro-tip-box neon-border">
              <div className="pro-tip-header">
                <span className="tip-icon">💡</span>
                <span className="tip-title neon-text">QUANTUM PRO TIP</span>
              </div>
              <p className="tip-desc">During a high-volatility sector rotation, diversify away from Tech and utilize negative Beta assets to offset drawdowns.</p>
            </div>

            <div className="module-actions">
              <button className="cyber-btn" onClick={() => onViewChange('quests')}>
                RESUME QUEST
              </button>
              <button className="cyber-btn cyber-btn-accent locked-btn" title="Unlocked at Level 10">
                OPTIONS LAB 🔒
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Analytics & Quick Links */}
        <div className="dashboard-column-right">
          {/* Analytical Overview */}
          <div className="analytics-card glass-card">
            <h3 className="section-title neon-text">ANALYTICAL OVERVIEW</h3>
            
            <div className="metrics-list">
              <div className="metric-row">
                <div className="metric-info">
                  <span className="metric-name">PORTFOLIO GROWTH</span>
                  <span className="metric-val text-success">+{portfolioValueChange}%</span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: '82%', background: 'var(--success)' }}></div>
                </div>
              </div>

              <div className="metric-row">
                <div className="metric-info">
                  <span className="metric-name">KNOWLEDGE MASTERY</span>
                  <span className="metric-val neon-text">85%</span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: '85%' }}></div>
                </div>
              </div>

              <div className="metric-row">
                <div className="metric-info">
                  <span className="metric-name">RISK CONTROL STATUS</span>
                  <span className="metric-val neon-text-secondary">{riskControlScore}%</span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill progress-bar-fill-secondary" style={{ width: `${riskControlScore}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Challenge Banner */}
          <div className="challenge-banner-card glass-card">
            <div className="banner-glow-effect"></div>
            <div className="challenge-header">
              <span className="challenge-live-dot animate-pulse-slow"></span>
              <span className="challenge-tag neon-text-secondary">LIVE WEEKLY CHALLENGE</span>
            </div>
            <h4 className="challenge-title">The 2008 Liquidity Squeeze</h4>
            <p className="challenge-desc">Can you preserve capital during a massive -40% market drawdown under sector rotation pressures?</p>
            <button className="cyber-btn cyber-btn-secondary challenge-action-btn" onClick={() => onViewChange('missions')}>
              INITIATE DOOM SIMULATION
            </button>
          </div>

          {/* Quick Modules Selector */}
          <div className="quick-links-grid">
            <div className="quick-link-item glass-card" onClick={() => onViewChange('quests')}>
              <div className="ql-icon">⚡</div>
              <div className="ql-title">QUEST MAP</div>
              <div className="ql-desc">Beginner to Master</div>
            </div>

            <div className="quick-link-item glass-card" onClick={() => onViewChange('labs')}>
              <div className="ql-icon">🧪</div>
              <div className="ql-title">SIM LABS</div>
              <div className="ql-desc">Crash & Volatility</div>
            </div>

            <div className="quick-link-item glass-card" onClick={() => onViewChange('emm')}>
              <div className="ql-icon">🛡️</div>
              <div className="ql-title">AI FORENSICS</div>
              <div className="ql-desc">Analyze Mistakes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
