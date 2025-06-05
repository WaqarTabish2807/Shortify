import React from 'react';

const DeleteConfirmModal = ({ isDarkMode, onCancel, onDelete }) => (
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
          onClick={onCancel}
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
          }}
        >
          Cancel
        </button>
        <button
          onClick={onDelete}
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
          }}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

export default DeleteConfirmModal; 