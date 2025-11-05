import React from 'react';
// Removed SunIcon and MoonIcon imports

interface HeaderProps {
  // Removed isDarkMode and toggleDarkMode props
}

const Header: React.FC<HeaderProps> = () => { // Removed props from function signature
  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-700 z-50">
      <div className="container mx-auto flex items-center justify-between p-4">
        <h1 className="text-2xl font-bold tracking-wide text-purple-600 dark:text-yellow-400">
          VoxPromo
        </h1>
        {/* Removed dark mode toggle button */}
      </div>
    </header>
  );
};

export default Header;