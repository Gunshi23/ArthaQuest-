import React from 'react';
import './Navbar.css';

export default function Navbar({
  codename,
  avatar,
  level,
  xp,
  diamonds,
  streak,
  activeView,
  onViewChange,
  onReset
}) {
  const xpNeeded = level * 1500;
  const xpPercent = Math.min(100, Math.floor((xp / xpNeeded) * 100));

  // Retrieve active avatar metadata
  const getAvatarIcon = () => {
    switch (avatar) {
      case 'cyber_operative_01':
        return (
          <svg viewBox="0 0 100 100" className="nav-avatar-svg">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#00ffff" strokeWidth="3" />
            <polygon points="50,28 68,62 32,62" fill="none" stroke="#00ffff" strokeWidth="4" />
          </svg>
        );
      case 'cyber_operative_02':
        return (
          <svg viewBox="0 0 100 100" className="nav-avatar-svg">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#ec4899" strokeWidth="3" />
            <path d="M32,50 Q50,22 68,50 T32,50" fill="none" stroke="#ec4899" strokeWidth="4" />
          </svg>
        );
      case 'cyber_operative_03':
        return (
          <svg viewBox="0 0 100 100" className="nav-avatar-svg">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="3" />
            <rect x="36" y="36" width="28" height="28" fill="none" stroke="#8b5cf6" strokeWidth="4" transform="rotate(45, 50, 50)" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 100 100" className="nav-avatar-svg">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="3" />
            <rect x="36" y="36" width="28" height="28" fill="none" stroke="#3b82f6" strokeWidth="4" />
          </svg>
        );
    }
  };

  const navItems = [
    { id: 'home', label: 'HOME', icon: '⌂' },
    { id: 'quests', label: 'QUESTS', icon: '⚡' },
    { id: 'labs', label: 'LABS', icon: '🧪' },
    { id: 'missions', label: 'MISSIONS', icon: '🎯' },
    { id: 'progress', label: 'PROGRESS', icon: '📊' }
  ];

  return (
    <>
      {/* Top Header */}
      <header className="app-header glass-card">
        <div className="header-left">
          <div className="logo-section" onClick={() => onViewChange('home')}>
            <span className="logo-tag neon-text">AQ</span>
            <span className="logo-text">ARTHAQUEST</span>
          </div>
          
          <div className="player-badge">
            <div className="nav-avatar-wrapper">{getAvatarIcon()}</div>
            <div className="player-info">
              <div className="player-codename">{codename || 'Guest Operative'}</div>
              <div className="player-rank">SECURE_CON_v2.0</div>
            </div>
          </div>
        </div>

        <div className="header-right">
          {/* XP Progress */}
          <div className="xp-container">
            <div className="xp-labels">
              <span className="xp-level-badge">LVL {level}</span>
              <span className="xp-ratio">{xp} / {xpNeeded} XP</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${xpPercent}%` }}></div>
            </div>
          </div>

          {/* Counters */}
          <div className="header-counters">
            <div className="counter-item streak-glow" title="Daily Streak">
              <span className="counter-icon">🔥</span>
              <span className="counter-val">{streak} DAY</span>
            </div>
            
            <div className="counter-item diamond-glow" title="Diamonds Earned">
              <span className="counter-icon">💎</span>
              <span className="counter-val">{diamonds}</span>
            </div>

            <button className="reset-btn" onClick={onReset} title="Reset Progress">
              ✕
            </button>
          </div>
        </div>
      </header>

      {/* Bottom Sticky Navigation */}
      <nav className="bottom-nav glass-card">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-btn ${activeView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
          >
            <span className="nav-btn-icon">{item.icon}</span>
            <span className="nav-btn-label">{item.label}</span>
            <div className="nav-active-dot"></div>
          </button>
        ))}
      </nav>
    </>
  );
}
