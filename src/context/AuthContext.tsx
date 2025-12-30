import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import { storage } from '../services/storage';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial Session Check
    const checkSession = async () => {
      try {
        const currentUser = await storage.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Session check failed", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    // IMPORTANT: We use setTimeout to avoid blocking the auth listener with async calls (deadlock prevention)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setTimeout(async () => {
          // Pass session to avoid re-fetching it
          const currentUser = await storage.getCurrentUser(session);
          setUser(currentUser);
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error) throw error;

    // CRITICAL FIX: Manually update user state immediately after success.
    // This ensures that when this promise resolves, the 'user' state is ready 
    // for the ProtectedRoute, preventing redirects back to login.
    if (data.session) {
      const currentUser = await storage.getCurrentUser(data.session);
      setUser(currentUser);
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: { name }, // Stored in user_metadata
      },
    });
    if (error) throw error;

    // CRITICAL FIX: Update state immediately
    if (data.session) {
      const currentUser = await storage.getCurrentUser(data.session);
      setUser(currentUser);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
