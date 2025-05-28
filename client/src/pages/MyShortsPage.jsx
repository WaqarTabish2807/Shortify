import React, { useEffect, useState, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { FaEllipsisH, FaTrash, FaDownload } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MyShortsPage = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [myShorts, setMyShorts] = useState([]);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showOptions, setShowOptions] = useState(null);
  const optionsRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!user) {
      setMyShorts([]);
      return;
    }
    const shorts = JSON.parse(localStorage.getItem('myShorts') || '[]');
    // Only show shorts for this user
    const filtered = shorts.filter(s => s.userId === user.id);
    filtered.sort((a, b) => b.createdAt - a.createdAt);
    setMyShorts(filtered);
  }, [user]);

  // Click-away listener for dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(null);
      }
    }
    if (showOptions !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOptions]);

  const handleDelete = (jobId) => {
    const updated = myShorts.filter(s => s.jobId !== jobId);
    setMyShorts(updated);
    // Remove only this user's shorts from localStorage
    const allShorts = JSON.parse(localStorage.getItem('myShorts') || '[]');
    const newAll = allShorts.filter(s => !(s.jobId === jobId && s.userId === user.id));
    localStorage.setItem('myShorts', JSON.stringify(newAll));
    setShowDeleteConfirm(null);
  };

  // Download all shorts with a small delay between each to ensure all are triggered
  const handleDownloadAll = async (shorts) => {
    setShowOptions(null);
    for (let i = 0; i < shorts.length; i++) {
      const short = shorts[i];
      const link = document.createElement('a');
      link.href = `http://localhost:5000${short}`;
      link.download = `short_${i + 1}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // Add a small delay to ensure browser processes each download
      await new Promise(res => setTimeout(res, 300));
    }
    // Wait a bit after last download to ensure all are triggered
    setTimeout(() => {
      toast.dismiss();
      toast.success('All shorts downloaded!');
    }, 5000);
  };

  const isMobile = screenWidth < 768;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: isDarkMode ? '#18181b' : '#f6f7fb', fontFamily: 'Montserrat, Inter, Segoe UI, Arial, sans-serif' }}>
      <Sidebar isMobile={isMobile} isDarkMode={isDarkMode} activePage="my-shorts" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar userEmail={user?.email} />
        <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
        <div style={{ flex: 1, padding: isMobile ? '16px' : '24px' }}>
          <div style={{ 
            maxWidth: 1100, 
            margin: '0 auto', 
            background: isDarkMode ? 'rgba(36, 39, 48, 0.95)' : '#fff', 
            borderRadius: 16,
            boxShadow: isDarkMode ? '0 8px 32px rgba(30,41,59,0.25)' : '0 8px 32px rgba(96,165,250,0.10)',
            padding: '24px 20px',
          }}>
            <h1 style={{ 
              fontSize: 20, 
              fontWeight: 800, 
              marginBottom: 16, 
              color: isDarkMode ? '#fff' : '#1e40af',
              letterSpacing: 0.2,
            }}>
              My Shorts
            </h1>
        {myShorts.length === 0 ? (
              <div style={{ 
                color: isDarkMode ? '#bbb' : '#666', 
                fontSize: 13, 
                textAlign: 'center', 
                marginTop: 32,
                padding: '16px',
                background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                borderRadius: 8,
                border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
              }}>
            You haven't generated any shorts yet.
          </div>
        ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {myShorts.map((item, idx) => (
                  <div key={item.jobId} style={{ 
                    background: isDarkMode ? '#23272f' : '#f9fafb', 
                    borderRadius: 12, 
                    padding: '24px', 
                    boxShadow: isDarkMode ? '0 2px 12px #23272f33' : '0 2px 12px #e0e7ef33',
                    position: 'relative',
                    border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                  }}>
                    <div style={{ 
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      display: 'flex',
                      gap: '8px',
                    }}>
                <button
                        onClick={() => setShowOptions(showOptions === item.jobId ? null : item.jobId)}
                  style={{
                    background: isDarkMode ? '#2d2d2d' : '#eee',
                          color: isDarkMode ? '#fff' : '#666',
                    border: 'none',
                          borderRadius: 4,
                          padding: '4px 8px',
                          marginBottom: 10,
                    fontWeight: 600,
                          fontSize: 11,
                    cursor: 'pointer',
                    boxShadow: '0 1px 4px #0001',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          '&:hover': {
                            background: isDarkMode ? '#3d3d3d' : '#ddd',
                          }
                        }}
                      >
                        <FaEllipsisH size={12} />
                      </button>
                      {showOptions === item.jobId && (
                        <div ref={optionsRef} style={{
                          position: 'absolute',
                          top: '100%',
                          right: 0,
                          background: isDarkMode ? '#2d2d2d' : '#fff',
                          borderRadius: 6,
                          boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                          padding: '4px',
                          zIndex: 10,
                          border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                        }}>
                          <button
                            onClick={() => handleDownloadAll(item.shorts)}
                            style={{
                              display: 'flex',
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              background: 'none',
                              border: 'none',
                              color: isDarkMode ? '#fff' : '#666',
                              fontSize: 12,
                              cursor: 'pointer',
                              textAlign: 'left',
                              whiteSpace: 'nowrap',
                              '&:hover': {
                                background: isDarkMode ? '#3d3d3d' : '#f5f5f5',
                              }
                            }}
                          >
                            <FaDownload size={12} style={{ marginRight: 6 }} /> Download All
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(item.jobId)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              background: 'none',
                              border: 'none',
                              color: '#d32f2f',
                              fontSize: 12,
                              cursor: 'pointer',
                              '&:hover': {
                                background: isDarkMode ? '#3d3d3d' : '#f5f5f5',
                              }
                            }}
                          >
                            <FaTrash size={12} /> Delete
                </button>
                        </div>
                      )}
                </div>
                    <div style={{ 
                      fontWeight: 600, 
                      fontSize: 14, 
                      marginBottom: 8, 
                      color: isDarkMode ? '#fff' : '#222',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}>
                      <span style={{ color: isDarkMode ? '#888' : '#666' }}>Video:</span>
                      <span style={{ fontWeight: 400 }}>{item.videoName || `Video ${idx + 1}`}</span>
                </div>
                    <div style={{ 
                      color: isDarkMode ? '#aaa' : '#888', 
                      fontSize: 11, 
                      marginBottom: 16,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}>
                      <span style={{ color: isDarkMode ? '#888' : '#666' }}>Created:</span>
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 16,
                      justifyContent: 'center',
                    }}>
                  {item.shorts.map((short, i) => (
                        <div key={i} style={{ 
                          minWidth: 180,
                          maxWidth: 200,
                          background: isDarkMode ? '#18181b' : '#fff', 
                          borderRadius: 8, 
                          boxShadow: '0 2px 8px rgba(0,0,0,0.06)', 
                          padding: 12, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center',
                          border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: isDarkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.1)',
                          }
                        }}>
                          <video 
                            src={`http://localhost:5000${short}`} 
                            controls 
                            style={{ 
                              width: '100%', 
                              borderRadius: 6, 
                              marginBottom: 8, 
                              background: '#000',
                              maxHeight: '280px',
                            }} 
                          />
                          <a 
                            href={`http://localhost:5000${short}`} 
                            download 
                            style={{ 
                              marginTop: 4, 
                              color: '#fff', 
                              background: 'linear-gradient(45deg, #1e40af, #3b82f6)',
                              borderRadius: 4, 
                              padding: '6px 12px', 
                              fontWeight: 600, 
                              fontSize: 11, 
                              textDecoration: 'none', 
                              transition: 'all 0.2s ease', 
                              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                              }
                            }}
                          >
                            <FaDownload size={12} /> Download
                          </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
        </div>
      </div>
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: isDarkMode ? '#23272f' : '#fff',
            borderRadius: 12,
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          }}>
            <h3 style={{
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 12,
              color: isDarkMode ? '#fff' : '#222',
            }}>
              Delete Shorts
            </h3>
            <p style={{
              fontSize: 13,
              color: isDarkMode ? '#bbb' : '#666',
              marginBottom: 20,
            }}>
              Are you sure you want to delete these shorts? This action cannot be undone.
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: 'none',
                  background: isDarkMode ? '#2d2d2d' : '#eee',
                  color: isDarkMode ? '#fff' : '#666',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: isDarkMode ? '#3d3d3d' : '#ddd',
                  }
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: 'none',
                  background: '#d32f2f',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: '#b71c1c',
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyShortsPage; 