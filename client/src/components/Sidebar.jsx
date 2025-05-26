import React from "react";
import { MdDashboard, MdSettings } from "react-icons/md";
import { CiWallet } from "react-icons/ci";
import { FiMessageCircle } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ isMobile, isDarkMode, activePage }) => {
  const { credits } = useAuth();
  const maxCredits = 2; // Maximum credits a user can have
  const creditPercentage = (credits / maxCredits) * 100;

  return (
    <div style={{
      width: isMobile ? '100%' : 220,
      background: isDarkMode ? '#1a1a1a' : '#fff',
      borderRight: isMobile ? 'none' : `1px solid ${isDarkMode ? '#333' : '#f0f0f0'}`,
      borderBottom: isMobile ? `1px solid ${isDarkMode ? '#333' : '#f0f0f0'}` : 'none',
      padding: isMobile ? '16px' : '32px 0 0 0',
      display: 'flex',
      flexDirection: isMobile ? 'row' : 'column',
      alignItems: isMobile ? 'center' : 'flex-start',
      justifyContent: isMobile ? 'space-around' : 'flex-start',
    }}>
      <div style={{ fontWeight: 700, fontSize: isMobile ? 18 : 22, marginBottom: isMobile ? 0 : 40, letterSpacing: 0.5, color: isDarkMode ? '#fff' : '#000', marginRight: isMobile ? 20 : 0, marginLeft: isMobile ? 20 : 55 }}>
        Shortify
      </div>
      <nav style={{ width: isMobile ? 'auto' : '100%', display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: isMobile ? 20 : 8 }}>
        <a href="/dashboard" style={{
          display: 'flex', alignItems: 'center', padding: '12px 32px',
          background: activePage === 'dashboard' ? (isDarkMode ? '#2a2a2a' : '#f6f7f9') : 'transparent',
          borderRadius: 8, color: activePage === 'dashboard' ? (isDarkMode ? '#fff' : '#222') : '#555',
          fontWeight: 500, textDecoration: 'none', marginBottom: 8
        }}>
          <span style={{ display: 'flex', alignItems: 'center', fontSize: 22, marginRight: 14 }}><MdDashboard /></span>
          Dashboard
        </a>
        <a href="/pricing" style={{
          display: 'flex', alignItems: 'center', padding: '12px 32px',
          background: activePage === 'pricing' ? (isDarkMode ? '#2a2a2a' : '#f6f7f9') : 'transparent',
          borderRadius: 8, color: activePage === 'pricing' ? (isDarkMode ? '#fff' : '#222') : '#555',
          fontWeight: 500, textDecoration: 'none', marginBottom: 8
        }}>
          <span style={{ display: 'flex', alignItems: 'center', fontSize: 22, marginRight: 14 }}><CiWallet /></span>
          Pricing
        </a>
        <a href="/account" style={{
          display: 'flex', alignItems: 'center', padding: '12px 32px',
          background: activePage === 'account' ? (isDarkMode ? '#2a2a2a' : '#f6f7f9') : 'transparent',
          borderRadius: 8, color: activePage === 'account' ? (isDarkMode ? '#fff' : '#222') : '#555',
          fontWeight: 500, textDecoration: 'none'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', fontSize: 22, marginRight: 14 }}><MdSettings /></span>
          Account
        </a>
      </nav>
      {/* Community Section */}
      <div style={{ marginTop: isMobile ? 0 : 40, width: '100%' }}>
        <div style={{ color: isDarkMode ? '#aaa' : '#888', fontWeight: 500, fontSize: 16, margin: isMobile ? '0 0 8px 16px' : '0 0 8px 32px' }}>Community</div>
        <a href="https://discord.com/" target="_blank" rel="noopener noreferrer" style={{
          display: 'flex', alignItems: 'center', padding: '12px 32px',
          gap: 14,  
          textDecoration: 'none',
          color: isDarkMode ? '#fff' : '#111',
          fontWeight: 500,
          borderRadius: 8,
          background: 'transparent',
          margin: 0
        }}>
          <FiMessageCircle size={22} style={{ minWidth: 22, display: 'flex', alignItems: 'center' }} /> Discord
        </a>
      </div>
      {/* Credits Display */}
      <div style={{ 
        marginTop: isMobile ? 0 : 40,
        width: '100%',
        padding: isMobile ? '0 8px' : '0 12px',
        boxSizing: 'border-box'
      }}>
        <div style={{ color: isDarkMode ? '#aaa' : '#888', fontWeight: 500, fontSize: 16, margin: isMobile ? '0 0 8px 16px' : '0 0 8px 23px' }}>Credits</div>
        <div style={{
          background: isDarkMode ? '#2a2a2a' : '#f6f7f9',
          borderRadius: 8,
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <CiWallet size={22} style={{ color: isDarkMode ? '#fff' : '#222' }} />
              <span style={{ 
                color: isDarkMode ? '#fff' : '#222',
                fontWeight: 700,
                fontSize: 16
              }}>
                {credits} / {maxCredits}
              </span>
            </div>
            <span style={{
              color: isDarkMode ? '#aaa' : '#666',
              fontSize: 14
            }}>
              {creditPercentage}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: 6,
            background: isDarkMode ? '#333' : '#e0e0e0',
            borderRadius: 3,
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${creditPercentage}%`,
              height: '100%',
              background: credits > 0 ? '#4CAF50' : '#f44336',
              borderRadius: 3,
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 