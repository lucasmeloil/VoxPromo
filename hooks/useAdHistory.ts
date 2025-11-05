import { useState, useEffect, useCallback } from 'react';
import { AdHistoryItem } from '../types';
import { LOCAL_STORAGE_HISTORY_KEY } from '../constants';

interface UseAdHistoryReturn {
  history: AdHistoryItem[];
  addAdToHistory: (ad: AdHistoryItem) => void;
  updateAdInHistory: (ad: AdHistoryItem) => void;
  clearHistory: () => void;
  creationCount: number;
}

export const useAdHistory = (): UseAdHistoryReturn => {
  const [history, setHistory] = useState<AdHistoryItem[]>(() => {
    try {
      const storedHistory = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      return storedHistory ? JSON.parse(storedHistory) : [];
    } catch (error) {
      console.error("Failed to parse history from localStorage", error);
      return [];
    }
  });

  // Track the number of creations for the current month/period for monetization simulation
  const [creationCount, setCreationCount] = useState<number>(() => {
    // In a real app, this would involve a backend or more complex client-side logic
    // For this example, we'll just count total ads in history.
    return history.length;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(history));
      setCreationCount(history.length); // Update count when history changes
    } catch (error) {
      console.error("Failed to save history to localStorage", error);
    }
  }, [history]);

  const addAdToHistory = useCallback((ad: AdHistoryItem) => {
    setHistory(prevHistory => [...prevHistory, ad]);
  }, []);

  const updateAdInHistory = useCallback((updatedAd: AdHistoryItem) => {
    setHistory(prevHistory =>
      prevHistory.map(ad => (ad.id === updatedAd.id ? updatedAd : ad))
    );
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return { history, addAdToHistory, updateAdInHistory, clearHistory, creationCount };
};
