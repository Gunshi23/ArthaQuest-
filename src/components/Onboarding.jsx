import React, { useState } from 'react';
import './Onboarding.css';

const AVATARS = [
  { id: 'cyber_operative_01', name: 'AURA', color: '#00ffff', svg: (
    <svg viewBox="0 0 100 100" className="avatar-svg">
      <circle cx="50" cy="50" r="40" fill="none" stroke="#00ffff" strokeWidth="2" strokeDasharray="6 3" />
      <polygon points="50,25 70,60 30,60" fill="none" stroke="#00ffff" strokeWidth="3" />
      <circle cx="50" cy="48" r="6" fill="#00ffff" />
      <line x1="50" y1="60" x2="50" y2="75" stroke="#00ffff" strokeWidth="2" />
    </svg>
  )},
  { id: 'cyber_operative_02', name: 'VORTEX', color: '#ec4899', svg: (
    <svg viewBox="0 0 100 100" className="avatar-svg">
      <circle cx="50" cy="50" r="40" fill="none" stroke="#ec4899" strokeWidth="2" />
      <path d="M30,50 Q50,20 70,50 T30,50" fill="none" stroke="#ec4899" strokeWidth="3" />
      <circle cx="50" cy="50" r="8" fill="#ec4899" />
    </svg>
  )},
  { id: 'cyber_operative_03', name: 'TITAN', color: '#8b5cf6', svg: (
    <svg viewBox="0 0 100 100" className="avatar-svg">
      <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="20 4" />
      <rect x="35" y="35" width="30" height="30" fill="none" stroke="#8b5cf6" strokeWidth="3" transform="rotate(45, 50, 50)" />
      <circle cx="50" cy="50" r="5" fill="#8b5cf6" />
    </svg>
  )},
  { id: 'cyber_operative_04', name: 'SENTINEL', color: '#3b82f6', svg: (
    <svg viewBox="0 0 100 100" className="avatar-svg">
      <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="2" />
      <path d="M35,35 L65,35 L65,65 L35,65 Z" fill="none" stroke="#3b82f6" strokeWidth="3" />
      <line x1="35" y1="35" x2="65" y2="65" stroke="#3b82f6" strokeWidth="1.5" />
      <line x1="65" y1="35" x2="35" y2="65" stroke="#3b82f6" strokeWidth="1.5" />
    </svg>
  )}
];

const PERSONAS = [
  { id: 'Rookie', title: 'ROOKIE', level: 'LVL 01', desc: 'New to the Realm. Here to learn the absolute basics of gold, stocks, and compounding growth.' },
  { id: 'Strategist', title: 'STRATEGIST', level: 'LVL 05', desc: 'Tactical Player. Understands basic market concepts but wants to master risk management and options.' },
  { id: 'Expert', title: 'EXPERT', level: 'LVL 10', desc: 'Financial Titan. Experienced investor here to test strategies in extreme simulations and crashes.' }
];

