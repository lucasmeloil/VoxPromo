import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import FooterNav from './components/FooterNav';
import CreateAd from './views/CreateAd';
import History from './views/History';
import Profile from './views/Profile';
import { AdHistoryItem, CurrentView, AdPromptConfig } from './types';
import { useAdHistory } from './hooks/useAdHistory';
import { LOCAL_STORAGE_THEME_KEY } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<CurrentView>('create');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const storedTheme = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
      return storedTheme ? JSON.parse(storedTheme) : window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (error) {
      console.error("Failed to parse theme from localStorage", error);
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  });
  const [initialAdConfig, setInitialAdConfig] = useState<AdPromptConfig | null>(null);

  const { addAdToHistory, history, creationCount } = useAdHistory();

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    try {
      localStorage.setItem(LOCAL_STORAGE_THEME_KEY, JSON.stringify(isDarkMode));
    } catch (error) {
      console.error("Failed to save theme to localStorage", error);
    }
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prevMode => !prevMode);
  }, []);

  const handleViewChange = useCallback((view: CurrentView) => {
    setCurrentView(view);
    setInitialAdConfig(null); // Clear any pending edit/duplicate config when switching views
  }, []);

  const handleAdCreated = useCallback((newAd: AdHistoryItem) => {
    addAdToHistory(newAd);
    // Optionally switch to history view after creation
    // setCurrentView('history');
  }, [addAdToHistory]);

  const handleEditAd = useCallback((config: AdPromptConfig) => {
    setInitialAdConfig(config);
    setCurrentView('create');
  }, []);

  const handleClearInitialAdConfig = useCallback(() => {
    setInitialAdConfig(null);
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'create':
        return <CreateAd
          onAdCreated={handleAdCreated}
          isDarkMode={isDarkMode}
          initialAdConfig={initialAdConfig}
          onClearInitialAdConfig={handleClearInitialAdConfig}
          creationCount={creationCount}
        />;
      case 'history':
        return <History onEditAd={handleEditAd} />;
      case 'profile':
        return <Profile creationCount={creationCount} />;
      default:
        return <CreateAd
          onAdCreated={handleAdCreated}
          isDarkMode={isDarkMode}
          initialAdConfig={initialAdConfig}
          onClearInitialAdConfig={handleClearInitialAdConfig}
          creationCount={creationCount}
        />;
    }
  };

  return (
    <div className="App min-h-screen flex flex-col">
      <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <main className="flex-1 overflow-y-auto">
        {renderView()}
      </main>
      <FooterNav currentView={currentView} onViewChange={handleViewChange} />
    </div>
  );
};

export default App;