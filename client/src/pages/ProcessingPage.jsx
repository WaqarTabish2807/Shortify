import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const green = '#22c55e';
const blue = '#2563eb';
const red = '#d32f2f';
const gray = '#888';

const ProcessingPage = () => {
  const { isDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [jobStatus, setJobStatus] = useState(null);
  const [error, setError] = useState(null);
  const { jobId, pendingUpload } = location.state || {};
  const maxProgress = useRef(0);

  useEffect(() => {
    if (!jobId && !pendingUpload) {
      navigate('/dashboard');
      return;
    }

    if (pendingUpload) {
      setJobStatus({ status: 'initializing' });
      return;
    }

    const checkStatus = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL?.replace(/\/$/, '');
        const response = await fetch(`${apiUrl}/api/job-status/${jobId}`);
        const data = await response.json();
        if (data.success) {
          setJobStatus(data);
          if (data.status === 'completed') {
            setTimeout(() => {
              navigate('/shorts-result', { state: { jobId } });
            }, 3000);
          } else if (data.status === 'error') {
            setError(data.error || 'An error occurred during processing');
          }
          const progress = data.downloadProgress ?? 0;
          if (progress > maxProgress.current) maxProgress.current = progress;
        }
      } catch (err) {
        setError('Failed to fetch job status');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [jobId, pendingUpload, navigate]);

  const progress = jobStatus?.downloadProgress ?? 0;
  if (progress > maxProgress.current) maxProgress.current = progress;
  const displayProgress = maxProgress.current;

  const getStepColor = (step) => {
    if (!jobStatus) return gray;
    
    const status = jobStatus.status;
    if (status === 'error') return red;
    
    switch (step) {
      case 'initializing':
        return status === 'initializing' ? blue : green;
      case 'uploading':
        return status === 'initializing' ? gray : 
               status === 'processing' || status === 'downloaded' || status === 'cutting' || status === 'completed' ? green : blue;
      case 'analyzing':
        return status === 'initializing' || status === 'processing' ? gray :
               status === 'downloaded' || status === 'cutting' || status === 'completed' ? green : blue;
      case 'creating':
        return status === 'initializing' || status === 'processing' || status === 'downloaded' ? gray :
               status === 'cutting' || status === 'completed' ? green : blue;
      default:
        return gray;
    }
  };

  const getStepIcon = (step) => {
    const color = getStepColor(step);
    return color === green ? (
      <CheckCircle2 style={{ width: 20, height: 20 }} />
    ) : color === blue ? (
      <Loader2 className="processing-spin" style={{ width: 20, height: 20 }} />
    ) : (
      <CheckCircle2 style={{ width: 20, height: 20, opacity: 0.3 }} />
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: isDarkMode ? 'linear-gradient(135deg, #18181b 0%, #23272f 100%)' : 'linear-gradient(135deg, #f6f7fb 0%, #e0e7ef 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Montserrat, Inter, Segoe UI, Arial, sans-serif',
    }}>
      <div style={{
        background: isDarkMode ? 'rgba(36, 39, 48, 0.85)' : 'rgba(255,255,255,0.85)',
        borderRadius: 24,
        boxShadow: isDarkMode
          ? '0 8px 32px rgba(30,41,59,0.35)'
          : '0 8px 32px rgba(96,165,250,0.12)',
        padding: '48px 36px',
        maxWidth: 440,
        width: '100%',
        margin: '0 auto',
        backdropFilter: 'blur(12px)',
        border: isDarkMode ? '1.5px solid #23272f' : '1.5px solid #e0e7ef',
        position: 'relative',
      }}>
        <div style={{
          fontSize: '2.1rem',
          fontWeight: 800,
          marginBottom: 10,
          color: isDarkMode ? '#fff' : '#222',
          textAlign: 'center',
          letterSpacing: 0.2,
        }}>
          Processing Your Video
        </div>
        <div style={{
          color: isDarkMode ? '#bdbdbd' : '#666',
          fontSize: '1.08rem',
          marginBottom: 36,
          textAlign: 'center',
          fontWeight: 500,
        }}>
          We're creating engaging shorts from your video. This may take a few minutes.
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          marginBottom: 28,
        }}>
          {jobStatus?.status === 'completed' ? (
            <CheckCircle2 style={{ color: green, width: 36, height: 36 }} />
          ) : jobStatus?.status === 'error' ? (
            <XCircle style={{ color: red, width: 36, height: 36 }} />
          ) : (
            <Loader2 className="processing-spin" style={{ color: blue, width: 36, height: 36 }} />
          )}
          <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: 0.1, color: isDarkMode ? '#fff' : '#222' }}>
            {jobStatus?.status?.charAt(0).toUpperCase() + jobStatus?.status?.slice(1) || 'Initializing...'}
          </span>
        </div>
        <div style={{
          width: '100%',
          height: 10,
          background: isDarkMode ? '#23272f' : '#e5e7eb',
          borderRadius: 7,
          marginBottom: 28,
          overflow: 'hidden',
          boxShadow: isDarkMode ? '0 1px 4px #23272f44' : '0 1px 4px #e0e7ef44',
        }}>
          <div
            style={{
              height: '100%',
              background: jobStatus?.status === 'completed' ? green : blue,
              borderRadius: 7,
              transition: 'width 0.7s cubic-bezier(.4,2,.6,1)',
              width: `${displayProgress}%`
            }}
          />
        </div>
        <div style={{ marginTop: 18 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '1.08rem',
            marginBottom: 10,
            color: getStepColor('initializing'),
            fontWeight: 600,
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
              {getStepIcon('initializing')}
            </span>
            Initializing process
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '1.08rem',
            marginBottom: 10,
            color: getStepColor('uploading'),
            fontWeight: 600,
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
              {getStepIcon('uploading')}
            </span>
            Uploading video
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '1.08rem',
            marginBottom: 10,
            color: getStepColor('analyzing'),
            fontWeight: 600,
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
              {getStepIcon('analyzing')}
            </span>
            Analyzing transcript
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '1.08rem',
            marginBottom: 10,
            color: getStepColor('creating'),
            fontWeight: 600,
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
              {getStepIcon('creating')}
            </span>
            Creating shorts
          </div>
        </div>
        {error && (
          <div style={{
            background: '#ffeaea',
            color: red,
            borderRadius: 8,
            padding: 12,
            marginTop: 18,
            textAlign: 'center',
            fontWeight: 600,
            fontSize: 15,
          }}>
            {error}
          </div>
        )}
        {jobStatus?.segments && (
          <div style={{ marginTop: 18, color: isDarkMode ? '#bbb' : '#444', fontSize: 15, textAlign: 'center' }}>
            <b>{jobStatus.segments.length}</b> engaging segments identified
          </div>
        )}
      </div>
      <style>{`
        .processing-spin {
          animation: processing-spin 1.1s linear infinite;
        }
        @keyframes processing-spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProcessingPage; 