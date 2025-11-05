import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar'; // Corrected import path
import CreateAd from './views/CreateAd';
import History from './views/History';
import Profile from './views/Profile';
import LandingPage from './components/LandingPage'; // Import the new LandingPage component
import { AdHistoryItem, CurrentView, AdPromptConfig } from './types';
import { useAdHistory } from './hooks/useAdHistory';

const App: React.FC = () => {
  const [showLandingPage, setShowLandingPage] = useState(true); // New state to control landing page visibility
  const [currentView, setCurrentView] = useState<CurrentView>('create');
  const [initialAdConfig, setInitialAdConfig] = useState<AdPromptConfig | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // New state for mobile menu

  const { addAdToHistory, history, creationCount } = useAdHistory();

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const handleStartApp = useCallback(() => {
    setShowLandingPage(false);
    setCurrentView('create'); // Default to 'create' view after leaving landing page
    setIsMobileMenuOpen(false); // Close mobile menu if open
  }, []);

  const handleShowLandingPage = useCallback(() => {
    setShowLandingPage(true);
    setIsMobileMenuOpen(false); // Close mobile menu if open
  }, []);

  const handleViewChange = useCallback((view: CurrentView) => {
    if (view === 'landing') {
      handleShowLandingPage();
    } else {
      setCurrentView(view);
      setInitialAdConfig(null); // Clear any pending edit/duplicate config when switching views
      setIsMobileMenuOpen(false); // Close mobile menu on navigation
    }
  }, [handleShowLandingPage]);

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

  const renderMainAppContent = () => {
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
        // This case should ideally not be reached if showLandingPage is false
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
      {showLandingPage ? (
        <LandingPage onStartApp={handleStartApp} />
      ) : (
        <>
          <Navbar
            currentView={currentView}
            onViewChange={handleViewChange}
            isMobileMenuOpen={isMobileMenuOpen}
            toggleMobileMenu={toggleMobileMenu}
            onShowLandingPage={handleShowLandingPage} // Pass new prop to Navbar
          />
          <main className="flex-1 overflow-y-auto pt-[64px]"> {/* Added pt-[64px] for fixed navbar */}
            {renderMainAppContent()}
          </main>
        </>
      )}
    </div>
  );
};

export default App;