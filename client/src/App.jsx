import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { VideoProcessingProvider } from './context/VideoProcessingContext';
import { ThemeProvider } from './context/ThemeContext';
import Dashboard from './pages/dashboard';
import Pricing from './pages/pricing';
import Account from './pages/account';
import Homepage from './pages/homepage';
import AuthForm from './components/auth/authForm';

const App = () => {
  return (
    <ThemeProvider>
      <VideoProcessingProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path='/auth' element={<AuthForm />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/account" element={<Account />} />
          </Routes>
        </Router>
      </VideoProcessingProvider>
    </ThemeProvider>
  );
};

export default App; 