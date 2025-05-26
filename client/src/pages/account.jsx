import React, { useState, useEffect } from 'react';
import { MdPerson, MdSettings, MdErrorOutline, MdCreditCard } from 'react-icons/md';
import { CiWallet } from 'react-icons/ci';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from "../components/Sidebar";
import { supabase } from '../supabase/client';

const Account = () => {
  const [accountSubMenu, setAccountSubMenu] = useState('Profile');
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [manageHover, setManageHover] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('user_credits')
          .select('name')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user details:', error);
        } else {
          setUserDetails(data);
        }
      }
    };

    fetchUserDetails();
  }, [user]);

  const isMobile = screenWidth < 768;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: isDarkMode ? '#121212' : '#fafbfc', flexDirection: isMobile ? 'column' : 'row' }}>
      <Sidebar isMobile={isMobile} isDarkMode={isDarkMode} activePage="account" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar userEmail={user?.email} />
        <div style={{ flex: 1, padding: isMobile ? '16px' : '32px' }}>
          {/* Sub-navigation bar (floating, outside card) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: isDarkMode ? '#181818' : '#f8f8f8',
            borderRadius: 12,
            padding: isMobile ? '6px 4px' : '8px 8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            gap: isMobile ? '12px' : '24px',
            width: isMobile ? '100%' : 'fit-content',
            margin: '0 auto',
            marginBottom: isMobile ? 16 : 32,
            border: isDarkMode ? '1px solid #222' : '1px solid #eee',
          }}>
            <button
              onClick={() => setAccountSubMenu('Profile')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontWeight: accountSubMenu === 'Profile' ? 600 : 500,
                fontSize: isMobile ? 15 : 16,
                color: accountSubMenu === 'Profile' ? (isDarkMode ? '#111' : '#111') : (isDarkMode ? '#aaa' : '#888'),
                background: accountSubMenu === 'Profile' ? '#fff' : 'transparent',
                border: 'none',
                borderRadius: 10,
                boxShadow: accountSubMenu === 'Profile' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                padding: isMobile ? '8px 16px' : '10px 24px',
                transition: 'all 0.15s',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <MdPerson size={20} /> Profile
            </button>
            <button
              onClick={() => setAccountSubMenu('Account')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontWeight: accountSubMenu === 'Account' ? 600 : 500,
                fontSize: isMobile ? 15 : 16,
                color: accountSubMenu === 'Account' ? (isDarkMode ? '#111' : '#111') : (isDarkMode ? '#aaa' : '#888'),
                background: accountSubMenu === 'Account' ? '#fff' : 'transparent',
                border: 'none',
                borderRadius: 10,
                boxShadow: accountSubMenu === 'Account' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                padding: isMobile ? '8px 16px' : '10px 24px',
                transition: 'all 0.15s',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <MdSettings size={20} /> Account
            </button>
            <button
              onClick={() => setAccountSubMenu('Billing')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontWeight: accountSubMenu === 'Billing' ? 600 : 500,
                fontSize: isMobile ? 15 : 16,
                color: accountSubMenu === 'Billing' ? (isDarkMode ? '#111' : '#111') : (isDarkMode ? '#aaa' : '#888'),
                background: accountSubMenu === 'Billing' ? '#fff' : 'transparent',
                border: 'none',
                borderRadius: 10,
                boxShadow: accountSubMenu === 'Billing' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                padding: isMobile ? '8px 16px' : '10px 24px',
                transition: 'all 0.15s',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <CiWallet size={20} /> Billing
            </button>
          </div>
          {/* Card below sub-navigation */}
          <div style={{
            background: isDarkMode ? '#1a1a1a' : '#fff',
            borderRadius: 16,
            boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
            color: isDarkMode ? '#fff' : '#000',
            padding: isMobile ? '18px' : '32px 40px',
            maxWidth: 700,
            margin: '0 auto',
            minHeight: 220,
            border: isDarkMode ? '1px solid #222' : '1px solid #eee',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
          }}>
            {accountSubMenu === 'Profile' && (
              <div>
                <div style={{ marginBottom: isMobile ? '16px' : '24px' }}>
                  <div style={{ fontWeight: 600, fontSize: isMobile ? 18 : 20 }}>Profile</div>
                  <div style={{ fontSize: isMobile ? 13 : 14, color: isDarkMode ? '#aaa' : '#555' }}>Your profile information.</div>
                </div>
                <div style={{ marginBottom: isMobile ? '16px' : '20px' }}>
                  <div style={{ fontSize: isMobile ? 12 : 13, color: isDarkMode ? '#aaa' : '#555', marginBottom: 4 }}>Name</div>
                  <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700 }}>{userDetails?.name || 'Loading...'}</div>
                </div>
                <div>
                  <div style={{ fontSize: isMobile ? 12 : 13, color: isDarkMode ? '#aaa' : '#555', marginBottom: 4 }}>Email</div>
                  <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700 }}>{user?.email || 'Loading...'}</div>
                </div>
              </div>
            )}
            {accountSubMenu === 'Account' && (
              <div>
                <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Account</div>
                <div style={{ color: isDarkMode ? '#aaa' : '#555', fontSize: 16, marginBottom: 24 }}>Manage your account settings.</div>
                <div style={{ color: isDarkMode ? '#bbb' : '#666', fontSize: 15, marginBottom: 32 }}>Your account is currently active and in good standing.</div>
                <div style={{ background: '#fdeaea', borderRadius: 12, padding: '24px 20px', marginTop: 8, border: '1px solid #f8d2d2', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ color: '#e53935', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Danger Zone</div>
                  <div style={{ color: '#e53935', fontSize: 15, marginBottom: 18 }}>Deleting your account is permanent and cannot be undone.</div>
                  <button style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#e53935', color: '#fff', border: 'none', borderRadius: 7, padding: '10px 28px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>
                    <MdErrorOutline size={22} /> Delete Account
                  </button>
                </div>
              </div>
            )}
            {accountSubMenu === 'Billing' && (
              <div>
                <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Billing</div>
                <div style={{ color: isDarkMode ? '#aaa' : '#555', fontSize: 16, marginBottom: 32 }}>Manage your subscription and billing details.</div>
                <div style={{ color: isDarkMode ? '#bbb' : '#666', fontSize: 16, marginBottom: 10 }}>Current Plan</div>
                <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 32 }}>Free Plan</div>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: isDarkMode ? (manageHover ? '#f3f3f3' : '#fff') : (manageHover ? '#222' : '#111'),
                    color: isDarkMode ? '#111' : '#fff',
                    border: isDarkMode ? '2px solid #111' : 'none',
                    borderRadius: 10,
                    padding: '12px 28px',
                    fontWeight: 600,
                    fontSize: 17,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                  onMouseEnter={() => setManageHover(true)}
                  onMouseLeave={() => setManageHover(false)}
                >
                  <MdCreditCard size={22} color={isDarkMode ? '#111' : '#fff'} /> Manage Subscription
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account; 