import React, { useState, useEffect } from 'react';
import './EMMPortal.css';

const DEMO_REPORT = {
  questId: 'survival_demo',
  failedValue: 37500,
  finalLossPercent: 25.0,
  lossAmount: 12500,
  whatWentWrong: 'Overexposure to technology equities (82% concentration in NVDA and TSLA) during a sector rotation, compounded by the absence of an automated stop-loss exit rule.',
  aiInsight: 'You reacted 2 days late. If you had executed the Capital Shift at the $438 price breach, you would have saved 65% of the total loss.'
};

export default function EMMPortal({ emmReport, onViewChange }) {
  // Use actual failed report if available, else fallback to demo
  const report = emmReport || DEMO_REPORT;
  const [dynamicInsight, setDynamicInsight] = useState(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  useEffect(() => {
    const fetchDynamicInsight = async () => {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) return;

      setIsLoadingInsight(true);
      const modelName = import.meta.env.VITE_GEMINI_MODEL || 'gemini-3.5-flash';
      
      const emmPrompt = `You are Sentinel AI, the risk management forensic engine of ArthaQuest.
Analyze this failed simulation trade logs and write a brief (2-3 sentences), highly sharp, professional corrective critique:
- Quest ID: "${report.questId}"
- Final Return: -${report.finalLossPercent}%
- Stated Cause of Failure: "${report.whatWentWrong}"

Explain precisely the mathematical error (such as overexposure, high Beta volatility, lack of hedging, or delayed reaction) and provide one clear tactical rule they must execute next time to survive. Speak in a cool, slightly futuristic cyberpunk tone. Return ONLY the critique, no greetings, no introductory text, no quotes.`;

      try {
        let url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        let res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: emmPrompt }] }]
          })
        });

        if (!res.ok) {
          // Fallback to gemini-1.5-flash
          url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
          res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: emmPrompt }] }]
            })
          });
        }

        if (res.ok) {
          const data = await res.json();
          const botText = data.candidates[0].content.parts[0].text;
          setDynamicInsight(botText.trim());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingInsight(false);
      }
    };

    fetchDynamicInsight();
  }, [report]);

  return (
    <div className="emm-container">
      <div className="emm-header-section">
        <span className="subtitle neon-text-secondary">AI FEEDBACK LOGS</span>
        <h2 className="title">EXPLAIN MY MISTAKE (EMM)</h2>
        <p className="desc">Sentinel AI analyzes failed simulations to produce forensic post-mortems. Review your behavioral trading errors to optimize future runs.</p>
      </div>

      <div className="emm-grid">
        {/* Left Card: Forensics Breakdown */}
        <div className="emm-card-left glass-card">
          <div className="ecl-header">
            <span className="ecl-tag text-error">CRITICAL WARNING // TERMINATED</span>
            <span className="ecl-date">SECURE_LOG_#4092</span>
          </div>

          <h3 className="ecl-title">Trade Post-Mortem Analysis</h3>
          
          <div className="emm-stats-row">
            <div className="esr-box">
              <span className="esrb-lbl">FINAL RETURN</span>
              <span className="esrb-val text-error">-{report.finalLossPercent}%</span>
            </div>
            <div className="esr-box">
              <span className="esrb-lbl">RISK LIMIT</span>
              <span className="esrb-val">EXCEEDED</span>
            </div>
            <div className="esr-box">
              <span className="esrb-lbl">DRAWDOWN</span>
              <span className="esrb-val text-error">TERMINATED</span>
            </div>
          </div>

          <div className="forensic-bullets">
            <h4 className="fb-title neon-text-secondary">WHAT WENT WRONG</h4>
            <p className="fb-desc">{report.whatWentWrong}</p>
            
            <ul className="fb-list">
              <li><strong>Portfolio Concentration:</strong> Tech exposure reached 82% during a high-volatility macro event.</li>
              <li><strong>Rule Compliance Failure:</strong> Stop-loss exit parameters were not configured at entry, triggering a "hope" trade.</li>
              <li><strong>Reaction Latency:</strong> Capital re-allocation commands were ignored during the initial 10% drawdown segment.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Visual Audit & AI Insight */}
        <div className="emm-card-right">
          {/* Visual Audit Column Chart */}
          <div className="visual-audit-card glass-card">
            <h4 className="vac-title">VISUAL AUDIT: PORTFOLIO BLEED</h4>
            
            <div className="audit-chart-container">
              {/* Daily bars representing portfolio drawdown */}
              <div className="audit-bars">
                <div className="a-bar-wrapper">
                  <div className="a-bar" style={{ height: '90%' }}></div>
                  <span className="a-label">Mon</span>
                </div>
                <div className="a-bar-wrapper">
                  <div className="a-bar" style={{ height: '82%' }}></div>
                  <span className="a-label">Tue</span>
                </div>
                <div className="a-bar-wrapper">
                  <div className="a-bar" style={{ height: '70%' }}></div>
                  <span className="a-label">Wed</span>
                </div>
                <div className="a-bar-wrapper">
                  <div className="a-bar warning" style={{ height: '55%' }}></div>
                  <span className="a-label">Thu</span>
                </div>
                <div className="a-bar-wrapper">
                  <div className="a-bar critical" style={{ height: '35%' }}></div>
                  <span className="a-label">Fri</span>
                </div>
                <div className="a-bar-wrapper">
                  <div className="a-bar critical" style={{ height: '25%' }}></div>
                  <span className="a-label">Sat</span>
                </div>
              </div>
            </div>
            <p className="vac-footnote text-error">System triggered auto-liquidation at $37,500 threshold (Sat).</p>
          </div>

          {/* AI Corrective Insight */}
          <div className="ai-insight-card glass-card neon-border-secondary">
            <div className="aic-header">
              <span className="aic-icon">🛡️</span>
              <span className="aic-tag neon-text-secondary">SENTINEL AI CORRECTIVE INSIGHT</span>
            </div>
            
            <p className="aic-body">
              {isLoadingInsight ? (
                "Sentinel AI parsing memory dump and generating post-mortem analysis..."
              ) : (
                dynamicInsight ? `"${dynamicInsight}"` : `"${report.aiInsight}"`
              )}
            </p>
            
            <div className="aic-metrics">
              <div className="aicm-box">
                <span className="aicm-lbl">ESTIMATED CAPITAL LOSS</span>
                <span className="aicm-val text-error">${report.lossAmount.toLocaleString()}</span>
              </div>
              <div className="aicm-box">
                <span className="aicm-lbl">AVOIDABLE LOSS BY STOP-LOSS</span>
                <span className="aicm-val text-success">65% ($8,125)</span>
              </div>
            </div>
          </div>

          <div className="emm-actions">
            <button className="cyber-btn" onClick={() => onViewChange('quests')}>
              RE-RUN SURVIVAL SIMULATOR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
