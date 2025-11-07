import React, { useEffect, useState, useCallback } from 'react';
import { SparklesIcon, CheckCircleIcon, ArrowRightOnRectangleIcon, KeyIcon } from '@heroicons/react/24/solid';
import { initializeMercadoPagoSDK } from '../services/mercadopagoService'; // createPaymentPreference will be called from PaymentPage
import { MERCADO_PAGO_ITEM_PRICE } from '../constants.js';
import { useAuth } from '../contexts/AuthContext';
import { CurrentView } from '../types.js';

interface LandingPageProps {
    onStartApp: () => void;
    isPremium: boolean;
    onViewChange: (view: CurrentView) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartApp, isPremium, onViewChange }) => {
    const { currentUser } = useAuth();
    const [isLoadingPayment, setIsLoadingPayment] = useState(false); // This state will be mainly managed by PaymentPage now
    const [paymentError, setPaymentError] = useState<string | null>(null); // This error will also be managed by PaymentConfirmationPage now

    useEffect(() => {
        // Initialize Mercado Pago SDK once
        initializeMercadoPagoSDK();

        // Function to handle smooth scrolling for internal links
        const handleAnchorClick = (event: Event) => {
            event.preventDefault();
            const targetId = (event.currentTarget as HTMLAnchorElement).getAttribute('href')?.substring(1);
            if (targetId) {
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        };

        // Attach listeners to internal scroll links
        const featureLink = document.querySelector('a[href="#features-section"]');
        const pricingLink = document.querySelector('a[href="#pricing-section"]');

        featureLink?.addEventListener('click', handleAnchorClick);
        pricingLink?.addEventListener('click', handleAnchorClick);

        return () => {
            featureLink?.removeEventListener('click', handleAnchorClick);
            pricingLink?.removeEventListener('click', handleAnchorClick);
        };
    }, []);

    const handlePurchasePremium = useCallback(async () => {
        if (!currentUser) {
            // If not logged in, prompt to login/register
            alert('Por favor, faça login ou crie uma conta antes de adquirir o plano Premium.');
            onViewChange('login');
            return;
        }

        // Redirect to the new /payment page to initiate the Mercado Pago flow
        onViewChange('payment');
    }, [currentUser, onViewChange]);

    const handleStartAppClick = useCallback(() => {
        if (currentUser) {
            onViewChange('create'); // Go to create page if logged in
        } else {
            onViewChange('login'); // Go to login page if not logged in
        }
    }, [currentUser, onViewChange]);

    return (
        <div id="landing-page" className="min-h-screen flex flex-col items-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-transparent to-indigo-900 opacity-20"></div>
            <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\'16\' height=\'16\' viewBox=\'0 0 16 16\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23a78bfa\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M0 0h8v8H0zM8 8h8v8H8z\'/%3E%3C/g%3E%3C/svg%3E')", backgroundSize: '16px 16px' }}></div>

            <div className="z-10 w-full max-w-sm sm:max-w-md mx-auto space-y-8 py-12 text-center">
                <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight drop-shadow-lg glowing-text animate-fade-in-up">
                    VoxPromo<span className="text-purple-400">.ai</span>
                </h1>
                <p className="text-lg md:text-xl text-purple-200 mt-4 animate-fade-in-up delay-200 font-semibold">
                    Sua voz na criação de propagandas musicais, impulsionada por IA.
                </p>
                <p className="text-sm md:text-base text-gray-300 animate-fade-in-up delay-400 max-w-xs mx-auto">
                    Transforme suas ideias em anúncios cativantes para rádio, TV e redes sociais em segundos.
                </p>
                <div className="flex flex-col gap-4 mt-8 animate-fade-in-up delay-600">
                    <button onClick={handleStartAppClick} className="glowing-button relative inline-flex items-center justify-center p-0.5 overflow-hidden rounded-full group hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800">
                        <span className="relative px-8 py-3 transition-all ease-in duration-75 bg-gray-900 rounded-full group-hover:bg-opacity-0 text-base md:text-lg font-bold">
                            {currentUser ? 'Comece a Criar Agora!' : 'Entrar para Começar'}
                        </span>
                    </button>
                    {!currentUser && (
                        <button
                            onClick={() => onViewChange('register')}
                            className="inline-flex items-center justify-center px-8 py-3 border border-purple-600 text-purple-200 rounded-full text-base md:text-lg font-bold hover:bg-purple-700 hover:text-white transition-all duration-300 shadow-lg"
                        >
                            Criar Conta Gratuita
                        </button>
                    )}
                    <a href="#features-section" className="inline-flex items-center justify-center px-8 py-3 border border-purple-600 text-purple-200 rounded-full text-base md:text-lg font-bold hover:bg-purple-700 hover:text-white transition-all duration-300 shadow-lg">
                        Descubra os Recursos
                    </a>
                </div>
            </div>

            {/* Features Section */}
            <section id="features-section" className="z-10 w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto p-6 mt-16 bg-gradient-to-br from-gray-900/80 to-black/80 rounded-2xl shadow-purple-900/50 shadow-xl border border-purple-800 animate-fade-in-up delay-800 scroll-mt-20">
                <h2 className="text-3xl font-extrabold text-center text-white glowing-text mb-8">
                    Recursos Inovadores
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="feature-card bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-lg transform transition-all duration-300 hover:scale-105 hover:border-purple-600">
                        <svg className="w-10 h-10 text-purple-400 mb-3 mx-auto" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"></path></svg>
                        <h3 className="text-xl font-bold text-white text-center mb-2">Vozes Realistas com IA</h3>
                        <p className="text-gray-300 text-center text-sm">Escolha entre vozes variadas para dar vida à sua mensagem.</p>
                    </div>
                    <div className="feature-card bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-lg transform transition-all duration-300 hover:scale-105 hover:border-purple-600">
                        <svg className="w-10 h-10 text-purple-400 mb-3 mx-auto" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.586 11H16a1 1 0 001-1V9a1 1 0 00-1-1h-1.414l-1.707-1.707A1 1 0 0012 6v7a1 1 0 00.293.707l1.707 1.707z" clip-rule="evenodd"></path></svg>
                        <h3 className="text-xl font-bold text-white text-center mb-2">Trilhas Sonoras Personalizadas</h3>
                        <p className="text-gray-300 text-center text-sm">Integre músicas de fundo que se alinham com o tone da sua propaganda.</p>
                    </div>
                    <div className="feature-card bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-lg transform transition-all duration-300 hover:scale-105 hover:border-purple-600 md:col-span-2 lg:col-span-1">
                        <svg className="w-10 h-10 text-purple-400 mb-3 mx-auto" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 110-6 3 3 0 010 6z"></path></svg>
                        <h3 className="text-xl font-bold text-white text-center mb-2">Geração Multi-Mídia</h3>
                        <p className="text-gray-300 text-center text-sm">Crie anúncios otimizados para rádio, TV, Instagram, TikTok e YouTube.</p>
                    </div>
                </div>
            </section>

            {/* Monetization Section */}
            <section id="pricing-section" className="z-10 w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto p-6 mt-16 bg-gradient-to-br from-gray-900/80 to-black/80 rounded-2xl shadow-purple-900/50 shadow-xl border border-purple-800 animate-fade-in-up delay-1000 scroll-mt-20">
                <h2 className="text-3xl font-extrabold text-center text-white glowing-text mb-8">
                    Escolha o Plano Perfeito
                </h2>

                {paymentError && (
                    <div className="bg-red-700 text-white p-3 rounded-lg text-center mb-4 animate-fade-in">
                        {paymentError}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Free Plan Card */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg flex flex-col justify-between transform transition-all duration-300 hover:scale-105 hover:border-purple-600">
                        <div>
                            <h3 className="text-2xl font-bold text-purple-400 mb-3 text-center">
                                Plano Gratuito
                            </h3>
                            <p className="text-lg text-gray-300 text-center mb-5">
                                Experimente a magia da VoxPromo!
                            </p>
                            <ul className="flex flex-col items-start space-y-3 mb-6 px-4">
                                <li className="flex items-center text-gray-400 text-base"><SparklesIcon className="w-5 h-5 mr-3 text-purple-400" /> 1 Criação Gratuita por Conta</li>
                                <li className="flex items-center text-gray-400 text-base"><SparklesIcon className="w-5 h-5 mr-3 text-purple-400" /> Acesso a vozes básicas</li>
                                <li className="flex items-center text-gray-400 text-base"><SparklesIcon className="w-5 h-5 mr-3 text-purple-400" /> Exportação padrão (WAV)</li>
                                <li className="flex items-center text-gray-400 text-base"><SparklesIcon className="w-5 h-5 mr-3 text-purple-400" /> Histórico de criações (por sessão)</li>
                            </ul>
                        </div>
                        <button onClick={handleStartAppClick} className="mt-auto bg-purple-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 text-base w-full">
                            {currentUser ? 'Comece Grátis!' : 'Entrar para Começar!'}
                        </button>
                    </div>

                    {/* Premium Plan Card - Highlighted */}
                    <div className="bg-gradient-to-br from-yellow-700 to-amber-900 p-6 rounded-xl border border-yellow-500 shadow-2xl premium-glow flex flex-col justify-between transform transition-all duration-300 hover:scale-105">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-3 text-center">
                                <SparklesIcon className="w-6 h-6 mr-2 inline-block text-white" />
                                Plano Premium
                            </h3>
                            {isPremium ? (
                                <p className="text-xl font-extrabold text-yellow-300 text-center mb-2 flex items-center justify-center">
                                    <CheckCircleIcon className="w-7 h-7 mr-2 text-green-300" /> Acesso Premium Ativo!
                                </p>
                            ) : (
                                <p className="text-xl font-extrabold text-yellow-300 text-center mb-2">R$ {MERCADO_PAGO_ITEM_PRICE.toFixed(2).replace('.', ',')} <span className="text-lg font-normal text-yellow-200">/ mês</span></p>
                            )}
                            <p className="text-base text-yellow-100 text-center mb-5">
                                Liberte sua criatividade sem limites!
                            </p>
                            <ul className="flex flex-col items-start space-y-3 mb-6 px-4">
                                <li className="flex items-center text-yellow-100 text-base"><SparklesIcon className="w-5 h-5 mr-3 text-white" /> Criações Ilimitadas</li>
                                <li className="flex items-center text-yellow-100 text-base"><SparklesIcon className="w-5 h-5 mr-3 text-white" /> Acesso a TODAS as 12 vozes exclusivas</li>
                                <li className="flex items-center text-yellow-100 text-base"><SparklesIcon className="w-5 h-5 mr-3 text-white" /> Exportação em alta qualidade (MP3, WAV)</li>
                                <li className="flex items-center text-yellow-100 text-base"><SparklesIcon className="w-5 h-5 mr-3 text-white" /> Biblioteca de trilhas sonoras exclusivas (futuro)</li>
                                <li className="flex items-center text-yellow-100 text-base"><SparklesIcon className="w-5 h-5 mr-3 text-white" /> Integração com agendadores de mídia (futuro)</li>
                            </ul>
                        </div>
                        <button
                            onClick={isPremium ? undefined : handlePurchasePremium}
                            className={`mt-auto bg-white text-purple-900 font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 text-base w-full
                                ${isPremium ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-200'}
                                ${isLoadingPayment ? 'opacity-60 cursor-wait' : ''}`}
                            disabled={isPremium || isLoadingPayment}
                        >
                            {isLoadingPayment ? 'Iniciando Pagamento...' : (isPremium ? 'Premium Ativo!' : 'Liberar Acesso Ilimitado!')}
                        </button>
                    </div>
                </div>
            </section>

            <footer className="z-10 mt-16 text-center text-gray-500 text-xs p-4 w-full">
                &copy; {new Date().getFullYear()} VoxPromo.ai. Criado pela <span className="text-purple-400 font-semibold">NEXUS SOFT TECH</span>. Todos os direitos reservados.
            </footer>
        </div>
    );
};

export default LandingPage;