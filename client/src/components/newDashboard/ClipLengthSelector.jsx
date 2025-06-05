import React from 'react';

const ClipLengthSelector = ({ clipLength, setClipLength, isDarkMode }) => {
  return (
    <div style={{ margin: '0 0 14px 0' }}>
      <div style={{ 
        fontWeight: 600, 
        fontSize: 13, 
        marginBottom: 10, 
        marginTop: 18, 
        color: isDarkMode ? '#e0e7ef' : '#222' 
      }}>
        Preferred Clip length
      </div>
      <div style={{ display: 'flex', gap: 9 }}>
        {['<30s', '30s-60s', '60s-90s'].map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => setClipLength(opt)}
            style={{
              background: clipLength === opt ? (isDarkMode ? '#fff' : '#000') : (isDarkMode ? '#23272f' : '#f3f4f6'),
              color: clipLength === opt ? (isDarkMode ? '#000' : '#fff') : (isDarkMode ? '#f3f4f6' : '#222'),
              border: 'none',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 13,
              padding: '7px 14px',
              cursor: 'pointer',
              boxShadow: clipLength === opt ? '0 2px 8px #0002' : 'none',
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ClipLengthSelector; 