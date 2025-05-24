import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const check = (isDarkMode) => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 10 }}>
    <circle cx="11" cy="11" r="11" fill="none" />
    <path d="M6 11.5L10 15L16 8.5" stroke={isDarkMode ? '#fff' : '#222'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Pricing = () => {
  const { isDarkMode } = useTheme();
  const [billing, setBilling] = useState('annual');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);
  const userEmail = "waqs2807@gmail.com";

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pricing logic for toggle
  const proPrice = billing === 'annual' ? 49 : 60;
  const proMainSubtext = 'For growing channels';
  const starterMainSubtext = 'Ideal for newcomers';
  const billingSubtext = billing === 'annual' ? 'Billed in one annual payment.' : 'Billed monthly.';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, "SF Pro Display", "Segoe UI", Arial, sans-serif', background: isDarkMode ? '#0a0a0a' : '#fafbfc', flexDirection: isMobile ? 'column' : 'row' }}>
      <Sidebar isMobile={isMobile} isDarkMode={isDarkMode} activePage="pricing" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar userEmail={userEmail} />
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: isMobile ? '16px' : isTablet ? '24px' : '32px',
          background: isDarkMode ? 'radial-gradient(ellipse at center, #18122b 0%, #0a0a0a 100%)' : 'radial-gradient(ellipse at center, #e6e6fa 0%, #fafbfc 100%)' 
        }}>
          <div style={{ 
            width: '100%', 
            maxWidth: isMobile ? '100%' : isTablet ? '90%' : 900, 
            margin: '0 auto',
            padding: isMobile ? '0' : isTablet ? '0 16px' : '0 32px'
          }}>
            {/* Toggle */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginBottom: isMobile ? 24 : isTablet ? 32 : 40, 
              gap: isMobile ? 12 : 18, 
              fontFamily: 'inherit', 
              cursor: 'pointer',
              flexWrap: isMobile ? 'wrap' : 'nowrap'
            }} onClick={() => setBilling(billing === 'annual' ? 'monthly' : 'annual')}>
              {/* Monthly pill */}
              <div style={{
                padding: isMobile ? '6px 18px' : '8px 24px',
                borderRadius: 16,
                background: billing === 'monthly' ? (isDarkMode ? '#fff' : '#fff') : 'transparent',
                color: billing === 'monthly' ? (isDarkMode ? '#18122b' : '#222') : (isDarkMode ? '#bdbdbd' : '#666'),
                fontWeight: billing === 'monthly' ? 700 : 500,
                fontSize: isMobile ? 16 : 18,
                boxShadow: billing === 'monthly' ? '0 2px 8px #0001, 0 0.5px 1.5px #0001' : 'none',
                border: billing === 'monthly' ? (isDarkMode ? '1.5px solid #222' : '1.5px solid #eee') : 'none',
                transition: 'all 0.18s',
                display: 'flex',
                alignItems: 'center',
                minWidth: 70,
                justifyContent: 'center',
              }}>Monthly</div>
              {/* Toggle switch */}
              <div style={{
                width: isMobile ? 48 : 56,
                height: isMobile ? 28 : 32,
                borderRadius: 20,
                background: billing === 'annual' ? '#5636e9' : '#222',
                border: billing === 'monthly' ? '2px solid #fff' : 'none',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                transition: 'background 0.2s, border 0.2s',
                boxSizing: 'border-box',
                margin: '0 8px',
              }}>
                <div style={{
                  position: 'absolute',
                  left: billing === 'annual' ? (isMobile ? 24 : 28) : 2,
                  transition: 'left 0.2s',
                  width: isMobile ? 24 : 28,
                  height: isMobile ? 24 : 28,
                  borderRadius: '50%',
                  background: '#f4f4f4',
                  boxShadow: '0 1px 4px #0002',
                }} />
              </div>
              {/* Annual pill */}
              <div style={{
                padding: isMobile ? '6px 18px' : '8px 24px',
                borderRadius: 16,
                background: billing === 'annual' ? (isDarkMode ? '#fff' : '#fff') : 'transparent',
                color: billing === 'annual' ? (isDarkMode ? '#18122b' : '#222') : (isDarkMode ? '#bdbdbd' : '#666'),
                fontWeight: billing === 'annual' ? 700 : 500,
                fontSize: isMobile ? 16 : 18,
                boxShadow: billing === 'annual' ? '0 2px 8px #0001, 0 0.5px 1.5px #0001' : 'none',
                border: billing === 'annual' ? (isDarkMode ? '1.5px solid #222' : '1.5px solid #eee') : 'none',
                transition: 'all 0.18s',
                display: 'flex',
                alignItems: 'center',
                minWidth: 70,
                justifyContent: 'center',
              }}>Annual</div>
              <span style={{ 
                background: isDarkMode ? '#18122b' : '#e6e6fa', 
                color: isDarkMode ? '#fff' : '#222', 
                fontWeight: 500, 
                fontSize: isMobile ? 13 : 15, 
                borderRadius: 16, 
                padding: isMobile ? '4px 12px' : '6px 16px', 
                marginLeft: 8, 
                opacity: billing === 'annual' ? 1 : 0.5, 
                letterSpacing: 0.1 
              }}>Save 18%</span>
            </div>
            {/* Pricing Cards */}
            <div style={{ 
              display: 'flex', 
              gap: isMobile ? 24 : isTablet ? 32 : 40, 
              justifyContent: 'center', 
              flexWrap: isMobile || isTablet ? 'wrap' : 'nowrap' 
            }}>
              {/* Starter Card */}
              <div style={{ 
                position: 'relative', 
                flex: 1, 
                minWidth: isMobile ? '100%' : isTablet ? '45%' : 320, 
                maxWidth: isMobile ? '100%' : isTablet ? '45%' : 400, 
                background: isDarkMode ? 'rgba(30,30,40,0.95)' : '#fff', 
                borderRadius: isMobile ? 24 : 36, 
                padding: isMobile ? '32px 24px' : isTablet ? '36px 28px' : '44px 36px', 
                color: isDarkMode ? '#fff' : '#222', 
                boxShadow: isDarkMode ? '0 4px 32px 0 #0002' : '0 4px 32px 0 #d1d1e0', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'flex-start', 
                marginBottom: isMobile || isTablet ? 24 : 0, 
                fontFamily: 'inherit', 
                overflow: 'hidden' 
              }}>
                {/* Glow */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  top: '60%',
                  transform: 'translate(-50%, -50%)',
                  width: isMobile ? 320 : isTablet ? 360 : 420,
                  height: isMobile ? 240 : isTablet ? 280 : 320,
                  borderRadius: '50%',
                  background: isDarkMode ? 'radial-gradient(circle, #7b3aed55 0%, #0000 80%)' : 'radial-gradient(circle, #bdaaff33 0%, #fff0 80%)',
                  filter: 'blur(32px)',
                  opacity: isDarkMode ? 0.8 : 0.5,
                  pointerEvents: 'none',
                  zIndex: 0
                }} />
                <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
                  <div style={{ fontWeight: 600, fontSize: isMobile ? 20 : 22, marginBottom: isMobile ? 14 : 18, letterSpacing: 0.1 }}>Starter</div>
                  <div style={{ fontWeight: 700, fontSize: isMobile ? 40 : 48, marginBottom: 0, letterSpacing: -1 }}>$0<span style={{ fontWeight: 400, fontSize: isMobile ? 22 : 26 }}>/month</span></div>
                  <div style={{ color: isDarkMode ? '#bdbdbd' : '#888', fontSize: isMobile ? 16 : 18, margin: isMobile ? '14px 0 24px 0' : '18px 0 32px 0', fontWeight: 500 }}>{starterMainSubtext}</div>
                  <button style={{ 
                    width: '100%', 
                    background: '#7b3aed', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: isMobile ? 12 : 14, 
                    padding: isMobile ? '14px 0' : '16px 0', 
                    fontWeight: 600, 
                    fontSize: isMobile ? 16 : 18, 
                    marginBottom: isMobile ? 14 : 18, 
                    marginTop: isMobile ? 6 : 8, 
                    cursor: 'pointer', 
                    boxShadow: '0 2px 12px #7b3aed44', 
                    transition: 'background 0.2s', 
                    letterSpacing: 0.1 
                  }}>Try Shortify for Free</button>
                  <div style={{ color: isDarkMode ? '#bdbdbd' : '#888', fontSize: isMobile ? 13 : 15, marginBottom: isMobile ? 20 : 28, fontWeight: 500, textAlign: 'center', width: '100%' }}>{billingSubtext}</div>
                  <div style={{ fontWeight: 600, fontSize: isMobile ? 15 : 17, marginBottom: isMobile ? 8 : 10, letterSpacing: 0.1 }}>Including:</div>
                  <div style={{ color: isDarkMode ? '#fff' : '#222', fontSize: isMobile ? 14 : 16, marginBottom: isMobile ? 6 : 8, display: 'flex', alignItems: 'center', fontWeight: 500 }}>{check(isDarkMode)}Up to 2 Shorts per month</div>
                  <div style={{ color: isDarkMode ? '#fff' : '#222', fontSize: isMobile ? 14 : 16, marginBottom: isMobile ? 6 : 8, display: 'flex', alignItems: 'center', fontWeight: 500 }}>{check(isDarkMode)}Basic templates</div>
                  <div style={{ color: isDarkMode ? '#fff' : '#222', fontSize: isMobile ? 14 : 16, marginBottom: isMobile ? 6 : 8, display: 'flex', alignItems: 'center', fontWeight: 500 }}>{check(isDarkMode)}Standard support</div>
                </div>
              </div>
              {/* Pro Card */}
              <div style={{ 
                position: 'relative', 
                flex: 1, 
                minWidth: isMobile ? '100%' : isTablet ? '45%' : 320, 
                maxWidth: isMobile ? '100%' : isTablet ? '45%' : 400, 
                background: isDarkMode ? 'rgba(30,30,40,0.95)' : '#fff', 
                borderRadius: isMobile ? 24 : 36, 
                padding: isMobile ? '32px 24px' : isTablet ? '36px 28px' : '44px 36px', 
                color: isDarkMode ? '#fff' : '#222', 
                boxShadow: isDarkMode ? '0 4px 32px 0 #0002' : '0 4px 32px 0 #d1d1e0', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'flex-start', 
                marginBottom: isMobile || isTablet ? 24 : 0, 
                fontFamily: 'inherit', 
                overflow: 'hidden' 
              }}>
                {/* Glow */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  top: '60%',
                  transform: 'translate(-50%, -50%)',
                  width: isMobile ? 320 : isTablet ? 360 : 420,
                  height: isMobile ? 240 : isTablet ? 280 : 320,
                  borderRadius: '50%',
                  background: isDarkMode ? 'radial-gradient(circle, #7b3aed77 0%, #0000 80%)' : 'radial-gradient(circle, #bdaaff44 0%, #fff0 80%)',
                  filter: 'blur(32px)',
                  opacity: isDarkMode ? 0.9 : 0.6,
                  pointerEvents: 'none',
                  zIndex: 0
                }} />
                <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
                  <div style={{ fontWeight: 600, fontSize: isMobile ? 20 : 22, marginBottom: isMobile ? 14 : 18, letterSpacing: 0.1 }}>Pro</div>
                  <div style={{ fontWeight: 700, fontSize: isMobile ? 40 : 48, marginBottom: 0, letterSpacing: -1 }}>${proPrice}<span style={{ fontWeight: 400, fontSize: isMobile ? 22 : 26 }}>/month</span></div>
                  <div style={{ color: isDarkMode ? '#bdbdbd' : '#888', fontSize: isMobile ? 16 : 18, margin: isMobile ? '14px 0 24px 0' : '18px 0 32px 0', fontWeight: 500 }}>{proMainSubtext}</div>
                  <button style={{ 
                    width: '100%', 
                    background: '#7b3aed', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: isMobile ? 12 : 14, 
                    padding: isMobile ? '14px 0' : '16px 0', 
                    fontWeight: 600, 
                    fontSize: isMobile ? 16 : 18, 
                    marginBottom: isMobile ? 14 : 18, 
                    marginTop: isMobile ? 6 : 8, 
                    cursor: 'pointer', 
                    boxShadow: '0 2px 12px #7b3aed44', 
                    transition: 'background 0.2s', 
                    letterSpacing: 0.1 
                  }}>Try Shortify for Free</button>
                  <div style={{ color: isDarkMode ? '#bdbdbd' : '#888', fontSize: isMobile ? 13 : 15, marginBottom: isMobile ? 20 : 28, fontWeight: 500, textAlign: 'center', width: '100%' }}>{billingSubtext}</div>
                  <div style={{ fontWeight: 600, fontSize: isMobile ? 15 : 17, marginBottom: isMobile ? 8 : 10, letterSpacing: 0.1 }}>Standard plus:</div>
                  <div style={{ color: isDarkMode ? '#fff' : '#222', fontSize: isMobile ? 14 : 16, marginBottom: isMobile ? 6 : 8, display: 'flex', alignItems: 'center', fontWeight: 500 }}>{check(isDarkMode)}50 Shorts per month</div>
                  <div style={{ color: isDarkMode ? '#fff' : '#222', fontSize: isMobile ? 14 : 16, marginBottom: isMobile ? 6 : 8, display: 'flex', alignItems: 'center', fontWeight: 500 }}>{check(isDarkMode)}Premium templates</div>
                  <div style={{ color: isDarkMode ? '#fff' : '#222', fontSize: isMobile ? 14 : 16, marginBottom: isMobile ? 6 : 8, display: 'flex', alignItems: 'center', fontWeight: 500 }}>{check(isDarkMode)}Priority support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing; 