import React, { useState, useEffect, useCallback, useMemo } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";
import { toast } from 'react-toastify';
import LanguageSelector from '../components/newDashboard/LanguageSelector';
import VideoPreview from '../components/newDashboard/VideoPreview';
import ProcessingTimeframe from '../components/newDashboard/ProcessingTimeframe';
import ClipLengthSelector from '../components/newDashboard/ClipLengthSelector';
import LayoutSelector from '../components/newDashboard/LayoutSelector';
import AdvancedOptions from '../components/newDashboard/AdvancedOptions';
import TemplateSelector from '../components/newDashboard/TemplateSelector';
import GenerateButton from '../components/newDashboard/GenerateButton';

function validateYoutubeUrl(url) {
  if (!url) return false;
  if (url.includes('playlist?list=') || url.includes('list=')) return 'playlist';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? true : false;
}

const NewDashboard = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [videoUrl, setVideoUrl] = useState("");
  const [languageCode, setLanguageCode] = useState(null);
  const [timeframe, setTimeframe] = useState([0, 600]);
  const [clipLength, setClipLength] = useState('30s-60s');
  const [selectedTemplate, setSelectedTemplate] = useState('Hormozi');
  const [advanced, setAdvanced] = useState({
    memeHook: false,
    gameVideo: false,
    hookTitle: false,
    callToAction: false,
    backgroundMusic: false,
  });
  const [layout, setLayout] = useState('auto');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const inputRef = React.useRef(null);
  const [languageLoading, setLanguageLoading] = useState(false);
  const [videoDuration, setVideoDuration] = useState(null);
  const [userTier] = useState('free');
  const [jobId, setJobId] = useState(null);

  // Helper for YouTube embed
  const getYoutubeId = useCallback((url) => {
    if (!url || url.includes('playlist?list=') || url.includes('list=')) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }, []);

  const youtubeId = useMemo(() => getYoutubeId(videoUrl), [videoUrl, getYoutubeId]);
  const isPlaylist = useMemo(() => videoUrl && (videoUrl.includes('playlist?list=') || videoUrl.includes('list=')), [videoUrl]);
  const showOptions = useMemo(() => !!youtubeId && !isPlaylist, [youtubeId, isPlaylist]);

  // After submitting the video for processing, poll the /api/job-status/:jobId endpoint to get the video duration.
  const pollJobStatus = useCallback(async (jobId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/job-status/${jobId}`);
      const data = await response.json();
      if (data && data.duration) {
        setVideoDuration(data.duration);
      }
      if (data && data.status && data.status !== 'processing') {
        // Optionally update userTier if returned in job status
        // setUserTier(data.userTier || 'free');
      }
    } catch (err) {
      console.error('Error polling job status:', err);
    }
  }, []);

  // Update handleSubmit to store jobId and poll for duration
  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
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
        body: JSON.stringify({ videoId: youtubeId, clipLength, layout, template: selectedTemplate })
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 403) {
          const errorMsg = 'You are out of credits. Please upgrade to Pro to continue.';
          toast.error(errorMsg, { position: 'top-right' });
        } else {
          throw new Error(data.error || 'Failed to process video');
        }
        return;
      }
      // Store jobId and poll for duration
      if (data && data.jobId) {
        setJobId(data.jobId);
        pollJobStatus(data.jobId);
        navigate('/processing', { state: { jobId: data.jobId, videoId: youtubeId } });
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsProcessing(false);
    }
  }, [navigate, youtubeId, pollJobStatus, clipLength, layout, selectedTemplate]);

  // When jobId changes, poll for duration
  useEffect(() => {
    if (jobId) {
      pollJobStatus(jobId);
    }
  }, [jobId, pollJobStatus]);

  // Calculate allowed max duration for slider
  const allowedMax = useMemo(() => {
    if (!videoDuration) return userTier === 'paid' ? 600 : 300;
    return Math.min(videoDuration, userTier === 'paid' ? 600 : 300);
  }, [videoDuration, userTier]);

  // Auto-detect language
  const autoDetectLanguage = useCallback(async (videoId) => {
    try {
      const response = await fetch('http://localhost:5000/api/detect-language', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to detect language');
      }

      const data = await response.json();
      return data.languageCode;
    } catch (err) {
      console.error('Language detection error:', err);
      toast.error(`Could not auto-detect language: ${err.message}`);
      return 'en-US'; // Default to English on error
    }
  }, []);

  // Handle URL changes
  const handleUrlChange = useCallback(async (e) => {
    const url = e.target.value;
    setVideoUrl(url);
    if (!url) return;
    const valid = validateYoutubeUrl(url);
    if (valid === 'playlist') {
      toast.error('Playlist URLs are not supported. Please enter a single YouTube video URL.');
      return;
    }
    if (!valid) {
      toast.error('Please enter a valid YouTube video URL.');
      return;
    }
    const vid = getYoutubeId(url);
    if (vid) {
      setLanguageLoading(true);
      const detectedLang = await autoDetectLanguage(vid);
      if (detectedLang) {
        setLanguageCode(detectedLang);
      }
      setLanguageLoading(false);
    }
  }, [getYoutubeId, autoDetectLanguage]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-focus input on mount
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        inputRef.current && inputRef.current.focus();
      }
      if (e.key === 'Enter' && document.activeElement === inputRef.current && showOptions) {
        handleSubmit(e);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showOptions, handleSubmit]);

  const isMobile = screenWidth < 768;

  return (
    <div style={{
      minHeight: '100vh',
      background: isDarkMode ? '#121212' : '#fafbfc',
      fontFamily: 'Inter, Montserrat, Arial, sans-serif',
      display: 'flex',
      flexDirection: 'row',
    }}>
      <Sidebar isMobile={isMobile} isDarkMode={isDarkMode} activePage="dashboard" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar userEmail={user?.email} />
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            minHeight: 'calc(100vh - 64px)',
            background: isDarkMode ? '#121212' : '#fafbfc',
            padding: isMobile ? 10 : 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: !showOptions ? 'column' : (isMobile ? 'column' : 'row'),
              alignItems: !showOptions ? 'center' : 'stretch',
              justifyContent: 'center',
              gap: !showOptions ? 0 : (isMobile ? 24 : 40),
              background: isDarkMode
                ? '#23243a'
                : '#fff',
              borderRadius: 22,
              boxShadow: isDarkMode
                ? '0 4px 32px #23272f88, 0 1.5px 8px #23272f33'
                : '0 4px 32px #e0e7ef55, 0 1.5px 8px #e0e7ef22',
              padding: isMobile ? 18 : (!showOptions ? 40 : 36),
              maxWidth: 900,
              width: '100%',
              minWidth: isMobile ? '98vw' : 340,
              margin: isMobile ? '0 1vw' : '32px 0',
              border: isDarkMode ? '1.5px solid #23272f' : '1.5px solid #e0e7ef',
              overflow: 'visible',
              backdropFilter: isDarkMode ? 'blur(2.5px)' : undefined,
              position: 'relative',
            }}
          >
            {/* LEFT COLUMN (or full card if !showOptions) */}
            <div
              style={{
                flex: 1,
                minWidth: 260,
                maxWidth: !showOptions ? 420 : 400,
                display: 'flex',
                flexDirection: 'column',
                gap: 0,
                alignItems: !showOptions ? 'center' : 'stretch',
                justifyContent: 'space-between',
                margin: !showOptions ? '0 auto' : 0,
                width: !showOptions ? '100%' : undefined,
                height: '100%',
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 8, letterSpacing: 0.1, textAlign: !showOptions ? 'center' : 'left', color: isDarkMode ? '#f3f4f6' : '#1e293b', textShadow: isDarkMode ? '0 1px 8px #0008' : undefined }}>
                  Create YouTube Shorts
                </div>
                <div style={{ color: isDarkMode ? '#c7c7d9' : '#555', fontSize: 14, marginBottom: 18, textAlign: !showOptions ? 'center' : 'left' }}>
                  Transform your YouTube videos into engaging shorts
                </div>
                {/* Video URL */}
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, alignSelf: 'center', color: isDarkMode ? '#e0e7ef' : '#222', textAlign: 'center' }}>YouTube Video URL</div>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Paste your YouTube video URL!"
                  value={videoUrl}
                  onChange={handleUrlChange}
                  style={{
                    width: !showOptions ? 320 : '100%',
                    maxWidth: 420,
                    border: `1.5px solid ${isDarkMode ? '#333' : '#e0e0e0'}`,
                    borderRadius: 10,
                    padding: '12px 14px',
                    fontSize: 14,
                    outline: 'none',
                    background: isDarkMode ? '#18192a' : '#fafbfc',
                    color: isDarkMode ? '#f3f4f6' : '#000',
                    margin: '2 auto 18px auto',
                    boxSizing: 'border-box',
                    boxShadow: isDarkMode ? '0 1px 4px #23272f22' : '0 1px 4px #e0e7ef22',
                    textAlign: 'center',
                    display: 'block',
                    '::placeholder': { color: isDarkMode ? '#b0b0c3' : '#888' },
                  }}
                />
                {showOptions && (
                  <>
                    <LanguageSelector
                      languageCode={languageCode}
                      setLanguageCode={setLanguageCode}
                      languageLoading={languageLoading}
                      isDarkMode={isDarkMode}
                    />
                    <VideoPreview
                      youtubeId={youtubeId}
                      isDarkMode={isDarkMode}
                      isMobile={isMobile}
                    />
                    <ProcessingTimeframe
                      timeframe={timeframe}
                      setTimeframe={setTimeframe}
                      videoDuration={videoDuration}
                      allowedMax={allowedMax}
                      isDarkMode={isDarkMode}
                    />
                    <ClipLengthSelector
                      clipLength={clipLength}
                      setClipLength={setClipLength}
                      isDarkMode={isDarkMode}
                    />
                    <LayoutSelector
                      layout={layout}
                      setLayout={setLayout}
                      userTier={userTier}
                      isDarkMode={isDarkMode}
                    />
                    <AdvancedOptions
                      advanced={advanced}
                      setAdvanced={setAdvanced}
                      isDarkMode={isDarkMode}
                    />
                  </>
                )}
              </div>
            </div>
            {/* RIGHT COLUMN */}
            {showOptions && (
              <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
                <TemplateSelector
                  selectedTemplate={selectedTemplate}
                  setSelectedTemplate={setSelectedTemplate}
                  isDarkMode={isDarkMode}
                />
              </div>
            )}
            {/* Generate Button */}
            {showOptions && (
              <GenerateButton
                isProcessing={isProcessing}
                handleSubmit={handleSubmit}
                isDarkMode={isDarkMode}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewDashboard;