import {
  MERCADO_PAGO_ACCESS_TOKEN,
  MERCADO_PAGO_ITEM_PRICE,
  MERCADO_PAGO_ITEM_TITLE,
  MERCADO_PAGO_PUBLIC_KEY,
} from '../constants.js';
import { PaymentPreferenceResult, PaymentStatusResponse } from '../types.js';

// ====================================================================================================
// IMPORTANT SECURITY WARNING:
// This file contains a SIMULATION of backend interaction within a frontend-only environment.
// In a real production application, the MERCADO_PAGO_ACCESS_TOKEN MUST reside on a secure backend server.
// All API calls requiring the ACCESS_TOKEN (like creating preferences or checking payment status)
// MUST be handled by a secure backend server to protect your credentials.
// This implementation uses the ACCESS_TOKEN directly within a client-side "mock backend" function
// for demonstration purposes only. This approach is NOT PRODUCTION-READY and exposes your secret token.
// NEVER use this pattern in a real, deployed application.
// ====================================================================================================

const MERCADO_PAGO_API_BASE_URL = 'https://api.mercadopago.com';

/**
 * Initializes the Mercado Pago SDK with the public key.
 * This is primarily for embedded checkouts or card forms, but included for completeness.
 */
export const initializeMercadoPagoSDK = () => {
  if (window.MercadoPago) {
    // Corrected Mercado Pago SDK initialization syntax
    new window.MercadoPago(MERCADO_PAGO_PUBLIC_KEY, {
      locale: 'pt-BR',
    });
  } else {
    console.warn('MercadoPago SDK not loaded. Ensure the script is included in index.html.');
  }
};

/**
 * SIMULATED BACKEND FUNCTION: Creates a Mercado Pago payment preference.
 * In a real application, this function would be on your backend server.
 * It would receive minimal information from the frontend and handle the sensitive ACCESS_TOKEN securely.
 * @param successRedirectUrl The URL where Mercado Pago redirects after successful payment.
 * @param failureRedirectUrl The URL where Mercado Pago redirects after a failed payment.
 * @param pendingRedirectUrl The URL where Mercado Pago redirects after a pending payment.
 * @returns A promise that resolves with the preference ID and init_point URL.
 */
const createPaymentPreferenceBackendMock = async (
  successRedirectUrl: string,
  failureRedirectUrl: string,
  pendingRedirectUrl: string,
): Promise<PaymentPreferenceResult> => {
  console.log('MOCK BACKEND (Frontend-side): Attempting to create Mercado Pago preference...');
  try {
    const response = await fetch(`${MERCADO_PAGO_API_BASE_URL}/checkout/preferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`, // DANGER: ACCESS_TOKEN exposed here for MOCK!
      },
      body: JSON.stringify({
        items: [
          {
            title: MERCADO_PAGO_ITEM_TITLE,
            quantity: 1,
            unit_price: MERCADO_PAGO_ITEM_PRICE,
            currency_id: 'BRL',
          },
        ],
        payer: {
          // Minimal payer info for demo, in a real app this would be user-specific from your DB
          email: 'test_user_voxpromo@example.com', // Mock email
        },
        back_urls: {
          success: successRedirectUrl,
          failure: failureRedirectUrl,
          pending: pendingRedirectUrl,
        },
        auto_return: 'approved', // Auto-return to success URL after approved payment
        // In a real app, notification_url would point to your backend webhook endpoint.
        // Webhooks are the SECURE and RELIABLE way to get payment status updates.
        // notification_url: 'YOUR_SECURE_BACKEND_WEBHOOK_URL/mercadopago/webhook',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('MOCK BACKEND (Frontend-side): Mercado Pago preference creation failed:', errorData);
      throw new Error(
        `Falha ao criar preferência de pagamento: ${
          errorData.message || response.statusText
        }`,
      );
    }

    const data = await response.json();
    console.log('MOCK BACKEND (Frontend-side): Mercado Pago preference created:', data);
    return {
      preferenceId: data.id,
      init_point: data.init_point,
    };
  } catch (error) {
    console.error('MOCK BACKEND (Frontend-side): Erro ao criar preferência de pagamento:', error);
    throw error;
  }
};

/**
 * SIMULATED BACKEND FUNCTION: Checks the status of a Mercado Pago payment.
 * In a real application, this function would be on your backend server.
 * It would handle sensitive ACCESS_TOKEN securely.
 * This polling approach is less reliable and secure than webhooks for production.
 * @param paymentId The ID of the payment to check.
 * @returns A promise that resolves with the payment status response.
 */
const checkPaymentStatusBackendMock = async (
  paymentId: string,
): Promise<PaymentStatusResponse> => {
  console.log(`MOCK BACKEND (Frontend-side): Verificando status do pagamento Mercado Pago para ID: ${paymentId}`);
  try {
    const response = await fetch(`${MERCADO_PAGO_API_BASE_URL}/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`, // DANGER: ACCESS_TOKEN exposed here for MOCK!
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('MOCK BACKEND (Frontend-side): Falha na verificação de status do pagamento:', errorData);
      throw new Error(
        `Falha ao verificar status do pagamento: ${errorData.message || response.statusText}`,
      );
    }

    const data = await response.json();
    console.log('MOCK BACKEND (Frontend-side): Resposta de status do pagamento Mercado Pago:', data);
    return data as PaymentStatusResponse;
  } catch (error) {
    console.error('MOCK BACKEND (Frontend-side): Erro ao verificar status do pagamento Mercado Pago:', error);
    throw error;
  }
};


// --- Frontend API Calls (These would call your real backend in production) ---
// These functions simulate the frontend making requests to YOUR backend,
// which then securely interacts with Mercado Pago using the ACCESS_TOKEN.

/**
 * Frontend function to initiate Mercado Pago payment.
 * This function simulates a call to your own backend (represented by createPaymentPreferenceBackendMock).
 * @param successRedirectUrl The URL Mercado Pago redirects to after success.
 * @param failureRedirectUrl The URL Mercado Pago redirects to after failure.
 * @param pendingRedirectUrl The URL Mercado Pago redirects to after pending.
 * @returns A promise resolving with PaymentPreferenceResult.
 */
export const createPaymentPreference = async (
  successRedirectUrl: string,
  failureRedirectUrl: string,
  pendingRedirectUrl: string,
): Promise<PaymentPreferenceResult> => {
  console.log('FRONTEND: Solicitando criação de preferência de pagamento ao "mock backend"...');
  // Simulate network latency and then call the "backend mock"
  await new Promise(resolve => setTimeout(resolve, 500));
  return createPaymentPreferenceBackendMock(successRedirectUrl, failureRedirectUrl, pendingRedirectUrl);
};

/**
 * Frontend function to check Mercado Pago payment status.
 * This function simulates a call to your own backend (represented by checkPaymentStatusBackendMock).
 * @param paymentId The ID of the payment to check.
 * @returns A promise resolving with PaymentStatusResponse.
 */
export const checkPaymentStatus = async (
  paymentId: string,
): Promise<PaymentStatusResponse> => {
  console.log('FRONTEND: Solicitando verificação de status do pagamento ao "mock backend"...');
  // Simulate network latency and then call the "backend mock"
  await new Promise(resolve => setTimeout(resolve, 500));
  return checkPaymentStatusBackendMock(paymentId);
};