import React from 'react';

const VideoPreview = ({ videoUrl, isDarkMode, isMobile }) => {
  if (!videoUrl) return null;
  
  return (
    <div style={{ 
      margin: '0 0 12px 0', 
      borderRadius: 12, 
      overflow: 'hidden', 
      boxShadow: isDarkMode ? '0 2px 8px #23272f33' : '0 2px 8px #e0e7ef33', 
      width: '100%', 
      height: isMobile ? 120 : 160, 
      minHeight: 100, 
      maxHeight: 180 
    }}>
      <video
        src={videoUrl}
        controls
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover',
          background: '#000'
        }}
      />
    </div>
  );
};

export default VideoPreview; 