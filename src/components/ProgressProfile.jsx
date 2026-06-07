import React, { useState } from 'react';
import './ProgressProfile.css';

const LEADERBOARD_USERS = [
  { rank: 1, name: 'MetQuest_99', xp: 22150, change: 'steady' },
  { rank: 2, name: 'CyberNomad', xp: 18420, change: 'up' },
  { rank: 3, name: 'VortexRacer', xp: 16800, change: 'down' },
  { rank: 4, name: 'Artha_Titan', xp: 14200, change: 'up' },
  { rank: 5, name: 'Luna_Explorer', xp: 13850, change: 'steady' },
  { rank: 6, name: 'ShadowDancer', xp: 13100, change: 'down' }
];

const CAREER_LEVELS = [
  { lvl: 6, title: 'Risk Aware Investor', desc: 'Capable of shielding portfolios against extreme drawdowns.' },
  { lvl: 5, title: 'Hedging Specialist', desc: 'Masters options options, negative beta assets, and correlation logic.' },
  { lvl: 4, title: 'Compounding Architect', desc: 'Builds compound interest vaults and scales assets mechanically.' },
  { lvl: 3, title: 'Asset Allocator', desc: 'Optimizes portfolios across equity, debt, and gold classes.' },
  { lvl: 2, title: 'Market Explorer', desc: 'Understands basic equity transactions and inflation concepts.' },
  { lvl: 1, title: 'Beginner Level', desc: 'Initial entry point to the financial metaverse.' }
];

