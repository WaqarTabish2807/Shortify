import React, { useState } from 'react';

const LayoutSelector = ({ layout, setLayout, userTier, isDarkMode }) => {
  const [hoveredLayout, setHoveredLayout] = useState(null);

  return (
    <div style={{ margin: '0 0 14px 0' }}>
      <div style={{ 
        fontWeight: 600, 
        fontSize: 15, 
        marginBottom: 10, 
        marginTop: 18, 
        color: isDarkMode ? '#e0e7ef' : '#222' 
      }}>
        Layout
      </div>
      <div style={{ display: 'flex', gap: 9 }}>
        {['auto', 'fill', 'fit', 'square'].map(opt => {
          const isDisabled = userTier === 'free' && opt !== 'auto';
          const isAuto = opt === 'auto';
          let tooltipText = '';
          if (isAuto) {
            tooltipText = "Fits the entire video within the vertical canvas. May show black area above and below the video.";
          } else if (isDisabled) {
            tooltipText = "Upgrade to Pro to unlock this layout";
          }
          return (
            <div
              key={opt}
              style={{ position: 'relative', display: 'inline-block' }}
              onMouseEnter={() => setHoveredLayout(opt)}
              onMouseLeave={() => setHoveredLayout(null)}
            >
              <button
                type="button"
                onClick={() => !isDisabled && setLayout(opt)}
                disabled={isDisabled}
                style={{
                  background: layout === opt ? (isDarkMode ? '#fff' : '#000') : (isDarkMode ? '#23272f' : '#f3f4f6'),
                  color: layout === opt ? (isDarkMode ? '#000' : '#fff') : (isDarkMode ? '#f3f4f6' : '#222'),
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 13,
                  padding: '7px 14px',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  boxShadow: layout === opt ? '0 2px 8px #0002' : 'none',
                  opacity: isDisabled ? 0.6 : 1,
                  pointerEvents: isDisabled ? 'auto' : 'auto',
                }}
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </button>
              {hoveredLayout === opt && tooltipText && (
                <div
                  style={{
                    position: 'absolute',
                    top: '110%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#222',
                    color: '#fff',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    whiteSpace: 'pre-line',
                    zIndex: 1000,
                    marginTop: 4,
                    minWidth: 220,
                    maxWidth: 260,
                    textAlign: 'left',
                    boxShadow: '0 4px 16px #0002',
                    fontWeight: 300,
                    lineHeight: 1.4,
                  }}
                >
                  {tooltipText}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LayoutSelector; 