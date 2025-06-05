import React, { useRef } from 'react';
import ShortsVideoCard from './ShortsVideoCard';
import { FaEllipsisH, FaTrash, FaDownload } from 'react-icons/fa';

const MyShortsList = ({ myShorts, isDarkMode, showOptions, setShowOptions, showDeleteConfirm, setShowDeleteConfirm, handleDownloadAll, handleDelete, user }) => {
  const optionsRef = useRef(null);

  // Click-away listener for dropdown
  React.useEffect(() => {
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
  }, [showOptions, setShowOptions]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 32,
      width: '100%',
    }}>
      {myShorts.map((item, index) => (
        <div key={item.job_id} style={{
          background: isDarkMode ? '#23272f' : '#f9fafb',
          borderRadius: 12,
          boxShadow: isDarkMode ? '0 4px 20px #23272f33' : '0 4px 20px #e0e7ef33',
          padding: 20,
          position: 'relative',
          border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
        }}>
          <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering card click
                setShowOptions(showOptions === item.job_id ? null : item.job_id);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: isDarkMode ? '#bbb' : '#888',
                cursor: 'pointer',
                fontSize: 18,
              }}
            >
              <FaEllipsisH />
            </button>
            {showOptions === item.job_id && (
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
                  }}
                >
                  <FaDownload size={12} style={{ marginRight: 6 }} /> Download All
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(item.job_id)}
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
            <span style={{ fontWeight: 400 }}>{`Video ${index + 1}`}</span>
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
            {new Date(item.created_at).toLocaleString()}
          </div>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 16,
            justifyContent: 'center',
          }}>
            {item.shorts.map((short, i) => (
              <ShortsVideoCard key={i} short={short} idx={i} isDarkMode={isDarkMode} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyShortsList; 