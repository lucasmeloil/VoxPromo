import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar'; // Corrected import path
import CreateAd from './views/CreateAd';
import History from './views/History';
import Profile from './views/Profile';
import { AdHistoryItem, CurrentView, AdPromptConfig } from './types';
import { useAdHistory } from './hooks/useAdHistory';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<CurrentView>('create');
  const [initialAdConfig, setInitialAdConfig] = useState<AdPromptConfig | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // New state for mobile menu

  const { addAdToHistory, history, creationCount } = useAdHistory();

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const handleViewChange = useCallback((view: CurrentView) => {
    setCurrentView(view);
    setInitialAdConfig(null); // Clear any pending edit/duplicate config when switching views
    setIsMobileMenuOpen(false); // Close mobile menu on navigation
  }, []);

  const handleAdCreated = useCallback((newAd: AdHistoryItem) => {
    addAdToHistory(newAd);
    // Optionally switch to history view after creation
    // setCurrentView('history');
  }, [addAdToHistory]);

  const handleEditAd = useCallback((config: AdPromptConfig) => {
    setInitialAdConfig(config);
    setCurrentView('create');
    setIsMobileMenuOpen(false); // Close mobile menu
  }, []);

  const handleClearInitialAdConfig = useCallback(() => {
    setInitialAdConfig(null);
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'create':
        return <CreateAd
          onAdCreated={handleAdCreated}
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
          initialAdConfig={initialAdConfig}
          onClearInitialAdConfig={handleClearInitialAdConfig}
          creationCount={creationCount}
        />;
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
      <main className="flex-1 overflow-y-auto">
        {renderView()}
      </main>
      {/* FooterNav is removed */}
    </div>
  );
};

export default App;