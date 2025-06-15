import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { VideoProcessingProvider } from './context/VideoProcessingContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Dashboard from './pages/dashboard';
import Pricing from './pages/pricing';
import Account from './pages/account';
import Homepage from './pages/homepage';
import Auth from './components/auth/authForm';
import ProcessingPage from './pages/ProcessingPage';
import ShortsResultPage from './pages/ShortsResultPage';
import MyShortsPage from './pages/MyShortsPage';
import NewDashboard from './pages/newDashboard';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <VideoProcessingProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={
                <PublicRoute>
                  <Homepage />
                </PublicRoute>
              } />
              <Route path="/auth" element={
                <PublicRoute>
                  <Auth />
                </PublicRoute>
              } />

              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/account" element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              } />
              <Route path="/pricing" element={
                <ProtectedRoute>
                  <Pricing />
                </ProtectedRoute>
              } />
              <Route path="/processing" element={
                <ProtectedRoute>
                  <ProcessingPage />
                </ProtectedRoute>
              } />
              <Route path="/shorts-result" element={
                <ProtectedRoute>
                  <ShortsResultPage />
                </ProtectedRoute>
              } />
              <Route path="/my-shorts" element={
                <ProtectedRoute>
                  <MyShortsPage />
                </ProtectedRoute>
              } />
              <Route path="/new-dashboard" element={
                <ProtectedRoute>
                  <NewDashboard />
                </ProtectedRoute>
              } />

              {/* Catch all route - redirect to dashboard if authenticated, homepage if not */}
              <Route path="*" element={<Navigate to="/" replace />} />
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