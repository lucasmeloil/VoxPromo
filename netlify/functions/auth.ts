import { Handler, Context } from '@netlify/functions';
import { User } from '../../src/types'; // Adjust path as necessary
import bcrypt from 'bcryptjs';

// IMPORTANT: This is an IN-MEMORY store for demonstration.
// Data WILL NOT persist across function invocations or cold starts.
// For a production app, replace with a real database (e.g., PostgreSQL, MongoDB, etc.).
let users: User[] = [];

// Seed an admin user if not already present (only happens on first function load/cold start)
if (users.length === 0) {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin157'; // Use env var for admin password
  const hashedPassword = bcrypt.hashSync(adminPassword, 10);
  users.push({
    id: 'admin-123',
    email: 'voxpromo@nexussofttech.com.br',
    password: hashedPassword, // Store hashed password
    isPremium: true,
    premiumExpirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
    creationCount: 0,
    isAdmin: true,
  });
  console.log("Admin user seeded (in-memory).");
}

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

  try {
    const payload = body ? JSON.parse(body) : {};
    const userId = event.headers['x-user-id'] || payload.userId; // Get user ID from header or body

    if (path.includes('/.netlify/functions/auth/register')) {
      const { email, password } = payload;
      if (!email || !password) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'Email e senha são obrigatórios.' }) };
      }
      if (users.some(u => u.email === email)) {
        return { statusCode: 409, headers, body: JSON.stringify({ message: 'Este e-mail já está em uso.' }) };
      }

      const hashedPassword = bcrypt.hashSync(password, 10);
      const newUser: User = {
        id: crypto.randomUUID(),
        email,
        password: hashedPassword,
        isPremium: false,
        premiumExpirationDate: null,
        creationCount: 0,
        isAdmin: false,
      };
      users.push(newUser);
      // Omit password from response
      const { password: _, ...userWithoutPassword } = newUser;
      return { statusCode: 201, headers, body: JSON.stringify(userWithoutPassword) };

    } else if (path.includes('/.netlify/functions/auth/login')) {
      const { email, password } = payload;
      if (!email || !password) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'Email e senha são obrigatórios.' }) };
      }
      const user = users.find(u => u.email === email);
      if (!user || !bcrypt.compareSync(password, user.password || '')) { // Compare hashed password
        return { statusCode: 401, headers, body: JSON.stringify({ message: 'E-mail ou senha incorretos.' }) };
      }
      // Omit password from response
      const { password: _, ...userWithoutPassword } = user;
      return { statusCode: 200, headers, body: JSON.stringify(userWithoutPassword) };

    } else if (path.includes('/.netlify/functions/auth/reset-password')) {
      const { email } = payload;
      if (!email) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'Email é obrigatório.' }) };
      }
      const userExists = users.some(u => u.email === email);
      if (!userExists) {
        // Return 200 even if not found to avoid user enumeration
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Se um e-mail válido for encontrado, as instruções de redefinição de senha serão enviadas.' }) };
      }
      console.log(`MOCK: Password reset requested for ${email}`);
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Se um e-mail válido for encontrado, as instruções de redefinição de senha serão enviadas.' }) };

    } else if (path.includes('/.netlify/functions/auth/me')) {
      if (!userId) {
        return { statusCode: 401, headers, body: JSON.stringify({ message: 'Não autorizado.' }) };
      }
      const user = users.find(u => u.id === userId);
      if (!user) {
        return { statusCode: 404, headers, body: JSON.stringify({ message: 'Usuário não encontrado.' }) };
      }
      // Check for premium expiration (in-memory check)
      if (user.isPremium && user.premiumExpirationDate) {
        const expirationDate = new Date(user.premiumExpirationDate);
        if (expirationDate <= new Date()) {
          user.isPremium = false;
          user.premiumExpirationDate = null;
          console.log(`Premium expirou para ${user.email}. Desativando.`);
        }
      }
      // Omit password from response
      const { password: _, ...userWithoutPassword } = user;
      return { statusCode: 200, headers, body: JSON.stringify(userWithoutPassword) };

    } else if (path.includes('/.netlify/functions/auth/update-subscription')) {
      if (!userId) {
        return { statusCode: 401, headers, body: JSON.stringify({ message: 'Não autorizado.' }) };
      }
      const { dateApproved } = payload;
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        return { statusCode: 404, headers, body: JSON.stringify({ message: 'Usuário não encontrado.' }) };
      }

      const PREMIUM_DURATION_DAYS = 29; // Hardcode for backend consistency
      const purchaseDate = new Date(dateApproved);
      const expirationDate = new Date(purchaseDate);
      expirationDate.setDate(purchaseDate.getDate() + PREMIUM_DURATION_DAYS);

      users[userIndex] = {
        ...users[userIndex],
        isPremium: true,
        premiumExpirationDate: expirationDate.toISOString(),
      };
      // Omit password from response
      const { password: _, ...userWithoutPassword } = users[userIndex];
      return { statusCode: 200, headers, body: JSON.stringify(userWithoutPassword) };

    } else if (path.includes('/.netlify/functions/auth/increment-creation-count')) {
      if (!userId) {
        return { statusCode: 401, headers, body: JSON.stringify({ message: 'Não autorizado.' }) };
      }
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        return { statusCode: 404, headers, body: JSON.stringify({ message: 'Usuário não encontrado.' }) };
      }

      users[userIndex].creationCount = (users[userIndex].creationCount || 0) + 1;
      // Omit password from response
      const { password: _, ...userWithoutPassword } = users[userIndex];
      return { statusCode: 200, headers, body: JSON.stringify(userWithoutPassword) };
    }

    return { statusCode: 404, headers, body: JSON.stringify({ message: 'Endpoint não encontrado.' }) };

  } catch (error: any) {
    console.error('Auth Function Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: error.message || 'Erro interno do servidor.' }),
    };
  }
};

export { handler };