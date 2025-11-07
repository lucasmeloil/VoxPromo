import { Handler, Context } from '@netlify/functions';
import { AdHistoryItem } from '../../types'; // Adjust path as necessary

// IMPORTANT: This is an IN-MEMORY store for demonstration.
// Data WILL NOT persist across function invocations or cold starts.
// For a production app, replace with a real database (e.g., PostgreSQL, MongoDB, etc.).
interface UserHistory {
  [userId: string]: AdHistoryItem[];
}
let adHistoryStore: UserHistory = {};

const handler: Handler = async (event, context: Context) => {
  const { path, httpMethod, body } = event;

  // Set CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*', // Allow any origin for simplicity in dev
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id', // Allow X-User-Id header
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
    };
  }

  const userId = event.headers['x-user-id']; // User ID is expected in the header

  if (!userId) {
    return { statusCode: 401, headers, body: JSON.stringify({ message: 'Não autorizado: X-User-Id header é obrigatório.' }) };
  }

  // Initialize history for the user if it doesn't exist
  if (!adHistoryStore[userId]) {
    adHistoryStore[userId] = [];
  }

  try {
    const payload = body ? JSON.parse(body) : {};

    if (path.includes('/.netlify/functions/history/add') && httpMethod === 'POST') {
      const newAd: AdHistoryItem = payload;
      if (!newAd || !newAd.id) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'Dados da propaganda inválidos.' }) };
      }
      adHistoryStore[userId].push(newAd);
      return { statusCode: 201, headers, body: JSON.stringify(newAd) };

    } else if (path.includes('/.netlify/functions/history/update') && httpMethod === 'PUT') {
      const updatedAd: AdHistoryItem = payload;
      if (!updatedAd || !updatedAd.id) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'Dados da propaganda inválidos.' }) };
      }
      const index = adHistoryStore[userId].findIndex(ad => ad.id === updatedAd.id);
      if (index === -1) {
        return { statusCode: 404, headers, body: JSON.stringify({ message: 'Propaganda não encontrada.' }) };
      }
      adHistoryStore[userId][index] = updatedAd;
      return { statusCode: 200, headers, body: JSON.stringify(updatedAd) };

    } else if (path.includes('/.netlify/functions/history/clear') && httpMethod === 'POST') {
      adHistoryStore[userId] = [];
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Histórico limpo.' }) };

    } else if (path.includes('/.netlify/functions/history') && httpMethod === 'GET') {
      return { statusCode: 200, headers, body: JSON.stringify(adHistoryStore[userId]) };
    }

    return { statusCode: 404, headers, body: JSON.stringify({ message: 'Endpoint não encontrado.' }) };

  } catch (error: any) {
    console.error('History Function Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: error.message || 'Erro interno do servidor.' }),
    };
  }
};

export { handler };