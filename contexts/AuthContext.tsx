import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, CurrentView } from '../types';
import {
  SESSION_STORAGE_USERS_KEY,
  SESSION_STORAGE_CURRENT_USER_KEY,
  PREMIUM_DURATION_DAYS,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  MAX_FREE_CREATIONS,
  // Fix: Import SESSION_STORAGE_HISTORY_KEY to be used in logout function
  SESSION_STORAGE_HISTORY_KEY
} from '../constants';

interface AuthContextType {
  currentUser: User | null;
  isLoadingAuth: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  // loginWithGoogle: () => Promise<void>; // Removed Google Login
  updateUserSubscription: (userId: string, dateApproved: string) => void;
  incrementCreationCount: () => void;
  checkAuthStatus: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ====================================================================================================
// IMPORTANT SECURITY WARNING:
// In a real application, user data (including authentication, subscription status, and creation counts)
// MUST be stored on a SECURE BACKEND SERVER and persisted in a database.
// Storing this information in sessionStorage (or localStorage) is NOT SECURE.
// - sessionStorage data is client-side and can be manipulated by the user.
// - It does NOT persist across browser restarts or new tabs.
// This implementation uses sessionStorage ONLY for demonstration purposes in a frontend-only environment.
// ====================================================================================================

// Utility to get users from sessionStorage
const getUsersFromSessionStorage = (): User[] => {
  try {
    const usersJson = sessionStorage.getItem(SESSION_STORAGE_USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  } catch (error) {
    console.error("Falha ao analisar usuários de sessionStorage", error);
    return [];
  }
};

// Utility to save users to sessionStorage
const saveUsersToSessionStorage = (users: User[]): void => {
  try {
    sessionStorage.setItem(SESSION_STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error("Falha ao salvar usuários em sessionStorage", error);
  }
};

// Seed admin user if no users exist in sessionStorage for the current session
const seedAdminUser = () => {
  let users = getUsersFromSessionStorage();
  if (!users.some(u => u.email === ADMIN_EMAIL)) { // Check if admin already exists in session
    const adminUser: User = {
      id: crypto.randomUUID(),
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD, // DANGER: Storing plaintext password for simulation only
      isPremium: true, // Admin is always premium for testing
      premiumExpirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(), // Expires in 1 year
      creationCount: 0,
      isAdmin: true,
    };
    users.push(adminUser);
    saveUsersToSessionStorage(users);
    console.log("Usuário admin pre-semeado em sessionStorage para esta sessão:", adminUser.email);
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Initialize auth state from sessionStorage on mount
  useEffect(() => {
    seedAdminUser(); // Ensure admin user exists for the session
    try {
      const storedUserJson = sessionStorage.getItem(SESSION_STORAGE_CURRENT_USER_KEY);
      if (storedUserJson) {
        const storedUser: User = JSON.parse(storedUserJson);
        // Check if premium expired
        if (storedUser.isPremium && storedUser.premiumExpirationDate) {
          const expirationDate = new Date(storedUser.premiumExpirationDate);
          if (expirationDate <= new Date()) {
            storedUser.isPremium = false;
            storedUser.premiumExpirationDate = null;
            saveUsersToSessionStorage(
              getUsersFromSessionStorage().map(u => u.id === storedUser.id ? storedUser : u)
            );
            sessionStorage.setItem(SESSION_STORAGE_CURRENT_USER_KEY, JSON.stringify(storedUser));
            console.log(`Premium expirou para ${storedUser.email}. Desativando.`);
          }
        }
        setCurrentUser(storedUser);
      }
    } catch (error) {
      console.error("Falha ao carregar usuário atual de sessionStorage", error);
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  // Persist current user to sessionStorage whenever it changes
  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem(SESSION_STORAGE_CURRENT_USER_KEY, JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem(SESSION_STORAGE_CURRENT_USER_KEY);
    }
  }, [currentUser]);

  // Periodic check for premium expiration
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentUser && currentUser.isPremium && currentUser.premiumExpirationDate) {
        const expirationDate = new Date(currentUser.premiumExpirationDate);
        if (expirationDate <= new Date()) {
          console.log(`Premium expirou para ${currentUser.email}. Desativando.`);
          setCurrentUser(prev => prev ? { ...prev, isPremium: false, premiumExpirationDate: null } : null);
          const users = getUsersFromSessionStorage();
          const updatedUsers = users.map(u => u.id === currentUser.id ? { ...u, isPremium: false, premiumExpirationDate: null } : u);
          saveUsersToSessionStorage(updatedUsers);
        }
      }
    }, 60 * 60 * 1000); // Check every hour

    return () => clearInterval(interval);
  }, [currentUser]);

