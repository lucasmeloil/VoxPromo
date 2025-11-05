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
  TIKTOK = 'TikTok',
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

export type CurrentView = 'create' | 'history' | 'profile' | 'landing';