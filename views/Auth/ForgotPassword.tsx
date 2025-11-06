import React, { useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { CurrentView } from '../../types';
import { EnvelopeIcon, KeyIcon, XCircleIcon, CheckCircleIcon, ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

interface ForgotPasswordProps {
  onViewChange: (view: CurrentView) => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onViewChange }) => {
  const { resetPassword, isLoadingAuth, authError } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleResetPassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSuccess(false);
    try {
      await resetPassword(email);
      setMessage("Se um e-mail válido for encontrado, as instruções de redefinição de senha serão enviadas.");
      setIsSuccess(true);
    } catch (error) {
      // Error is already set in authError, but we can set a generic message here too
      setMessage(authError || "Erro ao tentar redefinir a senha.");
      setIsSuccess(false);
      console.error("Password reset failed:", error);
    }
  }, [email, resetPassword, authError]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4 pt-20">
      <div className="card bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
        <KeyIcon className="w-20 h-20 text-purple-600 dark:text-yellow-400 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Esqueceu a Senha?</h2>

        {(authError || message) && (
          <div className={`px-4 py-3 rounded-lg flex items-center shadow-md mb-4 animate-fade-in
            ${isSuccess ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200'}`}
          >
            {isSuccess ? <CheckCircleIcon className="w-6 h-6 mr-2" /> : <XCircleIcon className="w-6 h-6 mr-2" />}
            <span>{message || authError}</span>
          </div>
        )}

        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Por favor, digite seu e-mail para receber as instruções de recuperação de senha.
        </p>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu e-mail"
                className="input-field w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500"
                required
                disabled={isLoadingAuth}
              />
            </div>
          </div>
          <button
            type="submit"
            className={`glowing-button w-full relative inline-flex items-center justify-center p-0.5 overflow-hidden rounded-full group hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 ${isLoadingAuth ? 'opacity-60 cursor-not-allowed' : ''}`}
            disabled={isLoadingAuth}
          >
            <span className="relative px-8 py-2 transition-all ease-in duration-75 bg-gray-900 rounded-full group-hover:bg-opacity-0 text-base font-bold flex items-center justify-center">
              {isLoadingAuth ? <ArrowPathIcon className="animate-spin-slow w-5 h-5 mr-2" /> : null}
              Redefinir Senha
            </span>
          </button>
        </form>

        <div className="mt-6 text-sm text-gray-600 dark:text-gray-300">
          <button
            onClick={() => onViewChange('login')}
            className="text-purple-500 hover:underline dark:text-purple-400"
            disabled={isLoadingAuth}
          >
            Voltar para o Login
          </button>
        </div>
        <button
          onClick={() => onViewChange('landing')}
          className="mt-4 text-gray-500 hover:text-gray-300 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 text-sm flex items-center justify-center mx-auto"
          disabled={isLoadingAuth}
        >
          <ArrowLeftIcon className="w-4 h-4 mr-1" /> Voltar para o Início
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;