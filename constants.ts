import { Gender, VoiceOption, ToneOption, MediaType, BackgroundMusicOption } from './types';

export const VOICE_OPTIONS: VoiceOption[] = [
  { id: 'f1', name: 'Aurora', gender: Gender.FEMALE, style: 'Jovem e Animada', voiceName: 'Zephyr', description: 'Uma voz feminina vibrante e jovial, ideal para campanhas dinâmicas.' },
  { id: 'f2', name: 'Luna', gender: Gender.FEMALE, style: 'Calma e Confiante', voiceName: 'Kore', description: 'Voz feminina suave e profissional, perfeita para mensagens institucionais.' },
  { id: 'f3', name: 'Estrela', gender: Gender.FEMALE, style: 'Amigável e Expressiva', voiceName: 'Zephyr', description: 'Uma voz versátil, amigável e com ótima dicção.' },
  { id: 'f4', name: 'Serena', gender: Gender.FEMALE, style: 'Sofisticada e Clara', voiceName: 'Kore', description: 'Voz feminina elegante e clara, ideal para público mais seleto.' },
  { id: 'f5', name: 'Vivian', gender: Gender.FEMALE, style: 'Entusiasta e Envolvente', voiceName: 'Zephyr', description: 'Uma voz que transmite entusiasmo e cativa a atenção.' },
  { id: 'f6', name: 'Clara', gender: Gender.FEMALE, style: 'Profissional e Direta', voiceName: 'Kore', description: 'Voz feminina direta e profissional para informações importantes.' },

  { id: 'm1', name: 'Titan', gender: Gender.MALE, style: 'Vigoroso e Jovem', voiceName: 'Puck', description: 'Uma voz masculina enérgica e jovial, perfeita para anúncios de impacto.' },
  { id: 'm2', name: 'Netuno', gender: Gender.MALE, style: 'Profundo e Autoritário', voiceName: 'Charon', description: 'Voz masculina grave e imponente, ideal para mensagens de autoridade.' },
  { id: 'm3', name: 'Orion', gender: Gender.MALE, style: 'Robusto e Confiante', voiceName: 'Fenrir', description: 'Uma voz masculina forte e segura, que inspira confiança.' },
  { id: 'm4', name: 'Apolo', gender: Gender.MALE, style: 'Animado e Expressivo', voiceName: 'Puck', description: 'Voz masculina dinâmica e cheia de vida, para campanhas divertidas.' },
  { id: 'm5', name: 'Atlas', gender: Gender.MALE, style: 'Sério e Persuasivo', voiceName: 'Charon', description: 'Uma voz masculina séria e focada, para persuadir o ouvinte.' },
  { id: 'm6', name: 'Zenith', gender: Gender.MALE, style: 'Amigável e Acolhedor', voiceName: 'Fenrir', description: 'Voz masculina calorosa e acessível, que gera conexão.' },
];

export const BACKGROUND_MUSIC_OPTIONS: BackgroundMusicOption[] = [
  { id: 'none', name: 'Nenhuma', styleDescription: 'Sem música de fundo.', audioUrl: '' },
  { id: 'pop-energetic', name: 'Pop Energético', styleDescription: 'Trilha pop com batida animada, ideal para produtos modernos.', audioUrl: '/music/pop-energetic.mp3' },
  { id: 'calm-corporate', name: 'Calma Corporativa', styleDescription: 'Música suave e inspiradora para mensagens institucionais.', audioUrl: '/music/calm-corporate.mp3' },
  { id: 'epic-dramatic', name: 'Épico Dramático', styleDescription: 'Trilha sonora orquestral grandiosa e dramática, perfeita para momentos de impacto.', audioUrl: '/music/epic-dramatic.mp3' },
  { id: 'jazzy-upbeat', name: 'Jazz Alegre', styleDescription: 'Ritmo descontraído e elegante para culinária e eventos.', audioUrl: '/music/jazzy-upbeat.mp3' },
  { id: 'acoustic-folk', name: 'Folk Acústico', styleDescription: 'Música orgânica e autêntica para produtos artesanais e natureza.', audioUrl: '/music/acoustic-folk.mp3' },
];

export const TONE_OPTIONS: ToneOption[] = [
  ToneOption.INSTITUTIONAL,
  ToneOption.ANIMATED,
  ToneOption.EMOCIONAL,
  ToneOption.FUN,
  ToneOption.EPIC,
];

export const MEDIA_TYPE_OPTIONS: MediaType[] = [
  MediaType.RADIO,
  MediaType.TELEVISION,
  MediaType.INSTAGRAM,
  MediaType.TIKTOK,
  MediaType.YOUTUBE,
];

// Changed from localStorage to sessionStorage for session-based persistence
export const SESSION_STORAGE_HISTORY_KEY = 'voxpromo_ad_history'; // User's ad history (session-based)
export const SESSION_STORAGE_USERS_KEY = 'voxpromo_users'; // Simulated user database (session-based)
export const SESSION_STORAGE_CURRENT_USER_KEY = 'voxpromo_current_user'; // Logged-in user (session-based)

export const MAX_FREE_CREATIONS = 1; // Limit for free plan

// Mercado Pago API Keys (DANGER: Exposing ACCESS_TOKEN in frontend is INSECURE in production)
// This token is kept here for demonstration purposes only, to allow the frontend to simulate
// a backend interaction directly calling Mercado Pago API.
// In a real application, this MUST be on a secure backend server, and NEVER exposed client-side.
export const MERCADO_PAGO_ACCESS_TOKEN = 'APP_USR-543649172871662-110521-c419df4131b611ad6631746d303c262d-2932783245';
export const MERCADO_PAGO_PUBLIC_KEY = 'APP_USR-1ad9971d-3308-4548-aad7-b76049fe6782';
export const MERCADO_PAGO_ITEM_PRICE = 19.90; // Updated price as per user example
export const MERCADO_PAGO_ITEM_TITLE = 'Plano Premium VoxPromo.ai (29 dias)';
export const PREMIUM_DURATION_DAYS = 29; // Premium validity in days

// Admin User Credentials (for frontend simulation only - session-based)
export const ADMIN_EMAIL = 'voxpromo@nexussofttech.com.br';
export const ADMIN_PASSWORD = 'admin157';