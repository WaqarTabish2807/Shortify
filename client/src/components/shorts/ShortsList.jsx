import React from 'react';

const ShortsCard = ({ url, idx, isDarkMode }) => (
  <div style={{
    minWidth: 180,
    maxWidth: 200,
    background: isDarkMode ? '#23272f' : '#f9fafb',
    borderRadius: 8,
    boxShadow: isDarkMode ? '0 2px 12px #23272f33' : '0 2px 12px #e0e7ef33',
    padding: 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    transition: 'all 0.2s ease',
    border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
    cursor: 'pointer',
  }}>
    <video
      src={url}
      controls
      style={{ 
        width: '100%', 
        height: 'auto',
        maxHeight: '280px',
        borderRadius: 6, 
        marginBottom: 6, 
        background: '#000', 
        boxShadow: isDarkMode ? '0 1px 6px #23272f44' : '0 1px 6px #e0e7ef44',
        transition: 'all 0.2s ease',
      }}
    />
    <a
      href={url}
      download={`short-${idx + 1}.mp4`}
      style={{
        display: 'inline-block',
        background: 'linear-gradient(45deg, #1e40af, #3b82f6)',
        color: '#fff',
        padding: '4px 10px',
        borderRadius: 4,
        textDecoration: 'none',
        fontWeight: 600,
        fontSize: 11,
        marginTop: 2,
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease',
      }}
    >
      Download Short {idx + 1}
    </a>
  </div>
);

const ShortsList = ({ shorts, isDarkMode }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'row',
    gap: 12,
    overflowX: 'auto',
    width: '100%',
    paddingBottom: 4,
    scrollbarWidth: 'thin',
    justifyContent: 'center',
    flexWrap: 'wrap',
    maxWidth: '900px',
    margin: '0 auto',
  }}>
    {shorts.map((url, idx) => (
      <ShortsCard key={url} url={url} idx={idx} isDarkMode={isDarkMode} />
    ))}
  </div>
);

export default ShortsList; 