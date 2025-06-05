import React from 'react';
import { FaDownload } from 'react-icons/fa';

const ShortsVideoCard = ({ short, idx, isDarkMode }) => (
  <div style={{ 
    minWidth: 180,
    maxWidth: 200,
    background: isDarkMode ? '#18181b' : '#fff', 
    borderRadius: 8, 
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', 
    padding: 12, 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center',
    border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
    transition: 'all 0.2s ease',
  }}>
    <video 
      src={short} 
      controls 
      style={{ 
        width: '100%', 
        borderRadius: 6, 
        marginBottom: 8, 
        background: '#000',
        maxHeight: '280px',
      }} 
    />
    <a 
      href={short} 
      download 
      style={{ 
        marginTop: 4, 
        color: '#fff', 
        background: 'linear-gradient(45deg, #1e40af, #3b82f6)',
        borderRadius: 4, 
        padding: '6px 12px', 
        fontWeight: 600, 
        fontSize: 11, 
        textDecoration: 'none', 
        transition: 'all 0.2s ease', 
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      <FaDownload size={12} /> Download
    </a>
  </div>
);

export default ShortsVideoCard; 