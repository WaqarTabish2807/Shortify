import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../context/ThemeContext';

const ShortsResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { jobId, videoId } = location.state || {};
  const [jobStatus, setJobStatus] = useState(null);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { isDarkMode } = useTheme();

  // Fallback: persist jobId and videoId in localStorage on navigation
  useEffect(() => {
    if (jobId && videoId) {
      localStorage.setItem('lastShortsJob', JSON.stringify({ jobId, videoId }));
    }
  }, [jobId, videoId]);

  // On mount, if jobId/videoId missing, try to get from localStorage
  let fallback = {};
  if (!jobId || !videoId) {
    try {
      fallback = JSON.parse(localStorage.getItem('lastShortsJob') || '{}');
    } catch {}
  }
  const effectiveJobId = jobId || fallback.jobId;
  const effectiveVideoId = videoId || fallback.videoId;

  useEffect(() => {
    if (!effectiveJobId) {
      navigate('/dashboard');
      return;
    }
    let interval;
    const fetchStatus = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/job-status/${effectiveJobId}`);
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
  }, [effectiveJobId, navigate]);

  useEffect(() => {
    if (!user) return;
    if (jobStatus?.shorts && jobStatus.shorts.length > 0 && effectiveJobId && effectiveVideoId) {
      const prev = JSON.parse(localStorage.getItem('myShorts') || '[]');
      const filtered = prev.filter(s => s.jobId !== effectiveJobId || s.userId !== user.id);
      filtered.push({ jobId: effectiveJobId, videoId: effectiveVideoId, shorts: jobStatus.shorts, createdAt: Date.now(), userId: user.id });
      localStorage.setItem('myShorts', JSON.stringify(filtered));
      // Clean up fallback
      localStorage.removeItem('lastShortsJob');
    }
  }, [jobStatus?.shorts, effectiveJobId, effectiveVideoId, user]);

  // Determine if user is free tier and show upgrade message
  const isFreeTier = user && user.tier !== 'paid'; // You may need to fetch tier if not in context
  const shortsCount = jobStatus?.shorts?.length || 0;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: isDarkMode ? '#18181b' : '#f6f7fb', fontFamily: 'Montserrat, Inter, Segoe UI, Arial, sans-serif' }}>
      <Sidebar isMobile={false} isDarkMode={isDarkMode} activePage={null} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar userEmail={user?.email} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <div style={{
            background: isDarkMode ? 'rgba(36, 39, 48, 0.95)' : '#fff',
            borderRadius: 22,
            boxShadow: isDarkMode ? '0 8px 32px rgba(30,41,59,0.25)' : '0 8px 32px rgba(96,165,250,0.10)',
            padding: '40px 32px',
            maxWidth: 1100,
            width: '100%',
            margin: '0 auto',
            minHeight: 420,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 10, color: isDarkMode ? '#fff' : '#222', textAlign: 'center', letterSpacing: 0.2 }}>
              Your Shorts Are Ready!
            </div>
            <div style={{ color: isDarkMode ? '#bdbdbd' : '#666', fontSize: 18, marginBottom: 28, textAlign: 'center', fontWeight: 500 }}>
              Download or preview your generated shorts below.
            </div>
            {isFreeTier && shortsCount === 2 && (
              <div style={{ color: '#f59e42', background: isDarkMode ? '#23272f' : '#fffbe6', border: isDarkMode ? '1.5px solid #444' : '1.5px solid #ffe0b2', borderRadius: 10, padding: '12px 22px', marginBottom: 24, fontWeight: 600, fontSize: 16 }}>
                Free users can generate up to 2 shorts per video. <a href="/pricing" style={{ color: '#2563eb', textDecoration: 'underline', marginLeft: 6 }}>Upgrade to Pro</a> for more!
              </div>
            )}
            {error && <div style={{ color: '#d32f2f', marginBottom: 16, fontWeight: 600 }}>{error}</div>}
            {jobStatus?.shorts && jobStatus.shorts.length > 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                gap: 32,
                overflowX: 'auto',
                width: '100%',
                paddingBottom: 8,
                scrollbarWidth: 'thin',
              }}>
                {jobStatus.shorts.map((url, idx) => (
                  <div key={url} style={{
                    minWidth: 320,
                    maxWidth: 340,
                    background: isDarkMode ? '#23272f' : '#f9fafb',
                    borderRadius: 16,
                    boxShadow: isDarkMode ? '0 2px 12px #23272f33' : '0 2px 12px #e0e7ef33',
                    padding: 18,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transition: 'box-shadow 0.2s',
                  }}>
                    <video
                      src={`http://localhost:5000${url}`}
                      controls
                      style={{ width: '100%', borderRadius: 10, marginBottom: 12, background: '#000', boxShadow: isDarkMode ? '0 1px 6px #23272f44' : '0 1px 6px #e0e7ef44' }}
                    />
                    <a
                      href={`http://localhost:5000${url}`}
                      download={`short-${idx + 1}.mp4`}
                      style={{
                        display: 'inline-block',
                        background: '#2563eb',
                        color: '#fff',
                        padding: '10px 22px',
                        borderRadius: 8,
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontSize: 16,
                        marginTop: 4,
                        boxShadow: '0 1px 4px #0001',
                        transition: 'background 0.2s',
                      }}
                    >
                      Download Short {idx + 1}
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#888', textAlign: 'center', fontSize: 18, marginTop: 32 }}>No shorts found for this job.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortsResultPage; 