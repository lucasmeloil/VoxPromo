import { useState, useEffect, useCallback } from 'react';
// fix: remove .js extension from import
import { AdHistoryItem } from '../types';
import { historyApi } from '../services/apiService'; // Import the new API service
import { useAuth } from '../contexts/AuthContext'; // To get current user id

interface UseAdHistoryReturn {
  history: AdHistoryItem[];
  addAdToHistory: (ad: AdHistoryItem) => void;
  updateAdInHistory: (ad: AdHistoryItem) => void;
  clearHistory: () => void;
  isLoadingHistory: boolean;
  historyError: string | null;
}

export const useAdHistory = (): UseAdHistoryReturn => {
  const { currentUser, isLoadingAuth } = useAuth();
  const [history, setHistory] = useState<AdHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!currentUser) {
      setHistory([]);
      setIsLoadingHistory(false);
      return;
    }
    setIsLoadingHistory(true);
    setHistoryError(null);
    try {
      const userHistory = await historyApi.getHistory();
      setHistory(userHistory);
    } catch (error: any) {
      console.error("Falha ao buscar histórico do backend:", error);
      setHistoryError(error.message || "Falha ao carregar histórico.");
      setHistory([]); // Clear history on error or no user
    } finally {
      setIsLoadingHistory(false);
    }
  }, [currentUser]);

  // Fetch history when user changes or component mounts
  useEffect(() => {
    if (!isLoadingAuth) { // Only fetch if auth status is known
        fetchHistory();
    }
  }, [currentUser, isLoadingAuth, fetchHistory]);

  const addAdToHistory = useCallback(async (ad: AdHistoryItem) => {
    if (!currentUser) {
      setHistoryError("Usuário não autenticado para adicionar propaganda.");
      return;
    }
    try {
      const addedAd = await historyApi.addAd(ad);
      setHistory(prevHistory => [...prevHistory, addedAd]);
    } catch (error: any) {
      console.error("Falha ao adicionar propaganda ao backend:", error);
      setHistoryError(error.message || "Falha ao adicionar propaganda.");
    }
  }, [currentUser]);

  const updateAdInHistory = useCallback(async (updatedAd: AdHistoryItem) => {
    if (!currentUser) {
      setHistoryError("Usuário não autenticado para atualizar propaganda.");
      return;
    }
    try {
      const responseAd = await historyApi.updateAd(updatedAd);
      setHistory(prevHistory =>
        prevHistory.map(ad => (ad.id === responseAd.id ? responseAd : ad))
      );
    } catch (error: any) {
      console.error("Falha ao atualizar propaganda no backend:", error);
      setHistoryError(error.message || "Falha ao atualizar propaganda.");
    }
  }, [currentUser]);

  const clearHistory = useCallback(async () => {
    if (!currentUser) {
      setHistoryError("Usuário não autenticado para limpar histórico.");
      return;
    }
    try {
      await historyApi.clearHistory();
      setHistory([]);
    } catch (error: any) {
      console.error("Falha ao limpar histórico no backend:", error);
      setHistoryError(error.message || "Falha ao limpar histórico.");
    }
  }, [currentUser]);

  return { history, addAdToHistory, updateAdInHistory, clearHistory, isLoadingHistory, historyError };
};