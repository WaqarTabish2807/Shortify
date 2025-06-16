import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabase/client';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ShortsResultHeader from '../components/shorts/ShortsResultHeader';
import UpgradeBanner from '../components/shorts/UpgradeBanner';
import ErrorMessage from '../components/shorts/ErrorMessage';
import ShortsList from '../components/shorts/ShortsList';

const ShortsResultPage = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [jobStatus, setJobStatus] = useState(null);
  const [error, setError] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);

  // On mount, if no state is present, redirect to dashboard
  useEffect(() => {
    if (!location.state?.jobId) {
      navigate('/dashboard', { replace: true });
      return;
    }
  }, [location.state?.jobId, navigate]);

  useEffect(() => {
    const fetchJobStatus = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/job-status/${location.state?.jobId}`);
        const responseData = await response.json();
        
        if (!response.ok) {
          throw new Error(responseData.error || 'Failed to fetch job status');
        }

        setJobStatus(responseData);
        
        if (responseData.status === 'completed' || responseData.status === 'error') {
          clearInterval(pollingInterval);
        }
      } catch (err) {
        setError(err.message);
        clearInterval(pollingInterval);
      }
    };

    if (location.state?.jobId) {
      fetchJobStatus();
      const interval = setInterval(fetchJobStatus, 2000);
      setPollingInterval(interval);
    }

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [location.state?.jobId, pollingInterval]);

  useEffect(() => {
    // This effect now specifically handles saving once the job is completed.
    // It will first check if the shorts are already saved before attempting to insert.
    if (user && jobStatus?.status === 'completed' && jobStatus.shorts && jobStatus.shorts.length > 0 && location.state.jobId) {
      const saveShortsIfNotExists = async () => {
        console.log(`Checking if shorts for job ID ${location.state.jobId} and user ${user.id} already exist...`);
        try {
          // Check if shorts for this job and user already exist
          const { error: fetchError } = await supabase
            .from('shorts')
            .select('id')
            .eq('job_id', location.state.jobId)
            .eq('user_id', user.id);

          if (fetchError) {
            console.error('Error checking for existing shorts:', fetchError);
            // If checking fails, we still attempt to save to be safe, error handling inside insert logic
             attemptInsertShorts();
          } else {
            console.log('No existing shorts found. Proceeding with insert.');
            // If no existing shorts found, proceed with insert
             attemptInsertShorts();
          }
        } catch (err) {
          console.error('Unexpected error during existing shorts check:', err);
        }
      };

      const attemptInsertShorts = async () => {
        console.log('Attempting to insert shorts into Supabase...');
        try {
          const { error: insertError } = await supabase
            .from('shorts')
            .insert({
              job_id: location.state.jobId,
              video_id: jobStatus.videoId,
              shorts: jobStatus.shorts,
              user_id: user.id,
              created_at: new Date().toISOString(),
              video_name: `Video ${location.state.jobId}` // You might want to get the actual video name from YouTube API
            });

          if (insertError) {
            console.error('Supabase insert error details:', insertError);
          } else {
            console.log('Shorts saved successfully to Supabase.');
          }
        } catch (err) {
          console.error('Unexpected error during shorts insert:', err);
        }
      };

      saveShortsIfNotExists();
    }
  }, [user, jobStatus, location.state.jobId]);

  useEffect(() => {
    const fetchShorts = async () => {
      try {
        const { error } = await supabase
          .from('shorts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
      } catch (error) {
        console.error('Error fetching shorts:', error);
      }
    };

    if (user) {
      fetchShorts();
    }
  }, [user]);

  // Determine if user is free tier and show upgrade message
  const isFreeTier = user && user.tier !== 'paid';
  const shortsCount = jobStatus?.shorts?.length || 0;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: isDarkMode ? '#18181b' : '#f6f7fb', fontFamily: 'Montserrat, Inter, Segoe UI, Arial, sans-serif' }}>
      <Sidebar isMobile={false} isDarkMode={isDarkMode} activePage={null} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar userEmail={user?.email} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{
            background: isDarkMode ? 'rgba(36, 39, 48, 0.95)' : '#fff',
            borderRadius: 16,
            boxShadow: isDarkMode ? '0 8px 32px rgba(30,41,59,0.25)' : '0 8px 32px rgba(96,165,250,0.10)',
            padding: '24px 20px',
            maxWidth: 1100,
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <ShortsResultHeader isDarkMode={isDarkMode} />
            {isFreeTier && shortsCount === 2 && (
              <UpgradeBanner isDarkMode={isDarkMode} />
            )}
            <ErrorMessage error={error} />
            {jobStatus?.shorts && jobStatus.shorts.length > 0 ? (
              <ShortsList shorts={jobStatus.shorts} isDarkMode={isDarkMode} />
            ) : (
              <div style={{ 
                color: '#888', 
                textAlign: 'center', 
                fontSize: 13, 
                marginTop: 16,
                padding: '12px 20px',
                background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                borderRadius: 8,
                border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
              }}>
                No shorts found for this job.
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ShortsResultPage; 