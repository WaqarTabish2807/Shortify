import React from 'react';

const VideoPreview = ({ youtubeId, isDarkMode, isMobile }) => {
  if (!youtubeId) return null;
  
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
      <iframe
        width="100%"
        height={isMobile ? 120 : 160}
        src={`https://www.youtube.com/embed/${youtubeId}`}
        title="YouTube video preview"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ 
          border: 'none', 
          width: '100%', 
          borderRadius: 12, 
          background: '#000', 
          height: '100%', 
          minHeight: 100, 
          maxHeight: 180 
        }}
      />
    </div>
  );
};

export default VideoPreview; 