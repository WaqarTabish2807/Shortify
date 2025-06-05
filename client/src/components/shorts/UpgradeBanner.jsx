import React from 'react';

const UpgradeBanner = ({ isDarkMode }) => (
  <div style={{ 
    color: '#f59e42', 
    background: isDarkMode ? 'rgba(245, 158, 66, 0.1)' : '#fffbe6', 
    border: isDarkMode ? '1px solid rgba(245, 158, 66, 0.2)' : '1px solid #ffe0b2', 
    borderRadius: 6, 
    padding: '8px 16px', 
    marginBottom: 12, 
    fontWeight: 600, 
    fontSize: 12,
    backdropFilter: 'blur(8px)',
    boxShadow: isDarkMode ? '0 2px 8px rgba(245, 158, 66, 0.1)' : '0 2px 8px rgba(245, 158, 66, 0.05)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }}>
    <span>Free users can generate up to 2 shorts per video.</span>
    <a 
      href="/pricing" 
      style={{ 
        display: 'inline-block',
        background: '#7b3aed',
        color: '#fff',
        padding: '4px 12px',
        borderRadius: 4,
        textDecoration: 'none',
        fontWeight: 600,
        fontSize: 12,
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease',
      }}
    >
      Upgrade to Pro
    </a>
  </div>
);

export default UpgradeBanner; 