export default function ProgressProfile({
  codename,
  avatar,
  level,
  xp,
  unlockedBadges,
  riskControlScore,
  completedQuests,
  completedMissions
}) {
  const [boardTab, setBoardTab] = useState('global');
  
  const xpNeeded = level * 1500;
  const xpPercent = Math.min(100, Math.floor((xp / xpNeeded) * 100));

  const totalBadges = [
    { id: 'stock_rookie', title: 'Stock Rookie', desc: 'Unlocked by solving Beginner Foundations Quest.', icon: '🌱' },
    { id: 'survivor', title: 'Market Survivor', desc: 'Unlocked by surviving the Market Crash simulator.', icon: '🛡️' },
    { id: 'compound_master', title: 'Compound Master', desc: 'Unlocked by solving the SIP Machine Time quest.', icon: '📈' }
  ];

  const getAvatarSvg = () => {
    switch (avatar) {
      case 'cyber_operative_01':
        return (
          <svg viewBox="0 0 100 100" className="prof-avatar-svg">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#00ffff" strokeWidth="2.5" />
            <polygon points="50,22 72,62 28,62" fill="none" stroke="#00ffff" strokeWidth="3" />
            <circle cx="50" cy="48" r="6" fill="#00ffff" />
          </svg>
        );
      case 'cyber_operative_02':
        return (
          <svg viewBox="0 0 100 100" className="prof-avatar-svg">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#ec4899" strokeWidth="2.5" />
            <path d="M30,50 Q50,20 70,50 T30,50" fill="none" stroke="#ec4899" strokeWidth="3" />
            <circle cx="50" cy="50" r="8" fill="#ec4899" />
          </svg>
        );
      case 'cyber_operative_03':
        return (
          <svg viewBox="0 0 100 100" className="prof-avatar-svg">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="2.5" />
            <rect x="34" y="34" width="32" height="32" fill="none" stroke="#8b5cf6" strokeWidth="3.5" transform="rotate(45, 50, 50)" />
            <circle cx="50" cy="50" r="6" fill="#8b5cf6" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 100 100" className="prof-avatar-svg">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="2.5" />
            <rect x="34" y="34" width="32" height="32" fill="none" stroke="#3b82f6" strokeWidth="3.5" />
            <circle cx="50" cy="50" r="6" fill="#3b82f6" />
          </svg>
        );
    }
  };

  return (
    <div className="profile-container">
      {/* 1. Header Profile summary */}
      <div className="profile-header glass-card">
        <div className="profile-badge-left">
          <div className="prof-avatar-wrapper animate-float">{getAvatarSvg()}</div>
          <div className="prof-info">
            <span className="lvl-tag neon-text-accent">LEVEL {level}</span>
            <h2 className="codename-tag">{codename || 'Alex'}</h2>
            <div className="global-division">Silver League // Division IV</div>
          </div>
        </div>

        <div className="profile-stats-right">
          {/* XP Progress bar */}
          <div className="prof-xp-bar-group">
            <div className="pxbg-labels">
              <span>XP PROGRESSION</span>
              <span>{xp} / {xpNeeded} XP</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${xpPercent}%` }}></div>
            </div>
          </div>

          <div className="prof-small-metrics">
            <div className="pm-box">
              <span className="pm-lbl">WEEKLY RETURN</span>
              <span className="pm-val text-success">+5.4%</span>
            </div>
            <div className="pm-box">
              <span className="pm-lbl">RISK CONTROL</span>
              <span className="pm-val neon-text-secondary">{riskControlScore}%</span>
            </div>
            <div className="pm-box">
              <span className="pm-lbl">COMPLETED</span>
              <span className="pm-val">{completedQuests.length + completedMissions.length} TASKS</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-body-grid">
        {/* Left Column: Badges & Levels */}
        <div className="prof-column-left">
          {/* Badges Gallery */}
          <div className="badges-gallery-card glass-card">
            <h3 className="card-title neon-text">OPERATIVE LOG: BADGES</h3>
            <div className="badges-grid">
              {totalBadges.map((b) => {
                const unlocked = unlockedBadges.includes(b.id);
                return (
                  <div key={b.id} className={`badge-card ${unlocked ? 'unlocked neon-border' : 'locked'}`}>
                    <div className="badge-icon">{unlocked ? b.icon : '🔒'}</div>
                    <div className="badge-name">{b.title}</div>
                    <div className="badge-desc">{unlocked ? b.desc : 'Objective locked.'}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Level Career Path */}
          <div className="career-levels-card glass-card">
            <h3 className="card-title neon-text-accent">CAREER LEVEL PROGRESSION</h3>
            <div className="career-timeline">
              <div className="career-timeline-line"></div>
              {CAREER_LEVELS.map((cl) => {
                const active = level >= cl.lvl;
                return (
                  <div key={cl.lvl} className={`career-node ${active ? 'active' : ''}`}>
                    <div className="cn-num">{cl.lvl}</div>
                    <div className="cn-info">
                      <div className="cn-title">{cl.title}</div>
                      <div className="cn-desc">{cl.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Leaderboard */}
        <div className="prof-column-right">
          <div className="leaderboard-card glass-card">
            <div className="lc-header">
              <h3 className="card-title neon-text-secondary">GLOBAL LEADERBOARD</h3>
              
              <div className="board-tabs">
                <button className={`b-tab ${boardTab === 'global' ? 'active' : ''}`} onClick={() => setBoardTab('global')}>Global</button>
                <button className={`b-tab ${boardTab === 'college' ? 'active' : ''}`} onClick={() => setBoardTab('college')}>College</button>
              </div>
            </div>

            <div className="leaderboard-table">
              <div className="lt-header-row">
                <span>RANK</span>
                <span>OPERATIVE</span>
                <span>XP SCORE</span>
              </div>
              
              {LEADERBOARD_USERS.map((u) => (
                <div key={u.rank} className="lt-user-row">
                  <div className="ltu-rank">
                    <span className={`rank-number r-${u.rank}`}>{u.rank}</span>
                  </div>
                  <span className="ltu-name">{u.name}</span>
                  <span className="ltu-xp">{u.xp.toLocaleString()} XP</span>
                </div>
              ))}

              {/* Player Row */}
              <div className="lt-user-row player-row neon-border-secondary">
                <div className="ltu-rank">
                  <span className="rank-number player-rank-num">18</span>
                </div>
                <span className="ltu-name">{codename || 'Alex'} (YOU)</span>
                <span className="ltu-xp neon-text-secondary">
                  {((level - 1) * 1500 + xp + 8000).toLocaleString()} XP
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
