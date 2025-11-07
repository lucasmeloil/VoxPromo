import React, { useEffect, useState } from 'react';
import { createPaymentPreference } from '../services/mercadopagoService';
import { CurrentView } from '../types.js';
import { CreditCardIcon, SparklesIcon, XCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';

interface PaymentPageProps {
  onViewChange: (view: CurrentView) => void;
  currentUserEmail: string; // Passed from App.tsx/AuthContext
}

const PaymentPage: React.FC<PaymentPageProps> = ({ onViewChange, currentUserEmail }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initiatePayment = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const currentBaseUrl = window.location.origin;
        // Mercado Pago will append status to these URLs
        const successUrl = `${currentBaseUrl}/premium-confirmado`;
        const failureUrl = `${currentBaseUrl}/erro-pagamento`;
        const pendingUrl = `${currentBaseUrl}/pagamento-pendente`;

        console.log("Iniciando criação de preferência de pagamento no Mercado Pago...");
        const { init_point } = await createPaymentPreference(successUrl, failureUrl, pendingUrl);

        console.log("Preferência criada, redirecionando para:", init_point);
        window.location.href = init_point; // Redirect to Mercado Pago checkout
      } catch (err: any) {
        console.error('Erro ao iniciar o pagamento:', err);
        setError(err.message || 'Falha ao iniciar o processo de pagamento. Tente novamente.');
        setIsLoading(false); // Stop loading on error
      }
    };

    if (currentUserEmail) { // Ensure user is logged in
      initiatePayment();
    } else {
      setError("Usuário não logado. Por favor, faça login para continuar.");
      setIsLoading(false);
    }

  }, [currentUserEmail]); // Re-run if user email changes (shouldn't happen on this page)

  return (
    <div className="flex items-center justify-center min-h-screen p-4 pt-20">
      <div className="card bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
        <CreditCardIcon className="w-20 h-20 text-purple-600 dark:text-yellow-400 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">
          {isLoading ? 'Preparando Seu Pagamento Premium...' : 'Erro no Pagamento'}
        </h2>

        {isLoading && (
          <div className="flex items-center justify-center space-x-3 text-lg text-purple-500 dark:text-purple-400">
            <SparklesIcon className="animate-spin-slow w-7 h-7" />
            <span>Redirecionando para o Mercado Pago...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg flex items-center shadow-md mb-4 animate-fade-in">
            <XCircleIcon className="w-6 h-6 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {!isLoading && error && (
          <button
            onClick={() => onViewChange('profile')}
            className="mt-6 glowing-button relative inline-flex items-center justify-center p-0.5 overflow-hidden rounded-full group hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800"
          >
            <span className="relative px-8 py-3 transition-all ease-in duration-75 bg-gray-900 rounded-full group-hover:bg-opacity-0 text-base md:text-lg font-bold">
              <ArrowLeftIcon className="w-5 h-5 mr-2" /> Voltar ao Perfil
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;