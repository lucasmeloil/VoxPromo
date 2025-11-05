import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import FooterNav from './components/FooterNav';
import CreateAd from './views/CreateAd';
import History from './views/History';
import Profile from './views/Profile';
import { AdHistoryItem, CurrentView, AdPromptConfig } from './types';
import { useAdHistory } from './hooks/useAdHistory';
// Removed import for LOCAL_STORAGE_THEME_KEY

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<CurrentView>('create');
  // Removed isDarkMode state and its initialization from localStorage
  // The theme is now handled globally by index.html body classes.
  const [initialAdConfig, setInitialAdConfig] = useState<AdPromptConfig | null>(null);

  const { addAdToHistory, history, creationCount } = useAdHistory();

  // Removed useEffect for dark mode class on body and localStorage theme saving.

  // Removed toggleDarkMode function.

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
          // Removed isDarkMode prop
          initialAdConfig={initialAdConfig}
          onClearInitialAdConfig={handleClearInitialAdConfig}
          creationCount={creationCount}
        />;
      case 'history':
        return <History onEditAd={handleEditAd} />;
      case 'profile':
        return <Profile />;
      default:
        return <CreateAd
          onAdCreated={handleAdCreated}
          // Removed isDarkMode prop
          initialAdConfig={initialAdConfig}
          onClearInitialAdConfig={handleClearInitialAdConfig}
          creationCount={creationCount}
        />;
    }
  };

  return (
    <div className="App min-h-screen flex flex-col">
      <Header /> {/* Removed isDarkMode and toggleDarkMode props */}
      <main className="flex-1 overflow-y-auto">
        {renderView()}
      </main>
      <FooterNav currentView={currentView} onViewChange={handleViewChange} />
    </div>
  );
};

export default App;