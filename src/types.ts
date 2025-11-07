export enum Gender {
  MALE = 'Masculina',
  FEMALE = 'Feminina',
}

export type GeminiVoiceName = 'Zephyr' | 'Puck' | 'Charon' | 'Kore' | 'Fenrir';

export interface VoiceOption {
  id: string;
  name: string;
  gender: Gender;
  style: string;
  voiceName: GeminiVoiceName;
  description: string;
}

export interface BackgroundMusicOption {
  id: string;
  name: string;
  styleDescription: string;
  audioUrl: string; // Path to the static audio file (e.g., /music/track1.mp3)
}

export enum ToneOption {
  INSTITUTIONAL = 'Institucional',
  ANIMATED = 'Animado',
  EMOCIONAL = 'Emocional',
  FUN = 'Divertido',
  EPIC = 'Épico',
}

export enum MediaType {
  RADIO = 'Rádio',
  TELEVISION = 'Televisão',
  INSTAGRAM = 'Instagram',
  TIKTOK = 'YouTube',
  YOUTUBE = 'YouTube',
}

export interface AdPromptConfig {
  prompt: string;
  voiceId: string;
  tone: ToneOption;
  mediaType: MediaType;
  backgroundMusicId?: string; // New property for background music
}

export interface GeneratedAdContent {
  adScript: string;
  musicSuggestion: string;
}

export interface AdHistoryItem {
  id: string;
  timestamp: string;
  prompt: string;
  voice: VoiceOption;
  tone: ToneOption;
  mediaType: MediaType;
  backgroundMusicId?: string; // New property for background music
  generatedText: string;
  musicSuggestion: string;
  audioUrl: string; // Base64 encoded audio or blob URL for speech
  isFavorite: boolean;
}

export type CurrentView = 'create' | 'history' | 'profile' | 'landing' | 'payment' | 'premium-confirmado' | 'erro-pagamento' | 'pagamento-pendente' | 'login' | 'register' | 'forgot-password' | 'admin-panel';

export interface PaymentPreferenceResult {
  preferenceId: string;
  init_point: string;
}

export interface PaymentStatusResponse {
  id: number;
  status: string; // e.g., 'approved', 'pending', 'rejected'
  date_approved: string; // ISO 8601 date string
}

export interface User {
  id: string;
  email: string;
  password?: string; // Only for simulated local storage, NOT for production
  isPremium: boolean;
  premiumExpirationDate: string | null; // ISO string
  creationCount: number;
  isAdmin: boolean;
}

declare global {
  interface Window {
    MercadoPago: any; // Declare MercadoPago to exist on the Window object
  }
}