const DIRECTIVES = [
  { id: 'Wealth Growth', label: 'WEALTH GROWTH', desc: 'Maximize compounding returns and mechanical asset scaling.' },
  { id: 'Risk Management', label: 'RISK MANAGEMENT', desc: 'Protect capital under high volatility and drawdowns.' },
  { id: 'Market Mystery', label: 'MARKET MYSTERY', desc: 'Understand correlation, Beta, and sector movement.' },
  { id: 'Passive Income', label: 'PASSIVE INCOME', desc: 'Build steady flows through dividend yields and bond mixes.' }
];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [codename, setCodename] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].id);
  const [selectedPersona, setSelectedPersona] = useState(PERSONAS[0].id);
  const [selectedDirs, setSelectedDirs] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const handleNextStep = () => {
    if (step === 1 && !codename.trim()) {
      setErrorMsg('Access Denied: Codename required to initialize connection.');
      return;
    }
    setErrorMsg('');
    setStep(step + 1);
  };

  const handleToggleDirective = (dirId) => {
    setSelectedDirs((prev) =>
      prev.includes(dirId) ? prev.filter((d) => d !== dirId) : [...prev, dirId]
    );
  };

  const handleFinish = () => {
    if (selectedDirs.length === 0) {
      setErrorMsg('Access Denied: Select at least one directive to synchronize objectives.');
      return;
    }
    
    // Determine starting stats based on persona
    let startLevel = 1;
    let startXP = 0;
    if (selectedPersona === 'Strategist') {
      startLevel = 5;
      startXP = 0;
    } else if (selectedPersona === 'Expert') {
      startLevel = 10;
      startXP = 0;
    }

    onComplete({
      codename,
      avatar: selectedAvatar,
      persona: selectedPersona,
      level: startLevel,
      xp: startXP,
      objectives: selectedDirs,
      onboarded: true,
      activeView: 'home'
    });
  };

  return (
    <div className="onboarding-overlay">
      <div className="scanlines"></div>
      
      {/* STEP 0: COVER / WELCOME */}
      {step === 0 && (
        <div className="cover-container glass-card animate-float">
          <div className="meta-tag neon-text">SYSTEM ACTIVE // ARTHAQUEST v1.0</div>
          
          <h1 className="cover-title">
            ARTHA<span className="cyan-glow">QUEST</span>
          </h1>
          
          <div className="divider neon-border"></div>
          
          <p className="cover-quote">
            Welcome to the Financial Metaverse. A world where markets are battlefields.
            Risk is the villain. Strategy is your weapon. And every decision writes your
            financial destiny.
          </p>
          
          <div className="cover-sub-label">GAMIFIED FINANCIAL INTELLIGENCE</div>
          
          <button className="cyber-btn cover-btn-action" onClick={handleNextStep}>
            LAUNCH SESSION
          </button>
        </div>
      )}

      {/* STEP 1: IDENTITY */}
      {step === 1 && (
        <div className="step-container glass-card">
          <div className="step-indicator">STEP 01/03</div>
          <h2 className="step-title neon-text">ESTABLISH IDENTITY</h2>
          <p className="step-subtitle">Initialize your operative codename and avatar to sync connection.</p>
          
          <div className="form-group">
            <label className="cyber-label">ENTER CODENAME</label>
            <input
              type="text"
              className="cyber-input"
              placeholder="e.g. CyberNomad..."
              value={codename}
              onChange={(e) => {
                setCodename(e.target.value);
                if (e.target.value) setErrorMsg('');
              }}
              maxLength={15}
            />
          </div>

          <div className="avatar-grid-label cyber-label">SELECT DIGITAL OPERATIVE</div>
          <div className="avatar-grid">
            {AVATARS.map((av) => (
              <div
                key={av.id}
                className={`avatar-card ${selectedAvatar === av.id ? 'active' : ''}`}
                style={{ '--active-color': av.color }}
                onClick={() => setSelectedAvatar(av.id)}
              >
                {av.svg}
                <div className="avatar-name" style={{ color: av.color }}>{av.name}</div>
              </div>
            ))}
          </div>

          {errorMsg && <div className="error-text neon-text-secondary">{errorMsg}</div>}

          <button className="cyber-btn step-btn" onClick={handleNextStep}>
            INITIALIZE QUEST
          </button>
        </div>
      )}

      {/* STEP 2: KNOWLEDGE SCAN */}
      {step === 2 && (
        <div className="step-container glass-card">
          <div className="step-indicator">STEP 02/03</div>
          <h2 className="step-title neon-text">KNOWLEDGE SCAN</h2>
          <p className="step-subtitle">Synchronize your experience level to establish simulation complexity.</p>
          
          <div className="persona-list">
            {PERSONAS.map((p) => (
              <div
                key={p.id}
                className={`persona-card ${selectedPersona === p.id ? 'active' : ''}`}
                onClick={() => setSelectedPersona(p.id)}
              >
                <div className="persona-header">
                  <div className="persona-title">{p.title}</div>
                  <div className="persona-lvl neon-text">{p.level}</div>
                </div>
                <p className="persona-desc">{p.desc}</p>
                <div className="select-dot"></div>
              </div>
            ))}
          </div>

          <button className="cyber-btn step-btn" onClick={handleNextStep}>
            SYNC FREQUENCY
          </button>
        </div>
      )}

      {/* STEP 3: OBJECTIVES */}
      {step === 3 && (
        <div className="step-container glass-card">
          <div className="step-indicator">STEP 03/03</div>
          <h2 className="step-title neon-text">MISSION OBJECTIVES</h2>
          <p className="step-subtitle">Choose your primary learning directives to configure the commander suite.</p>
          
          <div className="directives-list">
            {DIRECTIVES.map((d) => {
              const active = selectedDirs.includes(d.id);
              return (
                <div
                  key={d.id}
                  className={`directive-card ${active ? 'active' : ''}`}
                  onClick={() => handleToggleDirective(d.id)}
                >
                  <div className="directive-checkbox">
                    {active && <div className="checkbox-fill"></div>}
                  </div>
                  <div className="directive-info">
                    <div className="directive-label">{d.label}</div>
                    <div className="directive-desc">{d.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {errorMsg && <div className="error-text neon-text-secondary">{errorMsg}</div>}

          <button className="cyber-btn step-btn cyber-btn-secondary" onClick={handleFinish}>
            ENTER THE METAVERSE
          </button>
        </div>
      )}
    </div>
  );
}
