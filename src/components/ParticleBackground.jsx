import React, { useMemo } from 'react';
import './ParticleBackground.css';

export default function ParticleBackground() {
  const shapes = useMemo(() => {
    const items = [];
    const colors = ['#00ffff', '#ec4899', '#8b5cf6', '#3b82f6'];
    
    // Generate a set of static random configurations for the floating shapes
    for (let i = 0; i < 15; i++) {
      const size = Math.floor(Math.random() * 80) + 40; // 40px to 120px
      const posX = Math.random() * 100; // 0% to 100%
      const posY = Math.random() * 100; // 0% to 100%
      const speed = Math.floor(Math.random() * 20) + 15; // 15s to 35s animation speed
      const delay = Math.floor(Math.random() * -10); // Start mid-way through animation
      const color = colors[Math.floor(Math.random() * colors.length)];
      const type = ['torus', 'wireframe', 'sphere', 'cube'][Math.floor(Math.random() * 4)];
      
      items.push({ id: i, size, posX, posY, speed, delay, color, type });
    }
    return items;
  }, []);

  return (
    <div className="particle-container">
      <div className="radial-glow-top"></div>
      <div className="radial-glow-bottom"></div>
      
      <svg className="particle-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {shapes.map((s) => {
          const style = {
            animationDuration: `${s.speed}s`,
            animationDelay: `${s.delay}s`,
            transformOrigin: 'center center',
            left: `${s.posX}%`,
            top: `${s.posY}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            position: 'absolute',
          };
          
          return (
            <div
              key={s.id}
              className={`floating-shape-wrapper ${s.type}-animate`}
              style={style}
            >
              <svg width="100%" height="100%" viewBox="0 0 100 100">
                {s.type === 'torus' && (
                  <>
                    <ellipse
                      cx="50"
                      cy="50"
                      rx="38"
                      ry="15"
                      fill="none"
                      stroke={s.color}
                      strokeWidth="1.5"
                      strokeDasharray="4 2"
                      opacity="0.7"
                      transform="rotate(30, 50, 50)"
                    />
                    <ellipse
                      cx="50"
                      cy="50"
                      rx="42"
                      ry="18"
                      fill="none"
                      stroke={s.color}
                      strokeWidth="2"
                      filter="url(#glow-cyan)"
                      transform="rotate(30, 50, 50)"
                    />
                  </>
                )}
                
                {s.type === 'wireframe' && (
                  <g filter="url(#glow-cyan)" stroke={s.color} strokeWidth="1" fill="none" opacity="0.8">
                    {/* Octahedron / Double Pyramid wireframe */}
                    <polygon points="50,10 80,50 50,90 20,50" />
                    <line x1="50" y1="10" x2="50" y2="90" strokeDasharray="2 2" />
                    <line x1="20" y1="50" x2="80" y2="50" />
                    <line x1="50" y1="10" x2="20" y2="50" />
                    <line x1="50" y1="10" x2="80" y2="50" />
                    <line x1="50" y1="90" x2="20" y2="50" />
                    <line x1="50" y1="90" x2="80" y2="50" />
                  </g>
                )}
                
                {s.type === 'sphere' && (
                  <>
                    <circle
                      cx="50"
                      cy="50"
                      r="12"
                      fill={s.color}
                      opacity="0.1"
                      filter="url(#glow-cyan)"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="4"
                      fill={s.color}
                      filter="url(#glow-cyan)"
                    />
                  </>
                )}

                {s.type === 'cube' && (
                  <g filter="url(#glow-cyan)" stroke={s.color} strokeWidth="1.2" fill="none" opacity="0.65">
                    {/* Isometric Cube representation */}
                    <polygon points="50,15 80,32 80,68 50,85 20,68 20,32" />
                    <line x1="50" y1="15" x2="50" y2="85" />
                    <line x1="50" y1="50" x2="20" y2="32" />
                    <line x1="50" y1="50" x2="80" y2="32" />
                    <line x1="50" y1="50" x2="50" y2="85" />
                  </g>
                )}
              </svg>
            </div>
          );
        })}
      </svg>
    </div>
  );
}
