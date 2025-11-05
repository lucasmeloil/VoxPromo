import React from 'react';
import { HomeIcon, ListBulletIcon, UserIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';
import { CurrentView } from '../types';

interface NavbarProps {
  currentView: CurrentView;
  onViewChange: (view: CurrentView) => void;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onViewChange, isMobileMenuOpen, toggleMobileMenu }) => {
  const navItems = [
    { name: 'Criar', icon: HomeIcon, view: 'create' as CurrentView },
    { name: 'Histórico', icon: ListBulletIcon, view: 'history' as CurrentView },
    { name: 'Perfil', icon: UserIcon, view: 'profile' as CurrentView },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-700 z-50">
      <div className="container mx-auto flex items-center justify-between p-4">
        <h1 className="text-2xl font-bold tracking-wide text-purple-600 dark:text-yellow-400">
          VoxPromo
        </h1>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex space-x-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => onViewChange(item.view)}
                className={`flex items-center p-2 text-base font-medium transition-all duration-200
                  ${isActive ? 'text-purple-600 dark:text-purple-400 active-nav-item border-b-2 border-purple-600 dark:border-purple-400' : 'text-gray-500 hover:text-purple-500 dark:text-gray-400 dark:hover:text-purple-300'}`}
              >
                <Icon className="w-5 h-5 mr-2" />
                <span>{item.name}</span>
              </button>
            );
          })}
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
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => onViewChange(item.view)}
                  className={`flex items-center p-2 text-lg font-medium transition-all duration-200 w-full justify-center
                    ${isActive ? 'text-purple-600 dark:text-purple-400 active-nav-item bg-purple-100 dark:bg-gray-700 rounded-lg' : 'text-gray-600 hover:text-purple-500 dark:text-gray-300 dark:hover:text-purple-200'}`}
                >
                  <Icon className="w-6 h-6 mr-3" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Navbar;