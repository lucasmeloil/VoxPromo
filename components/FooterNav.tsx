import React from 'react';
import { HomeIcon, ListBulletIcon, UserIcon } from '@heroicons/react/24/solid';
import { CurrentView } from '../types';

interface FooterNavProps {
  currentView: CurrentView;
  onViewChange: (view: CurrentView) => void;
}

const FooterNav: React.FC<FooterNavProps> = ({ currentView, onViewChange }) => {
  const navItems = [
    { name: 'Criar', icon: HomeIcon, view: 'create' as CurrentView },
    { name: 'Histórico', icon: ListBulletIcon, view: 'history' as CurrentView },
    { name: 'Perfil', icon: UserIcon, view: 'profile' as CurrentView },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-lg border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="container mx-auto flex justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => onViewChange(item.view)}
              className={`flex flex-col items-center p-2 text-sm font-medium transition-all duration-200
                ${isActive ? 'text-purple-600 dark:text-purple-400 active-nav-item' : 'text-gray-500 hover:text-purple-500 dark:text-gray-400 dark:hover:text-purple-300'}`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default FooterNav;
