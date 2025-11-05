import React, { useState, useEffect, useCallback } from 'react';
import { AdHistoryItem, AdPromptConfig, Gender, ToneOption, MediaType, VoiceOption, GeneratedAdContent, BackgroundMusicOption } from '../types';
import { generateAdContent, generateSpeech } from '../services/geminiService';
import { VOICE_OPTIONS, TONE_OPTIONS, MEDIA_TYPE_OPTIONS, MAX_FREE_CREATIONS, BACKGROUND_MUSIC_OPTIONS } from '../constants';
import AudioPlayer from '../components/AudioPlayer';
import CombinedAudioPlayer from '../components/CombinedAudioPlayer';
import { SparklesIcon, XCircleIcon, CheckCircleIcon, RocketLaunchIcon } from '@heroicons/react/24/solid';
import { useAdHistory } from '../hooks/useAdHistory';

interface CreateAdProps {
  onAdCreated: (ad: AdHistoryItem) => void;
  initialAdConfig?: AdPromptConfig | null;
  onClearInitialAdConfig: () => void;
  creationCount: number;
}

const CreateAd: React.FC<CreateAdProps> = ({ onAdCreated, initialAdConfig, onClearInitialAdConfig, creationCount }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(VOICE_OPTIONS[0].id);
  const [selectedTone, setSelectedTone] = useState<ToneOption>(TONE_OPTIONS[0]);
  const [selectedMediaType, setSelectedMediaType] = useState<MediaType>(MEDIA_TYPE_OPTIONS[0]);
  const [selectedBackgroundMusicId, setSelectedBackgroundMusicId] = useState<string>(BACKGROUND_MUSIC_OPTIONS[0].id);
  const [generatedText, setGeneratedText] = useState('');
  const [musicSuggestion, setMusicSuggestion] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const selectedVoice = VOICE_OPTIONS.find(v => v.id === selectedVoiceId) || VOICE_OPTIONS[0];
  const selectedBackgroundMusic = BACKGROUND_MUSIC_OPTIONS.find(music => music.id === selectedBackgroundMusicId) || BACKGROUND_MUSIC_OPTIONS[0];
  const isFreePlanLimited = creationCount >= MAX_FREE_CREATIONS;

  useEffect(() => {
    if (initialAdConfig) {
      setPrompt(initialAdConfig.prompt);
      setSelectedVoiceId(initialAdConfig.voiceId);
      setSelectedTone(initialAdConfig.tone);
      setSelectedMediaType(initialAdConfig.mediaType);
      setSelectedBackgroundMusicId(initialAdConfig.backgroundMusicId || BACKGROUND_MUSIC_OPTIONS[0].id);
      onClearInitialAdConfig();
    }
  }, [initialAdConfig, onClearInitialAdConfig]);

  const handleSubmitInternal = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isLoading) return;

    if (isFreePlanLimited) {
      setError('Você atingiu o limite de criações para o plano gratuito. Atualize para o Premium!');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedText('');
    setMusicSuggestion('');
    setAudioUrl('');
    setShowResult(false);

    try {
      // 1. Generate Ad Content (text & music suggestion)
      const adContent: GeneratedAdContent = await generateAdContent(prompt, selectedTone, selectedMediaType);
      setGeneratedText(adContent.adScript);
      setMusicSuggestion(adContent.musicSuggestion);

      // 2. Generate Speech from ad script
      const audioDataUrl: string = await generateSpeech(adContent.adScript, selectedVoice.voiceName);
      setAudioUrl(audioDataUrl);

      // Add to history
      const newAd: AdHistoryItem = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        prompt: prompt,
        voice: selectedVoice,
        tone: selectedTone,
        mediaType: selectedMediaType,
        backgroundMusicId: selectedBackgroundMusicId,
        generatedText: adContent.adScript,
        musicSuggestion: adContent.musicSuggestion,
        audioUrl: audioDataUrl,
        isFavorite: false,
      };
      onAdCreated(newAd);
      setShowResult(true);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro ao gerar a propaganda.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, selectedTone, selectedMediaType, selectedVoiceId, selectedBackgroundMusicId, onAdCreated, isLoading, isFreePlanLimited]);


  const handleClear = useCallback(() => {
    setPrompt('');
    setSelectedVoiceId(VOICE_OPTIONS[0].id);
    setSelectedTone(TONE_OPTIONS[0]);
    setSelectedMediaType(MEDIA_TYPE_OPTIONS[0]);
    setSelectedBackgroundMusicId(BACKGROUND_MUSIC_OPTIONS[0].id);
    setGeneratedText('');
    setMusicSuggestion('');
    setAudioUrl('');
    setError(null);
    setShowResult(false);
  }, []);

  const getVoiceClass = (gender: Gender) =>
    gender === Gender.FEMALE ? 'text-pink-500' : 'text-blue-500';

  return (
    <div className="container mx-auto p-4 pt-20 min-h-screen">
      <h2 className="text-3xl font-bold text-center text-purple-700 dark:text-yellow-400 mb-8 tracking-wide">
        Crie Sua Propaganda
      </h2>

      <form onSubmit={handleSubmitInternal} className="space-y-6 mb-8">
        <div className="card bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl">
          <label htmlFor="prompt" className="block text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
            Seu Prompt Descritivo:
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            placeholder="Ex: Crie uma propaganda animada para uma pizzaria com voz feminina jovem e trilha pop para rádio."
            className="input-field w-full p-3 border border-gray-300 dark:border-purple-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors duration-200"
            required
            disabled={isLoading}
          ></textarea>
        </div>

        <div className="card bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label htmlFor="voice" className="block text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
              Escolha a Voz:
            </label>
            <select
              id="voice"
              value={selectedVoiceId}
              onChange={(e) => setSelectedVoiceId(e.target.value)}
              className="select-field w-full p-3 border border-gray-300 dark:border-purple-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors duration-200"
              disabled={isLoading}
            >
              {VOICE_OPTIONS.map((voice) => (
                <option key={voice.id} value={voice.id} className={getVoiceClass(voice.gender)}>
                  {voice.name} ({voice.gender}) - {voice.style}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{selectedVoice.description}</p>
          </div>

          <div>
            <label htmlFor="tone" className="block text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
              Tom da Propaganda:
            </label>
            <select
              id="tone"
              value={selectedTone}
              onChange={(e) => setSelectedTone(e.target.value as ToneOption)}
              className="select-field w-full p-3 border border-gray-300 dark:border-purple-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors duration-200"
              disabled={isLoading}
            >
              {TONE_OPTIONS.map((tone) => (
                <option key={tone} value={tone}>
                  {tone}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="mediaType" className="block text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
              Mídia-Alvo:
            </label>
            <select
              id="mediaType"
              value={selectedMediaType}
              onChange={(e) => setSelectedMediaType(e.target.value as MediaType)}
              className="select-field w-full p-3 border border-gray-300 dark:border-purple-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors duration-200"
              disabled={isLoading}
            >
              {MEDIA_TYPE_OPTIONS.map((media) => (
                <option key={media} value={media}>
                  {media}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-full lg:col-span-1">
            <label htmlFor="backgroundMusic" className="block text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
              Música de Fundo (Estilo):
            </label>
            <select
              id="backgroundMusic"
              value={selectedBackgroundMusicId}
              onChange={(e) => setSelectedBackgroundMusicId(e.target.value)}
              className="select-field w-full p-3 border border-gray-300 dark:border-purple-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors duration-200"
              disabled={isLoading}
            >
              {BACKGROUND_MUSIC_OPTIONS.map((music) => (
                <option key={music.id} value={music.id}>
                  {music.name} - {music.styleDescription}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg flex items-center shadow-md animate-fade-in">
            <XCircleIcon className="w-6 h-6 mr-2" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            type="submit"
            className={`btn bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center ${isLoading || isFreePlanLimited ? 'opacity-60 cursor-not-allowed' : ''}`}
            disabled={isLoading || isFreePlanLimited}
          >
            {isLoading ? (
              <>
                <SparklesIcon className="animate-spin-slow w-5 h-5 mr-2" />
                Gerando...
              </>
            ) : (
              <>
                <RocketLaunchIcon className="w-5 h-5 mr-2" />
                Gerar Propaganda
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="btn bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
            disabled={isLoading}
          >
            <XCircleIcon className="w-5 h-5 mr-2" />
            Limpar
          </button>
        </div>
      </form>

      {showResult && (generatedText || audioUrl) && (
        <div className="card bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl mt-8 animate-fade-in">
          <h3 className="text-2xl font-bold text-center text-green-700 dark:text-green-400 mb-4 flex items-center justify-center">
            <CheckCircleIcon className="w-7 h-7 mr-2" />
            Propaganda Gerada!
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Roteiro:</h4>
              <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{generatedText}</p>
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Sugestão de Música:</h4>
              <p className="text-gray-700 dark:text-gray-200">{musicSuggestion}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                (A sugestão acima é da IA. Você selecionou a música de fundo: {selectedBackgroundMusic.name})
              </p>
            </div>
            {audioUrl && (
              <div className="mt-4">
                {selectedBackgroundMusic.id !== 'none' && selectedBackgroundMusic.audioUrl ? (
                  <CombinedAudioPlayer
                    speechSrc={audioUrl}
                    musicSrc={selectedBackgroundMusic.audioUrl}
                    title="Ouça sua Propaganda"
                  />
                ) : (
                  <AudioPlayer src={audioUrl} title="Ouça sua Propaganda" />
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateAd;