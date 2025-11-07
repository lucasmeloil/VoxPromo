import React, { useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
// fix: remove .js extension from import
import { CurrentView } from '../../types';
import { UserCircleIcon, LockClosedIcon, SparklesIcon, XCircleIcon, EnvelopeIcon, ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
// import { GoogleIcon } from '../../components/Icons'; // Removed Google Icon

interface LoginProps {
  onViewChange: (view: CurrentView) => void;
}

const Login: React.FC<LoginProps> = ({ onViewChange }) => {
  const { login, isLoadingAuth, authError } = useAuth(); // Removed loginWithGoogle
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      onViewChange('create'); // Redirect to create on success
    } catch (error) {
      // Error is already set in authError, no need to do anything here
      console.error("Login failed:", error);
    }
  }, [email, password, login, onViewChange]);

  // Removed handleGoogleLogin as per request
  // const handleGoogleLogin = useCallback(async () => {
  //   try {
  //     await loginWithGoogle();
  //     onViewChange('create'); // Redirect to create on success
  //   } catch (error) {
  //     console.error("Google login failed:", error);
  //   }
  // }, [loginWithGoogle, onViewChange]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4 pt-20">
      <div className="card bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
        <UserCircleIcon className="w-20 h-20 text-purple-600 dark:text-yellow-400 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Fazer Login</h2>

        {authError && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg flex items-center shadow-md mb-4 animate-fade-in">
            <XCircleIcon className="w-6 h-6 mr-2" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
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
          <div>
            <label htmlFor="password" className="sr-only">Senha</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
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
              {isLoadingAuth ? <ArrowPathIcon className="animate-spin-slow w-5 h-5 mr-2" /> : <SparklesIcon className="w-5 h-5 mr-2" />}
              Entrar
            </span>
          </button>
        </form>

        {/* Removed Google Login Section */}
        {/* <div className="mt-6">
          <button
            onClick={handleGoogleLogin}
            className={`w-full flex items-center justify-center bg-blue-600 text-white font-bold py-2 px-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 ${isLoadingAuth ? 'opacity-60 cursor-not-allowed' : ''}`}
            disabled={isLoadingAuth}
          >
            <GoogleIcon className="w-5 h-5 mr-2" />
            Entrar com Google
          </button>
        </div> */}

        <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
          <button
            onClick={() => onViewChange('forgot-password')}
            className="text-purple-500 hover:underline dark:text-purple-400"
            disabled={isLoadingAuth}
          >
            Esqueceu a senha?
          </button>
        </div>
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Não tem uma conta?{' '}
          <button
            onClick={() => onViewChange('register')}
            className="text-purple-500 hover:underline dark:text-purple-400"
            disabled={isLoadingAuth}
          >
            Criar Conta
          </button>
        </div>
        <button
          onClick={() => onViewChange('landing')}
          className="mt-6 text-gray-500 hover:text-gray-300 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 text-sm flex items-center justify-center mx-auto"
          disabled={isLoadingAuth}
        >
          <ArrowLeftIcon className="w-4 h-4 mr-1" /> Voltar para o Início
        </button>
      </div>
    </div>
  );
};

export default Login;