import { useState, useEffect, useCallback } from 'react';
import { AdHistoryItem } from '../types';
import { SESSION_STORAGE_HISTORY_KEY } from '../constants'; // Changed from LOCAL_STORAGE_HISTORY_KEY

interface UseAdHistoryReturn {
  history: AdHistoryItem[];
  addAdToHistory: (ad: AdHistoryItem) => void;
  updateAdInHistory: (ad: AdHistoryItem) => void;
  clearHistory: () => void;
}

export const useAdHistory = (): UseAdHistoryReturn => {
  const [history, setHistory] = useState<AdHistoryItem[]>(() => {
    try {
      // Using sessionStorage instead of localStorage as per new requirements
      const storedHistory = sessionStorage.getItem(SESSION_STORAGE_HISTORY_KEY);
      return storedHistory ? JSON.parse(storedHistory) : [];
    } catch (error) {
      console.error("Falha ao analisar histórico de sessionStorage", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      // Persisting to sessionStorage
      sessionStorage.setItem(SESSION_STORAGE_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("Falha ao salvar histórico em sessionStorage", error);
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

  return { history, addAdToHistory, updateAdInHistory, clearHistory };
};