import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { storage } from '../services/storage';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = storage.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    // Simulate network delay for better UX feel
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const existingUser = storage.findUserByEmail(email);
    if (existingUser && existingUser.passwordHash === pass) {
      storage.login(existingUser);
      setUser(existingUser);
    } else {
      throw new Error('Invalid credentials. Please check your email/password or Register a new account.');
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    if (storage.findUserByEmail(email)) {
      throw new Error('Email already exists. Please login instead.');
    }
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      passwordHash: pass, // In real app, hash this!
    };
    storage.saveUser(newUser);
    storage.login(newUser);
    setUser(newUser);
  };

  const logout = () => {
    storage.logout();
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
