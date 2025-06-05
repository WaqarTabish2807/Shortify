import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const GenerateButton = ({ isProcessing, handleSubmit, isDarkMode }) => {
  return (
    <div style={{
      position: 'absolute',
      left: '50%',
      bottom: 10,
      transform: 'translateX(-50%)',
      display: 'flex',
      justifyContent: 'center',
      width: '100%',
      zIndex: 10,
    }}>
      <button
        type="button"
        style={{
          background: isDarkMode ? 'white' : '#111',
          color: isDarkMode ? '#111' : 'white',
          border: 'none',
          borderRadius: 6,
          fontWeight: 600,
          fontSize: 15,
          cursor: isProcessing ? 'not-allowed' : 'pointer',
          height: 44,
          minWidth: 160,
          maxWidth: 200,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isProcessing ? 0.7 : 1,
          boxShadow: isDarkMode ? '0 1px 4px #23272f22' : '0 1px 4px #e0e7ef22',
        }}
        onClick={handleSubmit}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaSpinner className="animate-spin" style={{ marginRight: 8 }} />
            Processing...
          </span>
        ) : (
          'Generate Shorts'
        )}
      </button>
    </div>
  );
};

export default GenerateButton; 