import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../context/ThemeContext";

const Dashboard = () => {
  const { isDarkMode } = useTheme();
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [error, setError] = useState("");
  const userEmail = "waqs2807@gmail.com";

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isMobile = screenWidth < 768;

  // Simple YouTube URL validation
  const isValidYoutubeUrl = (url) => {
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(url);
  };

  const handleCreate = () => {
    if (!youtubeUrl.trim()) {
      setError("Please enter a YouTube video URL.");
      return;
    }
    if (!isValidYoutubeUrl(youtubeUrl.trim())) {
      setError("Please enter a valid YouTube video URL.");
      return;
    }
    setError("");
    // TODO: Replace with actual processing logic
    alert(`Processing: ${youtubeUrl}`);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: isDarkMode ? '#121212' : '#fafbfc', flexDirection: isMobile ? 'column' : 'row' }}>
      <Sidebar isMobile={isMobile} isDarkMode={isDarkMode} activePage="dashboard" />
      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar userEmail={userEmail} />
        {/* Dashboard Card */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '16px' : '0' }}>
          <div style={{ background: isDarkMode ? '#1a1a1a' : '#fff', borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', padding: isMobile ? '20px' : '36px 40px', minWidth: isMobile ? 'auto' : 350, maxWidth: isMobile ? '100%' : 400, textAlign: 'center', color: isDarkMode ? '#fff' : '#000' }}>
            <div style={{ fontWeight: 700, fontSize: isMobile ? 18 : 22, marginBottom: isMobile ? 16 : 8 }}>Create YouTube Short</div>
            <div style={{ color: isDarkMode ? '#888' : '#888', fontSize: isMobile ? 14 : 15, marginBottom: isMobile ? 20 : 24 }}>Transform your YouTube videos into engaging shorts</div>
            <div style={{ textAlign: 'left', fontWeight: 500, fontSize: isMobile ? 13 : 14, marginBottom: isMobile ? 4 : 6 }}>YouTube Video URL</div>
            <div style={{ display: 'flex', gap: 8, flexDirection: isMobile ? 'column' : 'row' }}>
              <input
                type="text"
                placeholder="Paste your YouTube video URL !"
                value={youtubeUrl}
                onChange={e => setYoutubeUrl(e.target.value)}
                style={{ flex: 1, border: `1px solid ${isDarkMode ? '#333' : '#e0e0e0'}`, borderRadius: 6, padding: '10px 12px', fontSize: 15, outline: 'none', background: isDarkMode ? '#2a2a2a' : '#fafbfc', color: isDarkMode ? '#fff' : '#000' }}
              />
              <button
                style={{ background: isDarkMode ? '#333' : '#111', color: '#fff', border: 'none', borderRadius: 6, padding: '0 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
                onClick={handleCreate}
              >
                Create
              </button>
            </div>
            {error && (
              <div style={{ color: '#e74c3c', marginTop: 10, fontSize: 13, textAlign: 'left' }}>{error}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;