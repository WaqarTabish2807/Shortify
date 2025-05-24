import React, { createContext, useContext, useState } from 'react';

const VideoProcessingContext = createContext(null);

export const VideoProcessingProvider = ({ children }) => {
  const [videos, setVideos] = useState([]);

  const addVideo = (video) => {
    setVideos(prevVideos => [...prevVideos, video]);
  };

  const updateVideo = (videoId, updates) => {
    setVideos(prevVideos =>
      prevVideos.map(video =>
        video.id === videoId ? { ...video, ...updates } : video
      )
    );
  };

  const value = {
    videos,
    addVideo,
    updateVideo
  };

  return (
    <VideoProcessingContext.Provider value={value}>
      {children}
    </VideoProcessingContext.Provider>
  );
};

export const useVideoProcessing = () => {
  const context = useContext(VideoProcessingContext);
  if (context === null) {
    throw new Error('useVideoProcessing must be used within a VideoProcessingProvider');
  }
  return context;
}; 