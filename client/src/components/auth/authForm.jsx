import React, { useState } from 'react';
import LoginForm from './loginForm';
import RegisterForm from './RegisterForm';

const AuthForm = () => {
  const [isSignup, setIsSignup] = useState(false);

  const containerStyle = {
    display: 'flex',
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(to bottom right, #fbcfe8, #e9d5ff)', // Equivalent to from-pink-100 to-purple-100
  };

  const cardStyle = {
    width: '100%',
    maxWidth: '28rem', // Equivalent to max-w-md
    padding: '2rem', // Equivalent to p-8
    borderRadius: '1rem', // Equivalent to rounded-xl
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // Equivalent to shadow-lg
    backgroundColor: 'rgba(255, 255, 255, 0.6)', // Equivalent to bg-white/60
    border: '1px solid #e5e7eb', // Equivalent to border border-gray-200
    backdropFilter: 'blur(12px)', // Equivalent to backdrop-blur-md
  };

  const headerContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '1.5rem', // Equivalent to mb-6
  };

  const badgeStyle = {
    padding: '0.25rem 0.75rem', // Equivalent to px-3 py-1
    backgroundColor: '#fde68a', // Equivalent to bg-yellow-200
    color: '#b45309', // Equivalent to text-yellow-800
    borderRadius: '9999px', // Equivalent to rounded-full
    fontSize: '0.75rem', // Equivalent to text-xs
    fontWeight: '600', // Equivalent to font-semibold
    marginBottom: '0.75rem', // Equivalent to mb-3
  };

  const headingStyle = {
    fontSize: '1.875rem', // Equivalent to text-3xl
    fontWeight: 'bold', // Equivalent to font-bold
    color: '#111827', // Equivalent to text-gray-900
    marginBottom: '0.5rem', // Equivalent to mb-2
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={headerContainerStyle}>
          <span style={badgeStyle}> Shortify Login</span>
          <h2 style={headingStyle}>Welcome!</h2>
        </div>
        {isSignup ? (
          <RegisterForm onSwitchToLogin={() => setIsSignup(false)} />
        ) : (
          <LoginForm onSwitchToRegister={() => setIsSignup(true)} />
        )}
      </div>
    </div>
  );
};

export default AuthForm;

