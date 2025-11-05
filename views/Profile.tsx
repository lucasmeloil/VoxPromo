import React, { useState } from 'react';
import { Cog6ToothIcon, StarIcon, ShieldCheckIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { useAdHistory } from '../hooks/useAdHistory';
import { MAX_FREE_CREATIONS } from '../constants';

interface ProfileProps {
  // Removed creationCount prop
}

const Profile: React.FC<ProfileProps> = () => { // Removed creationCount from props
  const { history } = useAdHistory();
  const totalAds = history.length;
  const favoriteAds = history.filter(ad => ad.isFavorite).length;
  // Removed remainingCreations as monetization is no longer here

  // Mock settings for demonstration
  const [voicePreference, setVoicePreference] = useState('any');
  const [language, setLanguage] = useState('pt-BR');
  const [targetMediaPreference, setTargetMediaPreference] = useState('any');

  return (
    <div className="container mx-auto p-4 pt-20 min-h-screen"> {/* Adjusted pt-20 */}
      <h2 className="text-3xl font-bold text-center text-purple-700 dark:text-yellow-400 mb-8 tracking-wide">
        Seu Perfil VoxPromo
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Personal History */}
        <div className="card bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl flex flex-col items-center justify-center text-center">
          <StarIcon className="w-12 h-12 text-yellow-500 mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Histórico Pessoal</h3>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Total de Propagandas Criadas: <span className="font-bold text-purple-600 dark:text-yellow-400">{totalAds}</span>
          </p>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Favoritas: <span className="font-bold text-purple-600 dark:text-yellow-400">{favoriteAds}</span>
          </p>
        </div>

        {/* Settings */}
        <div className="card bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl">
          <Cog6ToothIcon className="w-12 h-12 text-gray-500 dark:text-gray-400 mb-4 mx-auto" />
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center mb-4">Configurações</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="voicePref" className="block text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Preferência de Voz:
              </label>
              <select
                id="voicePref"
                value={voicePreference}
                onChange={(e) => setVoicePreference(e.target.value)}
                className="select-field w-full p-3 border border-gray-300 dark:border-purple-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors duration-200"
              >
                <option value="any">Qualquer</option>
                <option value="female">Feminina</option>
                <option value="male">Masculina</option>
              </select>
            </div>
            <div>
              <label htmlFor="language" className="block text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Idioma:
              </label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="select-field w-full p-3 border border-gray-300 dark:border-purple-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors duration-200"
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
              </select>
            </div>
            <div>
              <label htmlFor="mediaTarget" className="block text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Mídia-Alvo Padrão:
              </label>
              <select
                id="mediaTarget"
                value={targetMediaPreference}
                onChange={(e) => setTargetMediaPreference(e.target.value)}
                className="select-field w-full p-3 border border-gray-300 dark:border-purple-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors duration-200"
              >
                <option value="any">Qualquer</option>
                <option value="radio">Rádio</option>
                <option value="tv">Televisão</option>
                <option value="social">Redes Sociais</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Monetization Section - REMOVED from Profile.tsx, now in index.html */}
    </div>
  );
};

export default Profile;