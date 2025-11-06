import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import CreateAd from './views/CreateAd';
import History from './views/History';
import Profile from './views/Profile';
import LandingPage from './components/LandingPage';
import PaymentPage from './views/PaymentPage'; // New import for initiating payment
import PaymentConfirmationPage from './views/PaymentConfirmationPage'; // Renamed and refactored
import Login from './views/Auth/Login';
import Register from './views/Auth/Register';
import ForgotPassword from './views/Auth/ForgotPassword';
import AdminPanel from './views/AdminPanel'; // New import for Admin Panel
import { AdHistoryItem, CurrentView, AdPromptConfig } from './types';
import { useAdHistory } from './hooks/useAdHistory';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const AppContent: React.FC = () => {
  const { currentUser, isLoadingAuth, checkAuthStatus, logout } = useAuth();
  const [currentView, setCurrentView] = useState<CurrentView>('landing');
  const [initialAdConfig, setInitialAdConfig] = useState<AdPromptConfig | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { addAdToHistory, history } = useAdHistory();

  // Determine initial view based on URL path and authentication status
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/payment') {
      setCurrentView('payment');
    } else if (path === '/premium-confirmado') {
      setCurrentView('premium-confirmado');
    } else if (path === '/erro-pagamento') {
      setCurrentView('erro-pagamento');
    } else if (path === '/pagamento-pendente') {
      setCurrentView('pagamento-pendente');
    } else if (path === '/login') {
      setCurrentView('login');
    } else if (path === '/register') {
      setCurrentView('register');
    } else if (path === '/forgot-password') {
      setCurrentView('forgot-password');
    } else if (path === '/admin-panel') {
      setCurrentView('admin-panel');
    } else if (currentUser) {
      // If user is logged in (session-based), default to 'create' or previous view
      setCurrentView('create');
    } else {
      setCurrentView('landing');
    }
  }, [currentUser]); // Re-run when currentUser changes

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const handleStartApp = useCallback(() => {
    setCurrentView('create'); // Default to 'create' view after leaving landing page
    setIsMobileMenuOpen(false); // Close mobile menu if open
    window.history.pushState({}, '', '/create'); // Update URL
  }, []);

  const handleShowLandingPage = useCallback(() => {
    setCurrentView('landing');
    setIsMobileMenuOpen(false); // Close mobile menu if open
    window.history.pushState({}, '', '/'); // Update URL to root
  }, []);

  const handleViewChange = useCallback((view: CurrentView) => {
    if (view === 'landing') {
      handleShowLandingPage();
    } else {
      setCurrentView(view);
      setInitialAdConfig(null); // Clear any pending edit/duplicate config when switching views
      setIsMobileMenuOpen(false); // Close mobile menu on navigation
      window.history.pushState({}, '', `/${view}`); // Update URL
    }
  }, [handleShowLandingPage]);

  const handleAdCreated = useCallback((newAd: AdHistoryItem) => {
    addAdToHistory(newAd);
  }, [addAdToHistory]);

  const handleEditAd = useCallback((config: AdPromptConfig) => {
    setInitialAdConfig(config);
    handleViewChange('create'); // Use handleViewChange to also update URL
  }, [handleViewChange]);

  const handleClearInitialAdConfig = useCallback(() => {
    setInitialAdConfig(null);
  }, []);

  const handlePaymentProcessed = useCallback((status: 'success' | 'failure' | 'pending') => {
    console.log(`Payment processing complete with status: ${status}`);
    // Redirect user to an appropriate page after payment is processed
    if (status === 'success') {
      handleViewChange('profile'); // Or 'create'
    } else if (status === 'pending') {
      handleViewChange('profile');
    } else {
      handleViewChange('profile'); // Show error on profile for now
    }
  }, [handleViewChange]);

  // Show loading spinner if auth status is being checked on initial load
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <svg className="animate-spin h-10 w-10 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="ml-3 text-lg">Carregando usuário...</span>
      </div>
    );
  }

  // --- Protected Routes Logic ---
  const protectedViews: CurrentView[] = ['create', 'history', 'profile', 'admin-panel'];
  const isAuthenticated = !!currentUser;

  if (protectedViews.includes(currentView) && !isAuthenticated) {
    // Redirect to login if trying to access a protected view without being authenticated
    window.history.pushState({}, '', '/login');
    setCurrentView('login');
    return null; // Render nothing while redirecting
  }

  // Admin panel specific protection
  if (currentView === 'admin-panel' && (!isAuthenticated || !currentUser?.isAdmin)) {
    window.history.pushState({}, '', '/profile'); // Redirect non-admin to profile
    setCurrentView('profile');
    return null;
  }

  const renderMainAppContent = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage onStartApp={handleStartApp} isPremium={currentUser?.isPremium || false} onViewChange={handleViewChange} />;
      case 'login':
        return <Login onViewChange={handleViewChange} />;
      case 'register':
        return <Register onViewChange={handleViewChange} />;
      case 'forgot-password':
        return <ForgotPassword onViewChange={handleViewChange} />;
      case 'create':
        return <CreateAd
          onAdCreated={handleAdCreated}
          initialAdConfig={initialAdConfig}
          onClearInitialAdConfig={handleClearInitialAdConfig}
          isPremium={currentUser?.isPremium || false}
          creationCount={currentUser?.creationCount || 0}
        />;
      case 'history':
        return <History onEditAd={handleEditAd} />;
      case 'profile':
        return <Profile
          isPremium={currentUser?.isPremium || false}
          premiumExpirationDate={currentUser?.premiumExpirationDate || null}
          totalAds={history.length}
          favoriteAds={history.filter(ad => ad.isFavorite).length}
          isAdmin={currentUser?.isAdmin || false}
        />;
      case 'payment':
        return <PaymentPage onViewChange={handleViewChange} currentUserEmail={currentUser?.email || ''} />;
      case 'premium-confirmado':
      case 'erro-pagamento':
      case 'pagamento-pendente':
        return <PaymentConfirmationPage onPaymentProcessed={handlePaymentProcessed} onViewChange={handleViewChange} />;
      case 'admin-panel':
        return <AdminPanel />;
      default:
        // Fallback for unhandled views, usually implies redirect to a known state
        return <LandingPage onStartApp={handleStartApp} isPremium={currentUser?.isPremium || false} onViewChange={handleViewChange} />;
    }
  };

  const shouldShowNavbar = currentView !== 'landing' && currentView !== 'login' && currentView !== 'register' && currentView !== 'forgot-password';

  return (
    <div className="App min-h-screen flex flex-col">
      {shouldShowNavbar && (
        <Navbar
          currentView={currentView}
          onViewChange={handleViewChange}
          isMobileMenuOpen={isMobileMenuOpen}
          toggleMobileMenu={toggleMobileMenu}
          onShowLandingPage={handleShowLandingPage}
          isAuthenticated={isAuthenticated}
          isAdmin={currentUser?.isAdmin || false}
          currentUserEmail={currentUser?.email || null}
        />
      )}
      <main className={`flex-1 overflow-y-auto ${shouldShowNavbar ? 'pt-[64px]' : ''}`}>
        {renderMainAppContent()}
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;