import React from 'react';
import { ShieldCheckIcon, UserGroupIcon } from '@heroicons/react/24/solid';

const AdminPanel: React.FC = () => {
  return (
    <div className="container mx-auto p-4 pt-20 min-h-screen flex flex-col items-center justify-center">
      <div className="card bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl text-center max-w-lg w-full">
        <ShieldCheckIcon className="w-24 h-24 text-green-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">Painel de Administração</h2>
        <p className="text-gray-700 dark:text-gray-200 text-lg mb-6">
          Bem-vindo, administrador! Esta é uma área exclusiva para gerenciamento.
        </p>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          Funcionalidades de administração seriam implementadas aqui (ex: gerenciar usuários, visualizar pagamentos, estatísticas).
        </p>
        <UserGroupIcon className="w-16 h-16 text-gray-500 mx-auto mt-8 opacity-70" />
      </div>
    </div>
  );
};

export default AdminPanel;