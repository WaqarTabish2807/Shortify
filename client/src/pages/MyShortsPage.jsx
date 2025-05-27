import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const MyShortsPage = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [myShorts, setMyShorts] = useState([]);

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

  const handleDelete = (jobId) => {
    const updated = myShorts.filter(s => s.jobId !== jobId);
    setMyShorts(updated);
    // Remove only this user's shorts from localStorage
    const allShorts = JSON.parse(localStorage.getItem('myShorts') || '[]');
    const newAll = allShorts.filter(s => !(s.jobId === jobId && s.userId === user.id));
    localStorage.setItem('myShorts', JSON.stringify(newAll));
  };

  return (
    <div style={{ minHeight: '100vh', background: isDarkMode ? '#18181b' : '#f6f7fb', padding: 32 }}>
      <div style={{ maxWidth: 900, margin: '0 auto', background: isDarkMode ? '#23272f' : '#fff', borderRadius: 18, boxShadow: '0 4px 32px rgba(0,0,0,0.08)', padding: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 18, color: isDarkMode ? '#fff' : '#222' }}>My Shorts</h1>
        {myShorts.length === 0 ? (
          <div style={{ color: isDarkMode ? '#bbb' : '#666', fontSize: 18, textAlign: 'center', marginTop: 40 }}>
            You haven't generated any shorts yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {myShorts.map((item, idx) => (
              <div key={item.jobId} style={{ background: isDarkMode ? '#18181b' : '#f9fafb', borderRadius: 14, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', position: 'relative' }}>
                <button
                  onClick={() => handleDelete(item.jobId)}
                  style={{
                    position: 'absolute',
                    top: 18,
                    right: 18,
                    background: isDarkMode ? '#2d2d2d' : '#eee',
                    color: isDarkMode ? '#f87171' : '#d32f2f',
                    border: 'none',
                    borderRadius: 6,
                    padding: '6px 14px',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    boxShadow: '0 1px 4px #0001',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                >
                  Remove
                </button>
                <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8, color: isDarkMode ? '#fff' : '#222' }}>
                  Video ID: <span style={{ fontWeight: 400 }}>{item.videoId}</span>
                </div>
                <div style={{ color: isDarkMode ? '#aaa' : '#888', fontSize: 14, marginBottom: 12 }}>
                  Created: {new Date(item.createdAt).toLocaleString()}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                  {item.shorts.map((short, i) => (
                    <div key={i} style={{ minWidth: 220, maxWidth: 320, background: isDarkMode ? '#23272f' : '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <video src={`http://localhost:5000${short}`} controls style={{ width: '100%', borderRadius: 8, marginBottom: 8, background: '#000' }} />
                      <a href={`http://localhost:5000${short}`} download style={{ marginTop: 4, color: '#fff', background: '#2563eb', borderRadius: 6, padding: '6px 18px', fontWeight: 600, fontSize: 15, textDecoration: 'none', transition: 'background 0.2s', boxShadow: '0 1px 4px #0001' }}>Download</a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyShortsPage; 