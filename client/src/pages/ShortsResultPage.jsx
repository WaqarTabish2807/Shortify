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
            <div style={{ 
              fontSize: 20, 
              fontWeight: 800, 
              marginBottom: 6, 
              color: isDarkMode ? '#fff' : '#1e40af', 
              textAlign: 'center', 
              letterSpacing: 0.2,
              padding: '0 20px',
            }}>
              Your Shorts Are Ready!
            </div>
            <div style={{ 
              color: isDarkMode ? '#bdbdbd' : '#666', 
              fontSize: 13, 
              marginBottom: 16, 
              textAlign: 'center', 
              fontWeight: 500,
              maxWidth: '400px',
              lineHeight: '1.5',
            }}>
              Download or preview your generated shorts below.
            </div>
            {isFreeTier && shortsCount === 2 && (
              <div style={{ 
                color: '#f59e42', 
                background: isDarkMode ? 'rgba(245, 158, 66, 0.1)' : '#fffbe6', 
                border: isDarkMode ? '1px solid rgba(245, 158, 66, 0.2)' : '1px solid #ffe0b2', 
                borderRadius: 6, 
                padding: '8px 16px', 
                marginBottom: 12, 
                fontWeight: 600, 
                fontSize: 12,
                backdropFilter: 'blur(8px)',
                boxShadow: isDarkMode ? '0 2px 8px rgba(245, 158, 66, 0.1)' : '0 2px 8px rgba(245, 158, 66, 0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span>Free users can generate up to 2 shorts per video.</span>
                <a 
                  href="/pricing" 
                  style={{ 
                    display: 'inline-block',
                    background: '#7b3aed',
                    color: '#fff',
                    padding: '4px 12px',
                    borderRadius: 4,
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: 12,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    }
                  }}
                >
                  Upgrade to Pro
                </a>
              </div>
            )}
            {error && <div style={{ color: '#d32f2f', marginBottom: 10, fontWeight: 600, fontSize: 12 }}>{error}</div>}
            {jobStatus?.shorts && jobStatus.shorts.length > 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                gap: 12,
                overflowX: 'auto',
                width: '100%',
                paddingBottom: 4,
                scrollbarWidth: 'thin',
                justifyContent: 'center',
                flexWrap: 'wrap',
                maxWidth: '900px',
                margin: '0 auto',
                '&::-webkit-scrollbar': {
                  height: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: isDarkMode ? '#23272f' : '#f1f1f1',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: isDarkMode ? '#444' : '#ccc',
                  borderRadius: '3px',
                },
              }}>
                {jobStatus.shorts.map((url, idx) => (
                  <div key={url} style={{
                    minWidth: 180,
                    maxWidth: 200,
                    background: isDarkMode ? '#23272f' : '#f9fafb',
                    borderRadius: 8,
                    boxShadow: isDarkMode ? '0 2px 12px #23272f33' : '0 2px 12px #e0e7ef33',
                    padding: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transition: 'all 0.2s ease',
                    border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: isDarkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.1)',
                    }
                  }}>
                    <video
                      src={`http://localhost:5000${url}`}
                      controls
                      style={{ 
                        width: '100%', 
                        height: 'auto',
                        maxHeight: '280px',
                        borderRadius: 6, 
                        marginBottom: 6, 
                        background: '#000', 
                        boxShadow: isDarkMode ? '0 1px 6px #23272f44' : '0 1px 6px #e0e7ef44',
                        transition: 'all 0.2s ease',
                      }}
                    />
                    <a
                      href={`http://localhost:5000${url}`}
                      download={`short-${idx + 1}.mp4`}
                      style={{
                        display: 'inline-block',
                        background: 'linear-gradient(45deg, #1e40af, #3b82f6)',
                        color: '#fff',
                        padding: '4px 10px',
                        borderRadius: 4,
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: 11,
                        marginTop: 2,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        }
                      }}
                    >
                      Download Short {idx + 1}
                    </a>
                  </div>
                ))}
              </div>
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