  const simulateAsync = (data: any, success = true) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (success) resolve(data);
        else reject(data);
      }, 700); // Simulate network latency
    });

  const login = useCallback(async (email: string, password: string) => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const users = getUsersFromSessionStorage();
      const user = users.find(u => u.email === email && u.password === password); // DANGER: Plaintext comparison for simulation
      if (user) {
        await simulateAsync(user);
        setCurrentUser(user);
      } else {
        throw new Error("E-mail ou senha incorretos.");
      }
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
      let users = getUsersFromSessionStorage();
      if (users.some(u => u.email === email)) {
        throw new Error("Este e-mail já está em uso.");
      }

      const newUser: User = {
        id: crypto.randomUUID(),
        email,
        password, // DANGER: Plaintext password for simulation
        isPremium: false,
        premiumExpirationDate: null,
        creationCount: 0,
        isAdmin: false,
      };
      users.push(newUser);
      saveUsersToSessionStorage(users);
      await simulateAsync(newUser);
      setCurrentUser(newUser); // Auto-login after registration
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
    simulateAsync(null)
      .then(() => {
        setCurrentUser(null);
        // Clear all session storage relevant to auth for a clean logout
        sessionStorage.removeItem(SESSION_STORAGE_CURRENT_USER_KEY);
        sessionStorage.removeItem(SESSION_STORAGE_USERS_KEY); // Clear mock user DB
        // Fix: Use the imported SESSION_STORAGE_HISTORY_KEY
        sessionStorage.removeItem(SESSION_STORAGE_HISTORY_KEY); // Clear ad history
        // Re-seed admin for next login attempt in the same session
        seedAdminUser();
      })
      .catch((err) => {
        setAuthError(err.message || "Erro ao sair.");
      })
      .finally(() => {
        setIsLoadingAuth(false);
      });
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const users = getUsersFromSessionStorage();
      const userExists = users.some(u => u.email === email);
      if (!userExists) {
        throw new Error("Nenhuma conta encontrada com este e-mail.");
      }
      await simulateAsync(null);
      console.log(`MOCK: E-mail de recuperação de senha enviado para ${email}`);
      // In a real app, this would involve sending a secure token to the user's email.
    } catch (err: any) {
      setAuthError(err.message || "Erro ao solicitar recuperação de senha.");
      throw err;
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  // Removed loginWithGoogle as per request
  // const loginWithGoogle = useCallback(async () => { ... }, [currentUser]);

  const updateUserSubscription = useCallback((userId: string, dateApproved: string) => {
    if (!currentUser || currentUser.id !== userId) {
      console.warn('Cannot update subscription: current user mismatch or not logged in.');
      return;
    }

    const purchaseDate = new Date(dateApproved);
    const expirationDate = new Date(purchaseDate);
    expirationDate.setDate(purchaseDate.getDate() + PREMIUM_DURATION_DAYS);

    const updatedUser: User = {
      ...currentUser,
      isPremium: true,
      premiumExpirationDate: expirationDate.toISOString(),
    };

    setCurrentUser(updatedUser);

    const users = getUsersFromSessionStorage();
    const updatedUsers = users.map(u => u.id === userId ? updatedUser : u);
    saveUsersToSessionStorage(updatedUsers);
    console.log(`Usuário ${userId} premium ativado. Expira em: ${expirationDate.toLocaleString()}`);
  }, [currentUser]);

  const incrementCreationCount = useCallback(() => {
    if (!currentUser) return;

    const updatedUser: User = {
      ...currentUser,
      creationCount: currentUser.creationCount + 1,
    };
    setCurrentUser(updatedUser);

    const users = getUsers(sessionStorage);
    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
    saveUsersToSessionStorage(updatedUsers);
    console.log(`Contagem de criações do usuário ${currentUser.id} incrementada para: ${updatedUser.creationCount}`);
  }, [currentUser]);

  const checkAuthStatus = useCallback(() => {
    // This function is useful for external components to trigger a re-check
    setIsLoadingAuth(true);
    try {
      const storedUserJson = sessionStorage.getItem(SESSION_STORAGE_CURRENT_USER_KEY);
      if (storedUserJson) {
        setCurrentUser(JSON.parse(storedUserJson));
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Falha ao verificar novamente o status de autenticação de sessionStorage", error);
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  const value = {
    currentUser,
    isLoadingAuth,
    authError,
    login,
    register,
    logout,
    resetPassword,
    // loginWithGoogle, // Removed
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