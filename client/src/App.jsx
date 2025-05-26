import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { VideoProcessingProvider } from './context/VideoProcessingContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/dashboard';
import Pricing from './pages/pricing';
import Account from './pages/account';
import Homepage from './pages/homepage';
import Auth from './components/auth/authForm';

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
      <VideoProcessingProvider>
          <Routes>
            <Route path="/" element={<Homepage />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
            <Route path="/pricing" element={<Pricing />} />
              <Route path="/account" element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              } />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              {/* <Route path="*" element={<NotFound />} /> */}
          </Routes>
          </VideoProcessingProvider>
        </AuthProvider>
        </Router>
    </ThemeProvider>
  );
};

export default App; 