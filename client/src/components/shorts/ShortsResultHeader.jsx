import React from 'react';

const ShortsResultHeader = ({ isDarkMode }) => (
  <>
    <div style={{ 
      fontSize: 20, 
      fontWeight: 800, 
      marginBottom: 6, 
      color: isDarkMode ? '#fff' : '#1e40af', 
      textAlign: 'center', 
      letterSpacing: 0.2,
      padding: '0 20px',
    }}>
      Your Shorts Are Ready!
    </div>
    <div style={{ 
      color: isDarkMode ? '#bdbdbd' : '#666', 
      fontSize: 13, 
      marginBottom: 16, 
      textAlign: 'center', 
      fontWeight: 500,
      maxWidth: '400px',
      lineHeight: '1.5',
    }}>
      Download or preview your generated shorts below.
    </div>
  </>
);

export default ShortsResultHeader; 