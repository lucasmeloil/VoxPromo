import React from 'react';
import { HomeIcon, ListBulletIcon, UserIcon, Bars3Icon, XMarkIcon, RocketLaunchIcon, ArrowRightOnRectangleIcon, KeyIcon, UserPlusIcon, BuildingOfficeIcon } from '@heroicons/react/24/solid';
// fix: add file extensions to imports
import { CurrentView } from '../types.ts';
import { useAuth } from '../contexts/AuthContext.tsx'; // Import useAuth

// Define a common base for navigation items
interface NavItemBase {
  name: string;
  icon: React.ElementType; // Type for icon component
  authRequired: boolean;
  adminOnly?: boolean; // New prop for admin-only items
}

// Define items with a 'view' property
interface NavItemWithView extends NavItemBase {
  view: CurrentView;
  action?: never; // Ensure 'action' is not present for view-based items
}

// Define items with an 'action' property
interface NavItemWithAction extends NavItemBase {
  action: () => void;
  view?: never; // Ensure 'view' is not present for action-based items
}

// Union type for all navigation items
type NavItem = NavItemWithView | NavItemWithAction;

interface NavbarProps {
  currentView: CurrentView;
  onViewChange: (view: CurrentView) => void;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  onShowLandingPage: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  currentUserEmail: string | null;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onViewChange, isMobileMenuOpen, toggleMobileMenu, onShowLandingPage, isAuthenticated, isAdmin, currentUserEmail }) => {
  const { logout } = useAuth(); // Get logout function from useAuth

  const mainAppNavItems: NavItemWithView[] = [
    { name: 'Criar', icon: RocketLaunchIcon, view: 'create', authRequired: true },
    { name: 'Histórico', icon: ListBulletIcon, view: 'history', authRequired: true },
    { name: 'Perfil', icon: UserIcon, view: 'profile', authRequired: true },
  ];

  const authNavItems: NavItem[] = isAuthenticated ?
    [
      ...mainAppNavItems,
      ...(isAdmin ? [{ name: 'Admin', icon: BuildingOfficeIcon, view: 'admin-panel', authRequired: true, adminOnly: true } as NavItemWithView] : []),
      { name: 'Sair', icon: ArrowRightOnRectangleIcon, action: logout, authRequired: true },
    ]
    :
    [
      { name: 'Login', icon: KeyIcon, view: 'login', authRequired: false },
      { name: 'Registrar', icon: UserPlusIcon, view: 'register', authRequired: false },
    ];

  // Fix: Use type guards to correctly handle items with 'action' or 'view'
  const handleNavigationClick = (item: NavItem) => {
    if ('action' in item && item.action) { // Type guard: item is NavItemWithAction here
      item.action();
      onViewChange('landing'); // Redirect to landing after logout
    } else if ('view' in item) { // Type guard: item is NavItemWithView here
      if (item.view === 'landing') {
        onShowLandingPage();
      } else {
        onViewChange(item.view);
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-700 z-50">
      <div className="container mx-auto flex items-center justify-between p-4">
        <button onClick={() => onShowLandingPage()} className="flex items-center">
            <h1 className="text-2xl font-bold tracking-wide text-purple-600 dark:text-yellow-400">
            VoxPromo
            </h1>
        </button>


        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          {authNavItems.filter(item => !item.authRequired || isAuthenticated).map((item) => {
            // Filter out admin-only items if user is not admin
            if (item.adminOnly && !isAdmin) return null;

            const Icon = item.icon;
            // Fix: Check if 'view' property exists before comparing
            const isActive = 'view' in item && currentView === item.view;
            return (
              <button
                key={item.name}
                onClick={() => handleNavigationClick(item)}
                className={`flex items-center p-2 text-base font-medium transition-all duration-200
                  ${isActive ? 'text-purple-600 dark:text-purple-400 active-nav-item border-b-2 border-purple-600 dark:border-purple-400' : 'text-gray-500 hover:text-purple-500 dark:text-gray-400 dark:hover:text-purple-300'}`}
              >
                <Icon className="w-5 h-5 mr-2" />
                <span>{item.name}</span>
              </button>
            );
          })}
            {isAuthenticated && currentUserEmail && (
                <span className="text-gray-500 dark:text-gray-400 text-sm ml-4 border-l pl-4 border-gray-700">Olá, {currentUserEmail}!</span>
            )}
        </nav>

        {/* Mobile Hamburger Icon */}
        <div className="lg:hidden flex items-center">
          <button
            onClick={toggleMobileMenu}
            className="text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-md"
            aria-label="Abrir menu de navegação"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="w-7 h-7" />
            ) : (
              <Bars3Icon className="w-7 h-7" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <nav id="mobile-menu" className="lg:hidden bg-white dark:bg-gray-800 absolute top-full left-0 right-0 py-4 shadow-lg border-t border-gray-200 dark:border-gray-700 animate-fade-in-down">
          <div className="flex flex-col items-center space-y-4">
            {authNavItems.filter(item => !item.authRequired || isAuthenticated).map((item) => {
              // Filter out admin-only items if user is not admin
              if (item.adminOnly && !isAdmin) return null;

              const Icon = item.icon;
              // Fix: Check if 'view' property exists before comparing
              const isActive = 'view' in item && currentView === item.view;
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigationClick(item)}
                  className={`flex items-center p-2 text-lg font-medium transition-all duration-200 w-full justify-center
                    ${isActive ? 'text-purple-600 dark:text-purple-400 active-nav-item bg-purple-100 dark:bg-gray-700 rounded-lg' : 'text-gray-600 hover:text-purple-500 dark:text-gray-300 dark:hover:text-purple-200'}`}
                >
                  <Icon className="w-6 h-6 mr-3" />
                  <span>{item.name}</span>
                </button>
              );
            })}
             {isAuthenticated && currentUserEmail && (
                <span className="text-gray-500 dark:text-gray-400 text-sm mt-4">Olá, {currentUserEmail}!</span>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Navbar;