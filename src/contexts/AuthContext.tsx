'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  workosId?: string;
  verified?: boolean;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string, 
    password: string, 
    rememberMe?: boolean, 
    turnstileToken?: string | null
  ) => Promise<any>;
  logout: () => Promise<void>;
  verifyMfa: (factorId: string, code: string) => Promise<any>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('userAuthToken');
        const storedUserData = localStorage.getItem('userData');
        
        if (storedToken && storedUserData) {
          const userData = JSON.parse(storedUserData);
          setUser(userData);
          setToken(storedToken);
          
          // Optionally verify token validity with backend
          try {
            await authApi.getProfile();
          } catch (error) {
            console.error('Token validation failed:', error);
            // Clear invalid auth data
            localStorage.removeItem('userAuthToken');
            localStorage.removeItem('userData');
            setUser(null);
            setToken(null);
          }
        }
      } catch (error) {
        console.error('Error initializing auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  // Login function
  const login = async (
    email: string, 
    password: string, 
    rememberMe = false, 
    turnstileToken?: string | null
  ) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(email, password, rememberMe, turnstileToken);
      
      // If MFA is required, return early
      if (response.requiresMfa) {
        setIsLoading(false);
        return response;
      }
      
      // Store user data and token in state
      setUser(response.user);
      setToken(response.token);
      
      setIsLoading(false);
      return response;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  // Verify MFA code
  const verifyMfa = async (factorId: string, code: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.verifyMfaLogin(factorId, code);
      
      // Store user data and token in state
      setUser(response.user);
      setToken(response.token);
      
      setIsLoading(false);
      return response;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear auth state regardless of API success
      localStorage.removeItem('userAuthToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('userEmail');
      setUser(null);
      setToken(null);
      setIsLoading(false);
    }
  };

  // Update user data
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));
    }
  };

  // Derived authentication state
  const isAuthenticated = !!token && !!user;

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    verifyMfa,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
