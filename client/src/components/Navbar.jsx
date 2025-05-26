import React, { useState, useRef, useEffect } from "react";
import { WiStars } from "react-icons/wi";
import { MdOutlineNightlightRound, MdOutlineLightMode, MdPerson, MdLogout } from "react-icons/md";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = ({ userEmail }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const profileTooltipRef = useRef(null);
  const firstLetterOfEmail = userEmail?.charAt(0).toUpperCase() || '';

  const handleToggleDropdown = () => setIsDropdownOpen(prev => !prev);
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };
  const showProfileTooltip = () => { if (profileTooltipRef.current) profileTooltipRef.current.style.opacity = 1; };
  const hideProfileTooltip = () => { if (profileTooltipRef.current) profileTooltipRef.current.style.opacity = 0; };
  
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div style={{ 
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '1px 40px 0 40px', height: 60, background: isDarkMode ? '#1a1a1a' : '#fff',
      borderBottom: `1px solid ${isDarkMode ? '#333' : '#f0f0f0'}`, color: isDarkMode ? '#fff' : '#000'
    }}>
      <div style={{ fontWeight: 700, fontSize: 20 }}>Dashboard</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', background: isDarkMode ? '#2a2a2a' : '#fafbfc', borderRadius: 8, overflow: 'hidden', fontSize: 14, fontWeight: 500, border: `1px solid ${isDarkMode ? '#333' : '#f3f3f3'}` }}>
          <div style={{ padding: '6px 14px', color: isDarkMode ? '#888' : '#888' }}>Limited</div>
          <div style={{ padding: '6px 14px', background: isDarkMode ? '#333' : '#fff', color: isDarkMode ? '#fff' : '#222', fontWeight: 700 }}>Free Plan</div>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: isDarkMode ? '#2a2a2a' : '#fff', border: `1px solid ${isDarkMode ? '#333' : '#eee'}`, borderRadius: 8, padding: '6px 14px', fontWeight: 500, cursor: 'pointer', color: isDarkMode ? '#fff' : '#000', transition: 'all 0.3s ease' }}>
          Upgrade <WiStars size={18} />
        </button>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button
            onClick={toggleTheme}
            style={{ background: isDarkMode ? '#2a2a2a' : '#fff', border: `1px solid ${isDarkMode ? '#333' : '#eee'}`, borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: isDarkMode ? '#fff' : '#000', transition: 'all 0.3s ease', transform: isDarkMode ? 'rotate(180deg)' : 'rotate(0deg)' }}
            onMouseEnter={e => { const tooltip = e.currentTarget.nextSibling; if (tooltip) tooltip.style.opacity = 1; }}
            onMouseLeave={e => { const tooltip = e.currentTarget.nextSibling; if (tooltip) tooltip.style.opacity = 0; }}
          >
            <div style={{ transition: 'all 0.3s ease', transform: isDarkMode ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              {isDarkMode ? <MdOutlineLightMode size={20} /> : <MdOutlineNightlightRound size={20} />}
            </div>
          </button>
          <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '120%', background: isDarkMode ? '#333' : '#222', color: '#fff', padding: '6px 14px', borderRadius: 6, fontSize: 13, whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', opacity: 0, pointerEvents: 'none', transition: 'opacity 0.2s ease', zIndex: 10 }}>
            {isDarkMode ? 'Switch to Light' : 'Switch to Dark'}
          </span>
        </div>
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={handleToggleDropdown}
            onMouseEnter={showProfileTooltip}
            onMouseLeave={hideProfileTooltip}
            style={{ background: isDarkMode ? '#2a2a2a' : '#fff', border: `1px solid ${isDarkMode ? '#333' : '#eee'}`, borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 17, color: isDarkMode ? '#fff' : '#222', cursor: 'pointer', position: 'relative', zIndex: 1 }}
          >
            {firstLetterOfEmail}
          </button>
          <span ref={profileTooltipRef} style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '120%', background: isDarkMode ? '#333' : '#222', color: '#fff', padding: '6px 14px', borderRadius: 6, fontSize: 13, whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', opacity: 0, pointerEvents: 'none', transition: 'opacity 0.2s ease', zIndex: 10 }}>Profile</span>
          {isDropdownOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, background: isDarkMode ? '#111' : '#fff', borderRadius: 8, boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.1)', minWidth: 180, zIndex: 20, padding: '8px 0', border: `1px solid ${isDarkMode ? '#333' : '#e0e0e0'}` }}>
              <div style={{ padding: '10px 16px', fontSize: 14, color: isDarkMode ? '#eee' : '#555', borderBottom: `1px solid ${isDarkMode ? '#333' : '#eee'}` }}>{userEmail}</div>
              <a href="/account" style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 14, color: isDarkMode ? '#eee' : '#222', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 400, display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                <MdPerson size={18} /> Account
              </a>
              <button onClick={handleSignOut} style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 14, color: isDarkMode ? '#eee' : '#222', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 400, borderTop: `1px solid ${isDarkMode ? '#333' : '#eee'}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MdLogout size={18} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar; 