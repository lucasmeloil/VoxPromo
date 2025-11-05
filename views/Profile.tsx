import React, { useState } from 'react';
import { Cog6ToothIcon, StarIcon, ShieldCheckIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { useAdHistory } from '../hooks/useAdHistory';
import { MAX_FREE_CREATIONS } from '../constants';

interface ProfileProps {
  creationCount: number;
}

const Profile: React.FC<ProfileProps> = ({ creationCount }) => {
  const { history } = useAdHistory();
  const totalAds = history.length;
  const favoriteAds = history.filter(ad => ad.isFavorite).length;
  const remainingCreations = Math.max(0, MAX_FREE_CREATIONS - creationCount);

  // Mock settings for demonstration
  const [voicePreference, setVoicePreference] = useState('any');
  const [language, setLanguage] = useState('pt-BR');
  const [targetMediaPreference, setTargetMediaPreference] = useState('any');

  return (
    <div className="container mx-auto p-4 pt-20 pb-24 min-h-screen">
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

      {/* Monetization Section */}
      <div className="card bg-gradient-to-br from-purple-700 to-indigo-700 text-white p-6 rounded-xl shadow-2xl">
        <CreditCardIcon className="w-12 h-12 text-yellow-300 mb-4 mx-auto" />
        <h3 className="text-2xl font-bold text-center mb-4">Seu Plano VoxPromo</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free Plan Info */}
          <div className="bg-purple-800/70 p-5 rounded-lg shadow-inner">
            <h4 className="text-xl font-semibold mb-2 flex items-center">
              <ShieldCheckIcon className="w-6 h-6 mr-2 text-green-400" />
              Plano Gratuito
            </h4>
            <p className="text-gray-200">
              Você tem {remainingCreations} criações restantes este mês (limite de {MAX_FREE_CREATIONS}).
            </p>
            <ul className="list-disc list-inside text-gray-300 mt-2">
              <li>Acesso a vozes básicas</li>
              <li>Exportação padrão</li>
              <li>Histórico de criações</li>
            </ul>
          </div>

          {/* Premium Plan CTA */}
          <div className="bg-indigo-800/70 p-5 rounded-lg shadow-inner flex flex-col justify-between">
            <div>
              <h4 className="text-xl font-semibold mb-2 flex items-center">
                <StarIcon className="w-6 h-6 mr-2 text-yellow-300" />
                Plano Premium
              </h4>
              <p className="text-gray-200">Desbloqueie todo o potencial da VoxPromo:</p>
              <ul className="list-disc list-inside text-gray-300 mt-2">
                <li>Acesso a todas as 12 vozes</li>
                <li>Criações ilimitadas</li>
                <li>Exportação em alta qualidade (MP3, WAV)</li>
                <li>Biblioteca de trilhas sonoras exclusivas (futuro)</li>
                <li>Integração com agendadores de mídia (futuro)</li>
              </ul>
            </div>
            <button className="mt-4 bg-yellow-400 text-purple-900 font-bold py-3 px-6 rounded-full shadow-lg hover:bg-yellow-500 transition-all duration-300 transform hover:scale-105">
              Fazer Upgrade para Premium!
            </button>
          </div>
        </div>
        <p className="text-center text-gray-300 text-sm mt-6">
          Para informações sobre faturamento e preços, visite{' '}
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-yellow-300 hover:underline">
            ai.google.dev/gemini-api/docs/billing
          </a>
        </p>
      </div>
    </div>
  );
};

export default Profile;
