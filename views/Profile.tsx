import React, { useState } from 'react';
import { Cog6ToothIcon, StarIcon, ShieldCheckIcon, CreditCardIcon, UserCircleIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { useAdHistory } from '../hooks/useAdHistory';
import { useAuth } from '../contexts/AuthContext'; // New import
import { MAX_FREE_CREATIONS } from '../constants';

interface ProfileProps {
  isPremium: boolean;
  premiumExpirationDate: string | null;
  totalAds: number;
  favoriteAds: number;
  isAdmin: boolean;
}

const Profile: React.FC<ProfileProps> = ({ isPremium, premiumExpirationDate, totalAds, favoriteAds, isAdmin }) => {
  const { currentUser } = useAuth(); // Get currentUser from AuthContext

  // Mock settings for demonstration
  const [voicePreference, setVoicePreference] = useState('any');
  const [language, setLanguage] = useState('pt-BR');
  const [targetMediaPreference, setTargetMediaPreference] = useState('any');

  const formattedExpirationDate = premiumExpirationDate ? new Date(premiumExpirationDate).toLocaleDateString('pt-BR') : 'N/A';

  return (
    <div className="container mx-auto p-4 pt-20 min-h-screen">
      <h2 className="text-3xl font-bold text-center text-purple-700 dark:text-yellow-400 mb-8 tracking-wide">
        Seu Perfil VoxPromo
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* User Info */}
        <div className="card bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl flex flex-col items-center justify-center text-center">
          <UserCircleIcon className="w-12 h-12 text-purple-500 mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Informações do Usuário</h3>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Email: <span className="font-bold text-purple-600 dark:text-yellow-400">{currentUser?.email || 'N/A'}</span>
          </p>
          {isAdmin && (
            <p className="text-green-500 dark:text-green-400 text-lg mt-2 font-bold flex items-center">
              <BuildingOfficeIcon className="w-5 h-5 mr-2" /> ADMIN
            </p>
          )}
        </div>

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
          <p className="text-gray-600 dark:text-gray-300 text-lg mt-2">
            Criações Gratuitas Restantes: <span className="font-bold text-purple-600 dark:text-yellow-400">
                {isPremium ? 'Ilimitadas' : Math.max(0, MAX_FREE_CREATIONS - (currentUser?.creationCount || 0))}
            </span>
          </p>
        </div>

        {/* Subscription Status */}
        <div className="card bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl flex flex-col items-center justify-center text-center md:col-span-2">
          <ShieldCheckIcon className="w-12 h-12 text-blue-500 mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Status da Assinatura</h3>
          {isPremium ? (
            <>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Plano Atual: <span className="font-bold text-green-500">Premium</span>
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Expira em: <span className="font-bold text-purple-600 dark:text-yellow-400">{formattedExpirationDate}</span>
              </p>
              <button className="mt-4 glowing-button relative inline-flex items-center justify-center p-0.5 overflow-hidden rounded-full group hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800">
                <span className="relative px-6 py-2 transition-all ease-in duration-75 bg-gray-900 rounded-full group-hover:bg-opacity-0 text-sm font-bold">
                    Gerenciar Assinatura
                </span>
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Plano Atual: <span className="font-bold text-gray-500">Gratuito</span>
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-md mt-2">
                (Limite de {MAX_FREE_CREATIONS} criação por conta)
              </p>
              {/* This button could redirect to landing page's premium section or directly trigger Mercado Pago */}
              <button
                onClick={() => window.location.href = '#pricing-section'} // Scroll to pricing section on landing
                className="mt-4 glowing-button relative inline-flex items-center justify-center p-0.5 overflow-hidden rounded-full group hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800"
              >
                <span className="relative px-6 py-2 transition-all ease-in duration-75 bg-gray-900 rounded-full group-hover:bg-opacity-0 text-sm font-bold">
                    Atualizar para Premium
                </span>
              </button>
            </>
          )}
        </div>
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
  );
};

export default Profile;