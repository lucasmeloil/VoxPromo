import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, CurrentView } from '../types.js';
import {
  PREMIUM_DURATION_DAYS,
} from '../constants.js';
import { authApi } from '../services/apiService'; // Import the new API service

interface AuthContextType {
  currentUser: User | null;
  isLoadingAuth: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  updateUserSubscription: (userId: string, dateApproved: string) => void;
  incrementCreationCount: () => void;
  checkAuthStatus: () => Promise<void>; // Make explicit this returns a promise
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ====================================================================================================
// IMPORTANT SECURITY WARNING:
// In a real application, user data (including authentication, subscription status, and creation counts)
// MUST be stored on a SECURE BACKEND SERVER and persisted in a database.
// The in-memory Netlify functions in this demo are NOT SECURE and data is NOT PERSISTENT.
// Storing a temporary userId in sessionStorage here is ONLY for demonstration purposes in a frontend-only environment,
// to simulate passing a token to the backend for subsequent requests.
// This approach is NOT PRODUCTION-READY.
// ====================================================================================================

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Function to check auth status from backend
  const checkAuthStatus = useCallback(async () => {
    setIsLoadingAuth(true);
    try {
      // Simulate getting user ID from a temporary client-side session storage (like a JWT in a real app)
      const storedUserJson = sessionStorage.getItem('voxpromo_current_user_temp_session');
      if (storedUserJson) {
        const tempUser = JSON.parse(storedUserJson);
        const user = await authApi.me(); // Fetch full user data from backend
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Falha ao carregar usuário atual do backend:", error);
      setCurrentUser(null);
      sessionStorage.removeItem('voxpromo_current_user_temp_session'); // Clear invalid session
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Periodic check for premium expiration (still client-side for immediate UI update, but backend should also enforce)
  useEffect(() => {
    const interval = setInterval(async () => {
      if (currentUser && currentUser.isPremium && currentUser.premiumExpirationDate) {
        const expirationDate = new Date(currentUser.premiumExpirationDate);
        if (expirationDate <= new Date()) {
          console.log(`Premium expirou para ${currentUser.email}. Desativando.`);
          // This update should ideally be triggered by the backend
          setCurrentUser(prev => prev ? { ...prev, isPremium: false, premiumExpirationDate: null } : null);
          // Force a re-fetch to ensure consistency with backend (if backend were persistent)
          await checkAuthStatus();
        }
      }
    }, 60 * 60 * 1000); // Check every hour

    return () => clearInterval(interval);
  }, [currentUser, checkAuthStatus]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const user = await authApi.login(email, password);
      setCurrentUser(user);
    } catch (err: any) {
      setAuthError(err.message || "Erro ao fazer login.");
      throw err; // Re-throw to be caught by UI
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const user = await authApi.register(email, password);
      setCurrentUser(user); // Auto-login after registration
    } catch (err: any) {
      setAuthError(err.message || "Erro ao registrar.");
      throw err;
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  const logout = useCallback(() => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      // In a real app, this would also hit a logout endpoint to invalidate server-side tokens
      setCurrentUser(null);
      sessionStorage.removeItem('voxpromo_current_user_temp_session'); // Clear temporary client-side session
    } catch (err: any) {
      setAuthError(err.message || "Erro ao sair.");
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      await authApi.resetPassword(email);
      // Backend handles sending instructions
    } catch (err: any) {
      setAuthError(err.message || "Erro ao solicitar recuperação de senha.");
      throw err;
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  const updateUserSubscription = useCallback(async (userId: string, dateApproved: string) => {
    if (!currentUser || currentUser.id !== userId) {
      console.warn('Não é possível atualizar a assinatura: usuário atual incompatível ou não logado.');
      return;
    }

    try {
      const updatedUser = await authApi.updateSubscription(userId, dateApproved);
      setCurrentUser(updatedUser);
      console.log(`Usuário ${userId} premium ativado. Expira em: ${new Date(updatedUser.premiumExpirationDate!).toLocaleString()}`);
    } catch (error) {
      console.error("Erro ao atualizar a assinatura do usuário:", error);
      setAuthError("Erro ao atualizar assinatura.");
    }
  }, [currentUser]);

  const incrementCreationCount = useCallback(async () => {
    if (!currentUser) return;

    try {
      const updatedUser = await authApi.incrementCreationCount(currentUser.id);
      setCurrentUser(updatedUser);
      console.log(`Contagem de criações do usuário ${currentUser.id} incrementada para: ${updatedUser.creationCount}`);
    } catch (error) {
      console.error("Erro ao incrementar a contagem de criações:", error);
      setAuthError("Erro ao atualizar contagem de criações.");
    }
  }, [currentUser]);

  const value = {
    currentUser,
    isLoadingAuth,
    authError,
    login,
    register,
    logout,
    resetPassword,
    updateUserSubscription,
    incrementCreationCount,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};