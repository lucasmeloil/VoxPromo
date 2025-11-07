// fix: remove .js extension from import
import { User, AdHistoryItem, PaymentStatusResponse } from '../types';
// fix: remove .js extension from import
import { PREMIUM_DURATION_DAYS } from '../constants'; // For consistent logic

const API_BASE_URL = '/.netlify/functions'; // Path to Netlify Functions

interface ApiResponse<T> {
  data: T;
  statusCode: number;
}

// Utility to handle API responses
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Ocorreu um erro na requisição API.');
  }
  return { data, statusCode: response.status };
};

// Utility to get userId from AuthContext (runtime dependency)
// This is a simple way for demo. In a real app, you'd manage tokens securely.
const getUserId = (): string | null => {
  // This needs to be dynamically obtained from the AuthContext or a global state
  // For now, we assume AuthContext will provide it or throw an error if not present.
  // In a real app, this would be a JWT from secure storage.
  const currentUserJson = sessionStorage.getItem('voxpromo_current_user_temp_session'); // Temporary for this API service
  if (currentUserJson) {
    const user = JSON.parse(currentUserJson);
    return user.id;
  }
  return null;
};

// =====================================
// AUTH API Calls
// =====================================

export const authApi = {
  login: async (email: string, password: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const { data } = await handleResponse<User>(response);
    sessionStorage.setItem('voxpromo_current_user_temp_session', JSON.stringify(data)); // Store for getUserId in this demo
    return data;
  },

  register: async (email: string, password: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const { data } = await handleResponse<User>(response);
    sessionStorage.setItem('voxpromo_current_user_temp_session', JSON.stringify(data)); // Store for getUserId in this demo
    return data;
  },

  // This will be called on app load to check current user status
  me: async (): Promise<User | null> => {
    const userId = getUserId();
    if (!userId) return null;

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId, // Pass userId in header for authentication
      },
    });
    if (response.status === 401 || response.status === 404) {
        sessionStorage.removeItem('voxpromo_current_user_temp_session'); // Clear temp session on unauthorized
        return null;
    }
    const { data } = await handleResponse<User>(response);
    sessionStorage.setItem('voxpromo_current_user_temp_session', JSON.stringify(data)); // Update temp session
    return data;
  },

  resetPassword: async (email: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const { data } = await handleResponse<{ message: string }>(response);
    return data;
  },

  updateSubscription: async (userId: string, dateApproved: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/auth/update-subscription`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
      },
      body: JSON.stringify({ dateApproved }),
    });
    const { data } = await handleResponse<User>(response);
    sessionStorage.setItem('voxpromo_current_user_temp_session', JSON.stringify(data)); // Update temp session
    return data;
  },

  incrementCreationCount: async (userId: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/auth/increment-creation-count`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
      },
    });
    const { data } = await handleResponse<User>(response);
    sessionStorage.setItem('voxpromo_current_user_temp_session', JSON.stringify(data)); // Update temp session
    return data;
  },
};

// =====================================
// HISTORY API Calls
// =====================================

export const historyApi = {
  getHistory: async (): Promise<AdHistoryItem[]> => {
    const userId = getUserId();
    if (!userId) throw new Error('Usuário não autenticado para buscar histórico.');

    const response = await fetch(`${API_BASE_URL}/history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
      },
    });
    const { data } = await handleResponse<AdHistoryItem[]>(response);
    return data;
  },

  addAd: async (ad: AdHistoryItem): Promise<AdHistoryItem> => {
    const userId = getUserId();
    if (!userId) throw new Error('Usuário não autenticado para adicionar propaganda.');

    const response = await fetch(`${API_BASE_URL}/history/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
      },
      body: JSON.stringify(ad),
    });
    const { data } = await handleResponse<AdHistoryItem>(response);
    return data;
  },

  updateAd: async (ad: AdHistoryItem): Promise<AdHistoryItem> => {
    const userId = getUserId();
    if (!userId) throw new Error('Usuário não autenticado para atualizar propaganda.');

    const response = await fetch(`${API_BASE_URL}/history/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
      },
      body: JSON.stringify(ad),
    });
    const { data } = await handleResponse<AdHistoryItem>(response);
    return data;
  },

  clearHistory: async (): Promise<{ message: string }> => {
    const userId = getUserId();
    if (!userId) throw new Error('Usuário não autenticado para limpar histórico.');

    const response = await fetch(`${API_BASE_URL}/history/clear`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
      },
    });
    const { data } = await handleResponse<{ message: string }>(response);
    return data;
  },
};