import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const initializeUserCredits = async (userId) => {
    try {
      // Check if user already has credits
      const { data: existingUser } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', userId)
        .maybeSingle();

      if (!existingUser) {
        // New user - give 2 free credits and set tier to free
        await supabase
          .from('user_credits')
          .insert([{ user_id: userId, credits: 2, tier: 'free' }]);
        setCredits(2);
      } else {
        setCredits(existingUser.credits);
      }
    } catch (error) {
      console.error('Error initializing user credits:', error);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        initializeUserCredits(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        initializeUserCredits(session.user.id);
      } else {
        setCredits(0);
      }
      setLoading(false);

      if (event === 'SIGNED_OUT') {
        // Clear any stored data
        localStorage.removeItem('supabase.auth.token');
        // Force navigation to auth page
        navigate('/auth', { replace: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setCredits(0);
      // Clear any stored data
      localStorage.removeItem('supabase.auth.token');
      // Force navigation to auth page
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    credits,
    loading,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 