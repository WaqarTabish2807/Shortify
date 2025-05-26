import React from "react";
import { MdDashboard, MdSettings } from "react-icons/md";
import { CiWallet } from "react-icons/ci";
import { FiMessageCircle } from "react-icons/fi";

const Sidebar = ({ isMobile, isDarkMode, activePage }) => (
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
  </div>
);

export default Sidebar; 