/**
 * Authentication Context
 * Manages auth state, session persistence, and Firebase auth listener
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@app-types';
import { useAuthStore } from '@store/authStore';
import { authService, setupAuthStateListener } from '@services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component
 * Wraps app and provides auth context
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const { user, isLoading, isAuthenticated, error, setUser, setLoading, setError, clearError, logout: storeLogout } = useAuthStore();

  useEffect(() => {
    /**
     * Set up Firebase auth state listener on mount
     * This will trigger whenever user logs in/out
     */
    const unsubscribe = setupAuthStateListener((authUser) => {
      setUser(authUser);
      setIsInitializing(false);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [setUser]);

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await authService.logout();
      storeLogout();
      setError(null);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Failed to logout');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    user: isInitializing ? null : user,
    isLoading: isInitializing || isLoading,
    isAuthenticated: isInitializing ? false : isAuthenticated,
    error,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

/**
 * useAuth hook
 * Access auth context in any component
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
