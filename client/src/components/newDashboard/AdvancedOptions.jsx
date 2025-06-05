import React from 'react';

const AdvancedOptions = ({ advanced, setAdvanced, isDarkMode }) => {
  return (
    <div style={{ margin: '0 0 14px 0' }}>
      <div style={{ 
        fontWeight: 600, 
        fontSize: 15, 
        marginBottom: 12, 
        marginTop: 18, 
        color: isDarkMode ? '#e0e7ef' : '#222' 
      }}>
        Advanced Options
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
        {[
          { key: 'memeHook', label: 'Meme Hook' },
          { key: 'gameVideo', label: 'Game Video' },
          { key: 'hookTitle', label: 'Hook Title' },
          { key: 'callToAction', label: 'Call To Action' },
          { key: 'backgroundMusic', label: 'Background Music' },
        ].map(opt => (
          <label 
            key={opt.key} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8, 
              fontSize: 14, 
              fontWeight: 600, 
              color: isDarkMode ? '#f3f4f6' : '#222', 
              background: isDarkMode ? '#18192a' : '#f3f4f6', 
              borderRadius: 8, 
              padding: '7px 14px', 
              boxShadow: isDarkMode ? '0 1px 4px #23272f22' : '0 1px 4px #e0e7ef22', 
              cursor: 'pointer', 
              border: isDarkMode ? '1px solid #23272f' : '1px solid #e0e7ef' 
            }}
          >
            <input
              type="checkbox"
              checked={advanced[opt.key]}
              onChange={e => setAdvanced(a => ({ ...a, [opt.key]: e.target.checked }))}
              style={{
                width: 20,
                height: 20,
                accentColor: isDarkMode ? '#fff' : '#000',
                borderRadius: 6,
                border: isDarkMode ? '2px solid #fff' : '2px solid #000',
                marginRight: 6,
                cursor: 'pointer',
              }}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
};

export default AdvancedOptions; 