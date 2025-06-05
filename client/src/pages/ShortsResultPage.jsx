import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../context/ThemeContext';
import ShortsResultHeader from '../components/shorts/ShortsResultHeader';
import UpgradeBanner from '../components/shorts/UpgradeBanner';
import ErrorMessage from '../components/shorts/ErrorMessage';
import ShortsList from '../components/shorts/ShortsList';

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
          setError('Could not fetch shorts.');
        }
      } catch {
        setError('Could not fetch shorts.');
      }
    };
    fetchStatus();
    interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [jobId]);

  useEffect(() => {
    if (!user) return;
    if (jobStatus?.shorts && jobStatus.shorts.length > 0 && jobId && videoId) {
      const prev = JSON.parse(localStorage.getItem('myShorts') || '[]');
      const filtered = prev.filter(s => s.jobId !== jobId || s.userId !== user.id);
      filtered.push({ jobId, videoId, shorts: jobStatus.shorts, createdAt: Date.now(), userId: user.id });
      localStorage.setItem('myShorts', JSON.stringify(filtered));
    }
  }, [jobStatus?.shorts, jobId, videoId, user]);

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
    </div>
  );
};

export default ShortsResultPage; 