import React, { useState, useCallback } from 'react';
import Navbar from './components/Navbar';
import CreateAd from './views/CreateAd';
import History from './views/History';
import { AdHistoryItem, CurrentView, AdPromptConfig } from './types.js';
import { useAdHistory } from './hooks/useAdHistory';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<CurrentView>('create');
  const [initialAdConfig, setInitialAdConfig] = useState<AdPromptConfig | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { addAdToHistory, history } = useAdHistory();

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const handleViewChange = useCallback((view: CurrentView) => {
    setCurrentView(view);
    setInitialAdConfig(null); // Clear any pending edit/duplicate config when switching views
    setIsMobileMenuOpen(false); // Close mobile menu on navigation
    window.history.pushState({}, '', `/${view}`); // Update URL for clarity
  }, []);

  const handleAdCreated = useCallback((newAd: AdHistoryItem) => {
    addAdToHistory(newAd);
  }, [addAdToHistory]);

  const handleEditAd = useCallback((config: AdPromptConfig) => {
    setInitialAdConfig(config);
    handleViewChange('create');
  }, [handleViewChange]);

  const handleClearInitialAdConfig = useCallback(() => {
    setInitialAdConfig(null);
  }, []);

  const renderMainContent = () => {
    switch (currentView) {
      case 'history':
        return <History onEditAd={handleEditAd} />;
      case 'create':
      default:
        return (
          <CreateAd
            onAdCreated={handleAdCreated}
            initialAdConfig={initialAdConfig}
            onClearInitialAdConfig={handleClearInitialAdConfig}
          />
        );
    }
  };

  return (
    <div className="App min-h-screen flex flex-col">
      <Navbar
        currentView={currentView}
        onViewChange={handleViewChange}
        isMobileMenuOpen={isMobileMenuOpen}
        toggleMobileMenu={toggleMobileMenu}
      />
      <main className="flex-1 overflow-y-auto pt-[64px]">
        {renderMainContent()}
      </main>
    </div>
  );
};

export default App;
