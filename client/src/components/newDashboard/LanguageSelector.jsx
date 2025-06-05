import React from 'react';
import Select from 'react-select';
import { FaSpinner } from 'react-icons/fa';
import languageOptions from '../../data/languageOptions.js';

const LanguageSelector = ({ languageCode, setLanguageCode, languageLoading, isDarkMode }) => {
  // Find the selected option object or null
  const selectedOption = languageOptions.find(opt => opt.code === languageCode) || null;
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, marginTop: 8 }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Select
          value={selectedOption}
          onChange={opt => setLanguageCode(opt ? opt.value : null)}
          options={languageOptions.map(opt => ({ value: opt.code, label: opt.label, flag: opt.flag }))}
          menuPlacement="auto"
          isClearable={false}
          styles={{
            control: (base, state) => ({
              ...base,
              background: isDarkMode ? '#18192a' : '#fff',
              borderColor: state.isFocused ? '#a855f7' : (isDarkMode ? '#333' : '#e0e0e0'),
              color: isDarkMode ? '#f3f4f6' : '#222',
              borderRadius: 8,
              minHeight: 32,
              fontWeight: 500,
              fontSize: 15,
              outline: 'none',
              boxShadow: 'none',
              overflowX: 'hidden',
              minWidth: 220,
              width: 220,
              maxWidth: 240,
              padding: 0,
            }),
            menu: base => ({
              ...base,
              background: isDarkMode ? '#23243a' : '#fff',
              color: isDarkMode ? '#f3f4f6' : '#222',
              borderRadius: 10,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              zIndex: 9999,
              border: isDarkMode ? '1px solid #333' : '1px solid #e0e0e0',
              marginTop: 4,
              minWidth: 220,
              width: 220,
              maxWidth: 240,
              overflowX: 'hidden',
              padding: 0,
            }),
            option: (base, state) => ({
              ...base,
              background: state.isSelected
                ? (isDarkMode ? '#a855f7' : '#e3e8f7')
                : state.isFocused
                ? (isDarkMode ? '#23272f' : '#f3f4f6')
                : isDarkMode
                ? '#23243a'
                : '#fff',
              color: isDarkMode ? '#fff' : '#222',
              fontWeight: state.isSelected ? 600 : 500,
              cursor: 'pointer',
              borderRadius: 6,
              margin: '2px 6px',
              padding: '0px 10px',
              fontSize: 15,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              overflowX: 'hidden',
              minWidth: 220,
              width: 220,
              maxWidth: 240,
              whiteSpace: 'nowrap',
            }),
            singleValue: base => ({
              ...base,
              color: isDarkMode ? '#fff' : '#222',
              fontWeight: 600,
              fontSize: 15,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              minWidth: 0,
              width: '100%',
              maxWidth: 220,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              padding: 0,
            }),
          }}
          isSearchable
          components={{
            Option: (props) => (
              <div {...props.innerProps} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', overflowX: 'hidden', whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: 20, fontFamily: 'Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji, Arial, sans-serif' }}>{props.data.flag}</span>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{props.data.label}</span>
              </div>
            ),
            SingleValue: (props) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', overflow: 'hidden', whiteSpace: 'nowrap', padding: 0 }}>
                <span style={{ fontSize: 20, fontFamily: 'Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji, Arial, sans-serif' }}>{props.data.flag}</span>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{props.data.label}</span>
              </div>
            ),
          }}
        />
        {languageLoading && (
          <FaSpinner className="animate-spin" style={{ fontSize: 18, color: isDarkMode ? '#fff' : '#222' }} />
        )}
      </div>
      <button
        type="button"
        onClick={() => setLanguageCode(null)}
        style={{
          background: isDarkMode ? '#fff' : '#000',
          color: isDarkMode ? '#000' : '#fff',
          border: 'none',
          borderRadius: 8,
          fontWeight: 600,
          fontSize: 13,
          padding: '7px 14px',
          cursor: 'pointer',
          boxShadow: isDarkMode ? '0 1px 4px #23272f22' : '0 1px 4px #e0e7ef22',
          whiteSpace: 'nowrap',
        }}
      >
        Reset Preference
      </button>
    </div>
  );
};

export default LanguageSelector; 