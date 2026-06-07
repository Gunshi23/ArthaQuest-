import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Operative connection initialized. I am Sentinel AI, your tactical financial co-pilot. Ask me anything about risk limits, compound interest curves, options hedging, or correlation heatmaps.'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto scroll to latest messages
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    const userMsg = { sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    const systemPrompt = `You are Sentinel AI, the tactical financial co-pilot of ArthaQuest (a gamified financial intelligence simulator).
Your character is highly intelligent, supportive, analytical, and speaks in a cool, slightly futuristic cyberpunk advisor tone (referencing "operative logs", "vault parameters", "drawdown thresholds", "hedges", "capital re-allocations").
Answer the user's questions about finance, investing, options trading, risk management, and the ArthaQuest app features. Keep your answers concise, clear, and format them nicely with bold text where appropriate. Avoid boring corporate phrasing.
User's query: "${text}"`;

    const modelName = import.meta.env.VITE_GEMINI_MODEL || 'gemini-3.5-flash';
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    try {
      if (!apiKey) {
        throw new Error('API Key missing');
      }

      let url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      let res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }]
        })
      });

      if (!res.ok) {
        // Fallback to gemini-1.5-flash if 3.5 is not accessible
        console.warn(`Model ${modelName} failed. Falling back to gemini-1.5-flash.`);
        url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }]
          })
        });
      }

      if (!res.ok) {
        throw new Error('Fallback failed');
      }

      const data = await res.json();
      const botText = data.candidates[0].content.parts[0].text;
      setMessages((prev) => [...prev, { sender: 'bot', text: botText }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'API Link Interrupted. Ensure VITE_GEMINI_API_KEY is configured inside your environmental node and try again.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-widget">
      {/* 1. Closed Chat Bubble */}
      {!isOpen && (
        <button className="chat-bubble-btn neon-border animate-float" onClick={() => setIsOpen(true)}>
          <span className="bubble-icon">🛡️</span>
          <span className="bubble-text">AI ASSIST</span>
        </button>
      )}

      {/* 2. Expanded Chat Panel */}
      {isOpen && (
        <div className="chat-panel glass-card">
          <div className="chat-header">
            <div className="ch-left">
              <span className="live-dot animate-pulse-slow"></span>
              <span className="ch-title neon-text">SENTINEL AI</span>
            </div>
            <button className="close-chat-btn" onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((m, idx) => (
              <div key={idx} className={`message-bubble ${m.sender}`}>
                <div className="message-text">{m.text}</div>
              </div>
            ))}
            {isLoading && (
              <div className="message-bubble bot loading">
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef}></div>
          </div>

          <form onSubmit={handleSendMessage} className="chat-input-bar">
            <input
              type="text"
              className="cyber-input chat-input"
              placeholder="Ask Sentinel..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" className="cyber-btn send-btn" disabled={isLoading || !inputText.trim()}>
              SEND
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
