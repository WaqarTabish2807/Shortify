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
import ProcessingPage from './pages/ProcessingPage';
import ShortsResultPage from './pages/ShortsResultPage';
import MyShortsPage from './pages/MyShortsPage';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
              <Route path="/processing" element={<ProcessingPage />} />
              <Route path="/shorts-result" element={<ShortsResultPage />} />
              <Route path="/my-shorts" element={<MyShortsPage />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
            transition={Slide}
            limit={2}
            style={{ zIndex: 9999, fontFamily: 'Montserrat', fontWeight: 400, letterSpacing: 0.05 }}
          />
          </VideoProcessingProvider>
        </AuthProvider>
        </Router>
    </ThemeProvider>
  );
};

export default App; 