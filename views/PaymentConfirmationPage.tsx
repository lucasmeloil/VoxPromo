import React, { useEffect, useState, useCallback } from 'react';
import { checkPaymentStatus } from '../services/mercadopagoService';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/solid';
import { CurrentView } from '../types';

interface PaymentConfirmationPageProps {
  onPaymentProcessed: (status: 'success' | 'failure' | 'pending') => void;
  onViewChange: (view: CurrentView) => void;
}

const POLL_INTERVAL_MS = 3000; // Poll every 3 seconds
const MAX_POLLS = 20; // Max 20 polls (approx 1 minute)

const PaymentConfirmationPage: React.FC<PaymentConfirmationPageProps> = ({ onPaymentProcessed, onViewChange }) => {
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'approved' | 'pending' | 'rejected' | 'error'>('loading');
  const [message, setMessage] = useState('Verificando o status do seu pagamento...');
  const { updateUserSubscription, currentUser } = useAuth();
  const pollCountRef = React.useRef(0);

  // Extract payment_id or collection_id/collection_status from URL query parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('payment_id') || urlParams.get('collection_id'); // Payment ID from MP
    const collectionStatus = urlParams.get('collection_status') || urlParams.get('status'); // MP status: 'approved', 'pending', 'rejected'

    if (id) {
      setPaymentId(id);
      // If collection_status is already provided by MP, use it directly
      if (collectionStatus === 'approved') {
        setStatus('approved');
        setMessage('Pagamento aprovado! Seu plano Premium está ativo!');
        if (currentUser) {
          updateUserSubscription(currentUser.id, new Date().toISOString()); // Use current date as approved date for frontend simulation
        } else {
          setMessage('Pagamento aprovado, mas não foi possível ativar o plano Premium (usuário não logado na sessão). Faça login para ver seu status premium.');
          setStatus('error'); // Treat as error because user state couldn't be updated
        }
        onPaymentProcessed('success');
      } else if (collectionStatus === 'pending') {
        setStatus('pending');
        setMessage('Seu pagamento está pendente. Estamos aguardando a confirmação.');
        // Polling will be initiated by the useEffect below if status is 'pending'
      } else if (collectionStatus === 'rejected') {
        setStatus('rejected');
        setMessage('Seu pagamento foi recusado. Por favor, tente novamente ou use outro método de pagamento.');
        onPaymentProcessed('failure');
      } else {
        // Unknown status, could be 'in_process', etc., or no status provided by MP. Initiate polling.
        setStatus('loading');
        setMessage('Status do pagamento em processamento. Verificando...');
      }
    } else {
      setStatus('error');
      setMessage('Não foi possível encontrar o ID do pagamento na URL.');
      onPaymentProcessed('failure');
    }
  }, [onPaymentProcessed, currentUser, updateUserSubscription]);

  const pollPayment = useCallback(async (currentPaymentId: string) => {
    if (status === 'approved' || status === 'rejected' || status === 'error') {
      return; // Stop polling if a final status is reached
    }

    if (pollCountRef.current >= MAX_POLLS) {
      setStatus('pending'); // Treat as pending if timeout
      setMessage('Tempo limite excedido para verificar o pagamento. Por favor, verifique seu histórico de pagamentos no perfil.');
      onPaymentProcessed('pending');
      return;
    }

    if (!currentUser) {
        setStatus('error');
        setMessage('Erro: Usuário não autenticado. Não foi possível ativar o plano Premium (sessão expirada ou não logada).');
        onPaymentProcessed('failure');
        return;
    }

    try {
      const paymentResponse = await checkPaymentStatus(currentPaymentId);
      const mpStatus = paymentResponse.status;
      console.log('Mercado Pago status received via polling:', mpStatus);

      if (mpStatus === 'approved') {
        setStatus('approved');
        setMessage('Pagamento aprovado! Seu plano Premium está ativo!');
        updateUserSubscription(currentUser.id, paymentResponse.date_approved);
        onPaymentProcessed('success');
      } else if (mpStatus === 'pending') {
        setStatus('pending');
        setMessage('Seu pagamento está pendente. Estamos aguardando a confirmação.');
        pollCountRef.current++;
        setTimeout(() => pollPayment(currentPaymentId), POLL_INTERVAL_MS);
      } else if (mpStatus === 'rejected') {
        setStatus('rejected');
        setMessage('Seu pagamento foi recusado. Por favor, tente novamente ou use outro método de pagamento.');
        onPaymentProcessed('failure');
      } else {
        setStatus('pending'); // Default to pending for ongoing statuses like 'in_process'
        setMessage(`Status do pagamento: ${mpStatus}. Estamos aguardando a confirmação.`);
        pollCountRef.current++;
        setTimeout(() => pollPayment(currentPaymentId), POLL_INTERVAL_MS);
      }
    } catch (error) {
      console.error('Error during payment polling:', error);
      setStatus('error');
      setMessage('Ocorreu um erro ao verificar o status do pagamento. Por favor, tente novamente mais tarde.');
      onPaymentProcessed('failure');
    }
  }, [onPaymentProcessed, updateUserSubscription, currentUser, status]);

  useEffect(() => {
    // Only start polling if paymentId is set AND status is 'loading' or 'pending'
    if (paymentId && (status === 'loading' || status === 'pending')) {
      // Avoid starting polling if the status was already resolved by URL param (e.g., collection_status='approved')
      if (status !== 'loading' && pollCountRef.current === 0) {
          return;
      }
      pollPayment(paymentId);
    }
  }, [paymentId, status, pollPayment]);

  const renderStatusIcon = () => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="w-24 h-24 text-green-500 mx-auto mb-4" />;
      case 'rejected':
      case 'error':
        return <XCircleIcon className="w-24 h-24 text-red-500 mx-auto mb-4" />;
      case 'pending':
        return <ClockIcon className="w-24 h-24 text-yellow-500 mx-auto mb-4 animate-pulse" />;
      case 'loading':
      default:
        return <ClockIcon className="w-24 h-24 text-purple-500 mx-auto mb-4 animate-spin-slow" />;
    }
  };

  const statusTextColor = {
    loading: 'text-purple-400',
    approved: 'text-green-400',
    pending: 'text-yellow-400',
    rejected: 'text-red-400',
    error: 'text-red-400',
  }[status];

  return (
    <div className="container mx-auto p-4 pt-20 min-h-screen flex items-center justify-center">
      <div className="card bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl text-center max-w-lg w-full">
        {renderStatusIcon()}
        <h2 className={`text-3xl font-bold ${statusTextColor} mb-4`}>
          {status === 'loading' ? 'Processando Pagamento...' :
           status === 'approved' ? 'Pagamento Aprovado!' :
           status === 'pending' ? 'Pagamento Pendente' :
           status === 'rejected' ? 'Pagamento Recusado' :
           'Erro no Pagamento'}
        </h2>
        <p className="text-gray-700 dark:text-gray-200 text-lg mb-6">{message}</p>

        <button
          onClick={() => onViewChange('profile')} // Always navigate to profile to show status
          className="glowing-button relative inline-flex items-center justify-center p-0.5 overflow-hidden rounded-full group hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800"
        >
          <span className="relative px-8 py-3 transition-all ease-in duration-75 bg-gray-900 rounded-full group-hover:bg-opacity-0 text-base md:text-lg font-bold">
              Ir para o Perfil
          </span>
        </button>
      </div>
    </div>
  );
};

export default PaymentConfirmationPage;