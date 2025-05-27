import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Select from 'react-select';
import { supabase } from "../supabase/client";
import { FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';

const languageOptions = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'es-ES', label: 'Spanish (Spain)' },
  { code: 'fr-FR', label: 'French' },
  { code: 'de-DE', label: 'German' },
  { code: 'it-IT', label: 'Italian' },
  { code: 'ru-RU', label: 'Russian' },
  { code: 'ja-JP', label: 'Japanese' },
  { code: 'ko-KR', label: 'Korean' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ar-XA', label: 'Arabic' },
  { code: 'pt-BR', label: 'Portuguese (Brazil)' },
  { code: 'bn-IN', label: 'Bengali' },
  { code: 'pa-IN', label: 'Punjabi' },
  { code: 'mr-IN', label: 'Marathi' },
  { code: 'ta-IN', label: 'Tamil' },
  { code: 'te-IN', label: 'Telugu' },
  { code: 'gu-IN', label: 'Gujarati' },
  { code: 'ur-IN', label: 'Urdu' },
  // ...add more as needed
];

const Dashboard = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [videoId, setVideoId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [languageCode, setLanguageCode] = useState('en-US');
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = screenWidth < 768;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.access_token) {
        throw new Error('No active session found');
      }
      const response = await fetch('http://localhost:5000/api/process-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ videoId })
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 403) {
          const errorMsg = 'You are out of credits. Please upgrade to Pro to continue.';
          toast.error(errorMsg, { position: 'top-right' });
          setError(errorMsg);
        } else {
          throw new Error(data.error || 'Failed to process video');
        }
        return;
      }
      // Navigate to ProcessingPage
      if (data && data.jobId) {
        navigate('/processing', { state: { jobId: data.jobId, videoId } });
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: isDarkMode ? '#121212' : '#fafbfc', flexDirection: isMobile ? 'column' : 'row' }}>
      <Sidebar isMobile={isMobile} isDarkMode={isDarkMode} activePage="dashboard" />
      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar userEmail={user?.email} />
        {/* Dashboard Card */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '16px' : '0' }}>
          <div style={{
            background: isDarkMode ? '#1a1a1a' : '#fff',
            borderRadius: 14,
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            padding: isMobile ? '20px' : '36px 40px',
            minWidth: isMobile ? 'auto' : 350,
            maxWidth: isMobile ? '100%' : 400,
            textAlign: 'center',
            color: isDarkMode ? '#fff' : '#000',
            overflow: 'visible',
          }}>
            <div style={{ fontWeight: 700, fontSize: isMobile ? 18 : 22, marginBottom: isMobile ? 16 : 8 }}>Create YouTube Short</div>
            <div style={{ color: isDarkMode ? '#888' : '#888', fontSize: isMobile ? 14 : 15, marginBottom: isMobile ? 20 : 24 }}>Transform your YouTube videos into engaging shorts</div>
            <div style={{ textAlign: 'left', fontWeight: 500, fontSize: isMobile ? 13 : 14, marginBottom: isMobile ? 4 : 6 }}>YouTube Video URL</div>
            <div style={{ width: '100%' }}>
              <input
                type="text"
                placeholder="Paste your YouTube video URL !"
                value={videoId}
                onChange={e => setVideoId(e.target.value)}
                style={{
                  width: '100%',
                  border: `1px solid ${isDarkMode ? '#333' : '#e0e0e0'}`,
                  borderRadius: 6,
                  padding: '10px 12px',
                  fontSize: 15,
                  outline: 'none',
                  background: isDarkMode ? '#2a2a2a' : '#fafbfc',
                  color: isDarkMode ? '#fff' : '#000',
                  marginBottom: 10,
                  boxSizing: 'border-box'
                }}
              />
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  width: '100%',
                }}
              >
                <Select
                  value={languageOptions.find(opt => opt.code === languageCode)}
                  onChange={opt => setLanguageCode(opt.code)}
                  options={languageOptions}
                  menuPlacement="auto"
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      background: isDarkMode ? '#23272f' : '#fff',
                      borderColor: state.isFocused ? '#2563eb' : (isDarkMode ? '#333' : '#e0e0e0'),
                      color: isDarkMode ? '#fff' : '#222',
                      borderRadius: 8,
                      minHeight: 44,
                      boxShadow: state.isFocused ? '0 0 0 2px #2563eb33' : '0 2px 8px rgba(0,0,0,0.04)',
                      fontWeight: 500,
                      fontSize: 15,
                      transition: 'border 0.2s, box-shadow 0.2s',
                      outline: 'none',
                      '&:hover': {
                        borderColor: '#2563eb'
                      }
                    }),
                    menu: base => ({
                      ...base,
                      background: isDarkMode ? '#23272f' : '#fff',
                      color: isDarkMode ? '#fff' : '#222',
                      borderRadius: 10,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                      zIndex: 9999,
                      border: isDarkMode ? '1px solid #333' : '1px solid #e0e0e0',
                      marginTop: 4,
                      minWidth: 140,
                      overflowX: 'hidden',
                      padding: 0,
                    }),
                    option: (base, state) => ({
                      ...base,
                      background: state.isSelected
                        ? (isDarkMode ? '#353b4a' : '#e3e8f7')
                        : state.isFocused
                        ? (isDarkMode ? '#23272f' : '#f3f4f6')
                        : isDarkMode
                        ? '#23272f'
                        : '#fff',
                      color: isDarkMode ? '#fff' : '#222',
                      fontWeight: state.isSelected ? 600 : 500,
                      cursor: 'pointer',
                      borderRadius: 6,
                      margin: '2px 6px',
                      padding: '10px 14px',
                      fontSize: 15,
                      transition: 'background 0.2s, color 0.2s',
                      overflowX: 'hidden',
                    }),
                    menuList: base => ({
                      ...base,
                      maxHeight: 160,
                      paddingRight: 0,
                      scrollbarWidth: 'thin',
                      overflowX: 'hidden',
                      '&::-webkit-scrollbar': {
                        width: 6,
                        background: 'transparent'
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: '#e0e0e0',
                        borderRadius: 4
                      }
                    }),
                    singleValue: base => ({
                      ...base,
                      color: isDarkMode ? '#fff' : '#222',
                      fontWeight: 600,
                    }),
                    dropdownIndicator: base => ({
                      ...base,
                      color: isDarkMode ? '#fff' : '#222',
                      '&:hover': { color: '#2563eb' }
                    }),
                    indicatorSeparator: base => ({
                      ...base,
                      background: isDarkMode ? '#444' : '#e0e0e0',
                    }),
                    input: base => ({
                      ...base,
                      color: isDarkMode ? '#fff' : '#222',
                    }),
                    placeholder: base => ({
                      ...base,
                      color: isDarkMode ? '#aaa' : '#888',
                      fontWeight: 400,
                    }),
                  }}
                  isSearchable
                />
                <button
                  style={{
                    flex: 1,
                    background: isDarkMode ? 'white' : '#111',
                    color: isDarkMode ? '#111' : 'white',
                    border: 'none',
                    borderRadius: 6,
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                    height: 44,
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={handleSubmit}
                >
                  {isProcessing ? (
                    <>
                      <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Processing...
                    </>
                  ) : (
                    'Generate Shorts'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;