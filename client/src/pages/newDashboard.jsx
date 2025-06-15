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

const NewDashboard = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [languageCode, setLanguageCode] = useState("en-US");
  const [timeframe, setTimeframe] = useState([0, 600]);
  const [clipLength, setClipLength] = useState('30s-60s');
  const [selectedTemplate, setSelectedTemplate] = useState('default');
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

  // After submitting the video for processing, poll the /api/job-status/:jobId endpoint to get the video duration.
  const pollJobStatus = useCallback(async (jobId) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL?.replace(/\/$/, '');
      const response = await fetch(`${apiUrl}/api/job-status/${jobId}`);
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
    e.preventDefault();
    if (!videoFile) {
      toast.error('Please upload a video file first.');
      return;
    }

    setIsProcessing(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.access_token) {
        throw new Error('No active session found');
      }

      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('clipLength', clipLength);
      formData.append('layout', layout);
      formData.append('template', selectedTemplate);
      formData.append('languageCode', languageCode);

      // Navigate to processing page immediately
      navigate('/processing', { state: { pendingUpload: true } });

      const apiUrl = process.env.REACT_APP_API_URL?.replace(/\/$/, '');
      const response = await fetch(`${apiUrl}/api/process-video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 403) {
          const errorMsg = 'You are out of credits. Please upgrade to Pro to continue.';
          toast.error(errorMsg, { position: 'top-right' });
          navigate('/dashboard');
        } else {
          throw new Error(data.error || 'Failed to process video');
        }
        return;
      }

      if (data && data.jobId) {
        setJobId(data.jobId);
        pollJobStatus(data.jobId);
        // Update the processing page with the jobId
        navigate('/processing', { state: { jobId: data.jobId } });
      }
    } catch (err) {
      toast.error(err.message);
      navigate('/dashboard');
    } finally {
      setIsProcessing(false);
    }
  }, [videoFile, clipLength, layout, selectedTemplate, languageCode, navigate, pollJobStatus]);

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

  // Handle file change
  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a valid video file.');
      return;
    }

    // Validate file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video file size must be less than 100MB.');
      return;
    }

    setVideoFile(file);
    setVideoUrl(URL.createObjectURL(file));
    setLanguageLoading(true);
    
    // Auto-detect language based on file name or default to English
    setLanguageCode('en-US');
    setLanguageLoading(false);
  }, []);

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
      if (e.key === 'Enter' && document.activeElement === inputRef.current) {
        handleSubmit(e);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit]);

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
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'stretch',
              justifyContent: 'center',
              gap: isMobile ? 24 : 40,
              background: isDarkMode
                ? '#23243a'
                : '#fff',
              borderRadius: 22,
              boxShadow: isDarkMode
                ? '0 4px 32px #23272f88, 0 1.5px 8px #23272f33'
                : '0 4px 32px #e0e7ef55, 0 1.5px 8px #e0e7ef22',
              padding: isMobile ? 18 : 36,
              maxWidth: 900,
              width: '100%',
            }}
          >
            {/* Left Column */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                gap: 24,
                maxWidth: 400,
                width: '100%',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 8, letterSpacing: 0.1, textAlign: 'left', color: isDarkMode ? '#f3f4f6' : '#1e293b', textShadow: isDarkMode ? '0 1px 8px #0008' : undefined }}>
                Create Shorts
              </div>
              <div style={{ color: isDarkMode ? '#c7c7d9' : '#555', fontSize: 14, marginBottom: 18, textAlign: 'left' }}>
                Transform your videos into engaging shorts
              </div>

              {/* Video Upload */}
              <div style={{ width: '100%' }}>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id="video-upload"
                  ref={inputRef}
                />
                <label
                  htmlFor="video-upload"
                  style={{
                    width: '100%',
                    border: `1.5px dashed ${isDarkMode ? '#333' : '#e0e0e0'}`,
                    borderRadius: 10,
                    padding: '20px',
                    fontSize: 14,
                    outline: 'none',
                    background: isDarkMode ? '#18192a' : '#fafbfc',
                    color: isDarkMode ? '#f3f4f6' : '#000',
                    marginBottom: 10,
                    boxSizing: 'border-box',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {videoFile ? (
                    <>
                      <div style={{ fontWeight: 600, color: isDarkMode ? '#e0e7ef' : '#222' }}>
                        {videoFile.name}
                      </div>
                      <div style={{ fontSize: 12, color: isDarkMode ? '#888' : '#666' }}>
                        {(videoFile.size / (1024 * 1024)).toFixed(1)}MB
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 16, color: isDarkMode ? '#e0e7ef' : '#222' }}>
                        Click to upload video
                      </div>
                      <div style={{ fontSize: 12, color: isDarkMode ? '#888' : '#666' }}>
                        MP4, MOV, or AVI (max 100MB)
                      </div>
                    </>
                  )}
                </label>
              </div>

              {/* Video Preview */}
              {videoFile && (
                <VideoPreview videoUrl={videoUrl} isDarkMode={isDarkMode} />
              )}

              {/* Language Selector */}
              <LanguageSelector
                languageCode={languageCode}
                setLanguageCode={setLanguageCode}
                languageLoading={languageLoading}
                isDarkMode={isDarkMode}
              />

              {/* Process Button */}
              <button
                onClick={handleSubmit}
                disabled={!videoFile || isProcessing}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 6,
                  border: 'none',
                  background: !videoFile || isProcessing
                    ? isDarkMode ? '#333' : '#e0e0e0'
                    : isDarkMode ? '#3b82f6' : '#2563eb',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: !videoFile || isProcessing ? 'not-allowed' : 'pointer',
                  opacity: !videoFile || isProcessing ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isProcessing ? 'Processing...' : 'Process Video'}
              </button>
            </div>

            {/* Right Column */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
                maxWidth: 400,
                width: '100%',
              }}
            >
              {/* Processing Timeframe */}
              <ProcessingTimeframe
                timeframe={timeframe}
                setTimeframe={setTimeframe}
                allowedMax={allowedMax}
                isDarkMode={isDarkMode}
              />

              {/* Clip Length Selector */}
              <ClipLengthSelector
                clipLength={clipLength}
                setClipLength={setClipLength}
                isDarkMode={isDarkMode}
              />

              {/* Layout Selector */}
              <LayoutSelector
                layout={layout}
                setLayout={setLayout}
                isDarkMode={isDarkMode}
              />

              {/* Template Selector */}
              <TemplateSelector
                selectedTemplate={selectedTemplate}
                setSelectedTemplate={setSelectedTemplate}
                isDarkMode={isDarkMode}
              />

              {/* Advanced Options */}
              <AdvancedOptions
                advanced={advanced}
                setAdvanced={setAdvanced}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewDashboard;