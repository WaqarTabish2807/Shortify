import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";
import { FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = screenWidth < 768;

  const handleFileChange = async (e) => {
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
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!videoFile) {
      toast.error('Please upload a video file first.');
      return;
    }

    setIsProcessing(true);
    setIsButtonDisabled(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.access_token) {
        throw new Error('No active session found');
      }

      const formData = new FormData();
      formData.append('video', videoFile);

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
        } else {
          throw new Error(data.error || 'Failed to process video');
        }
        return;
      }

      if (data && data.jobId) {
        navigate('/processing', { state: { jobId: data.jobId } });
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsProcessing(false);
      setIsButtonDisabled(false);
    }
  }, [videoFile, navigate]);

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
            <div style={{ fontWeight: 700, fontSize: isMobile ? 18 : 22, marginBottom: isMobile ? 16 : 8 }}>Create Shorts</div>
            <div style={{ color: isDarkMode ? '#888' : '#888', fontSize: isMobile ? 14 : 15, marginBottom: isMobile ? 20 : 24 }}>Transform your videos into engaging shorts</div>
            
            {/* Video Upload */}
            <div style={{ textAlign: 'left', fontWeight: 500, fontSize: isMobile ? 13 : 14, marginBottom: isMobile ? 4 : 6 }}>Upload Video</div>
            <div style={{
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
              ':hover': {
                borderColor: isDarkMode ? '#444' : '#ccc',
              }
            }}>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%'
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
            )}

            {/* Process Button */}
            <button
              onClick={handleSubmit}
              disabled={isButtonDisabled || !videoFile}
              style={{
                width: '100%',
                padding: '12px',
                background: isButtonDisabled || !videoFile ? (isDarkMode ? '#333' : '#e0e0e0') : '#2563eb',
                color: isButtonDisabled || !videoFile ? (isDarkMode ? '#666' : '#999') : '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                cursor: isButtonDisabled || !videoFile ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.2s ease'
              }}
            >
              {isProcessing ? (
                <>
                  <FaSpinner className="spin" />
                  Processing...
                </>
              ) : (
                'Process Video'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;