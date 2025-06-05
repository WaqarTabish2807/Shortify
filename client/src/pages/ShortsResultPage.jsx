import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../context/ThemeContext';
import ShortsResultHeader from '../components/shorts/ShortsResultHeader';
import UpgradeBanner from '../components/shorts/UpgradeBanner';
import ErrorMessage from '../components/shorts/ErrorMessage';
import ShortsList from '../components/shorts/ShortsList';
import { supabase } from '../supabase/client';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ShortsResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { jobId, videoId } = location.state || {};
  const [jobStatus, setJobStatus] = useState(null);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { isDarkMode } = useTheme();

  // On mount, if no state is present, redirect to dashboard
  useEffect(() => {
    if (!jobId || !videoId) {
      navigate('/dashboard', { replace: true });
      return;
    }
  }, [jobId, videoId, navigate]);

  useEffect(() => {
    if (!jobId) {
      return;
    }
    let interval;
    const fetchStatus = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/job-status/${jobId}`);
        const data = await res.json();
        if (data.success) {
          setJobStatus(data);
          // Stop polling if completed or error
          if (data.status === 'completed' || data.status === 'error') {
            clearInterval(interval);
          }
        } else {
          // Handle cases where the API returns success: false but no specific error message
          setError(data.error || 'Could not fetch shorts status.');
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Error fetching job status:', err);
        setError(`Could not fetch shorts status: ${err.message || 'Unknown error'}`);
        clearInterval(interval);
      }
    };

    fetchStatus();
    // Poll status every 3 seconds
    interval = setInterval(fetchStatus, 3000);

    return () => clearInterval(interval);
  }, [jobId]); // Depend on jobId

  useEffect(() => {
    // This effect now specifically handles saving once the job is completed.
    // It will first check if the shorts are already saved before attempting to insert.
    if (user && jobStatus?.status === 'completed' && jobStatus.shorts && jobStatus.shorts.length > 0 && jobId && videoId) {
      const saveShortsIfNotExists = async () => {
        console.log(`Checking if shorts for job ID ${jobId} and user ${user.id} already exist...`);
        try {
          // Check if shorts for this job and user already exist
          const { data: existingShorts, error: fetchError } = await supabase
            .from('shorts')
            .select('id')
            .eq('job_id', jobId)
            .eq('user_id', user.id);

          if (fetchError) {
            console.error('Error checking for existing shorts:', fetchError);
            // If checking fails, we still attempt to save to be safe, error handling inside insert logic
             attemptInsertShorts();
          } else if (existingShorts && existingShorts.length > 0) {
            console.log(`Shorts for job ID ${jobId} and user ${user.id} already exist. Skipping insert.`);
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
          const { data, error: insertError } = await supabase
            .from('shorts')
            .insert({
              job_id: jobId,
              video_id: videoId,
              shorts: jobStatus.shorts,
              user_id: user.id,
              created_at: new Date().toISOString(),
              video_name: `Video ${jobId}` // You might want to get the actual video name from YouTube API
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
  }, [user, jobStatus, jobId, videoId]); // Depend on relevant state and props

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