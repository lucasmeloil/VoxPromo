import { useState, useEffect, useCallback } from 'react';
import { AdHistoryItem } from '../types';
import { SESSION_STORAGE_HISTORY_KEY } from '../constants';

interface UseAdHistoryReturn {
  history: AdHistoryItem[];
  addAdToHistory: (ad: AdHistoryItem) => void;
  updateAdInHistory: (ad: AdHistoryItem) => void;
  clearHistory: () => void;
  isLoadingHistory: boolean;
  historyError: string | null;
}

export const useAdHistory = (): UseAdHistoryReturn => {
  const [history, setHistory] = useState<AdHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Load history from session storage on initial mount
  useEffect(() => {
    try {
      const storedHistory = sessionStorage.getItem(SESSION_STORAGE_HISTORY_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load history from session storage:", error);
      setHistoryError("Failed to load history.");
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Save history to session storage whenever it changes
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_STORAGE_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save history to session storage:", error);
      setHistoryError("Failed to save history.");
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

  return { history, addAdToHistory, updateAdInHistory, clearHistory, isLoadingHistory, historyError };
};