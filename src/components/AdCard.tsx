import React from 'react';
// fix: add file extensions to imports
import { AdHistoryItem } from '../types.ts';
import AudioPlayer from './AudioPlayer.tsx'; // Keep for cases without background music
import CombinedAudioPlayer from './CombinedAudioPlayer.tsx'; // New combined player
import { HeartIcon, PencilIcon, DocumentDuplicateIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline';
// fix: add file extensions to imports
import { BACKGROUND_MUSIC_OPTIONS } from '../constants.ts';

interface AdCardProps {
  ad: AdHistoryItem;
  onFavoriteToggle: (id: string) => void;
  onEdit: (ad: AdHistoryItem) => void;
  onDuplicate: (ad: AdHistoryItem) => void;
}

const AdCard: React.FC<AdCardProps> = ({ ad, onFavoriteToggle, onEdit, onDuplicate }) => {
  const isFavorite = ad.isFavorite || false; // Ensure it's never undefined
  const selectedBackgroundMusic = BACKGROUND_MUSIC_OPTIONS.find(music => music.id === ad.backgroundMusicId);

  return (
    <div className="card bg-white dark:bg-gray-800 rounded-xl shadow-2xl transition-all duration-300 hover:scale-105 flex flex-col p-4 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{ad.prompt.substring(0, 50)}{ad.prompt.length > 50 ? '...' : ''}</h3>
        <button
          onClick={() => onFavoriteToggle(ad.id)}
          className="text-yellow-500 hover:scale-110 transition-transform duration-200"
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          {isFavorite ? (
            <HeartIcon className="w-7 h-7" />
          ) : (
            <HeartIconOutline className="w-7 h-7" />
          )}
        </button>
      </div>
      <p className="text-gray-600 dark:text-gray-300 text-sm">
        <span className="font-semibold">Voz:</span> {ad.voice.name} ({ad.voice.gender})
      </p>
      {selectedBackgroundMusic && selectedBackgroundMusic.id !== 'none' && (
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          <span className="font-semibold">Música:</span> {selectedBackgroundMusic.name}
        </p>
      )}
      <p className="text-gray-600 dark:text-gray-300 text-sm">
        <span className="font-semibold">Tom:</span> {ad.tone} | <span className="font-semibold">Mídia:</span> {ad.mediaType}
      </p>
      <p className="text-gray-600 dark:text-gray-300 text-sm">
        <span className="font-semibold">Data:</span> {new Date(ad.timestamp).toLocaleDateString()}
      </p>
      <div className="flex-1 overflow-hidden">
        <p className="text-gray-700 dark:text-gray-200 text-sm mb-2 max-h-24 overflow-y-auto custom-scrollbar">
          <span className="font-semibold">Roteiro:</span> {ad.generatedText}
        </p>
        <p className="text-gray-700 dark:text-gray-200 text-sm max-h-20 overflow-y-auto custom-scrollbar">
          <span className="font-semibold">Sugestão de Música:</span> {ad.musicSuggestion}
        </p>
      </div>

      {ad.audioUrl && (
        selectedBackgroundMusic && selectedBackgroundMusic.id !== 'none' && selectedBackgroundMusic.audioUrl ? (
          <CombinedAudioPlayer
            speechSrc={ad.audioUrl}
            musicSrc={selectedBackgroundMusic.audioUrl}
            title="Ouça sua Propaganda"
            small
          />
        ) : (
          <AudioPlayer src={ad.audioUrl} title="Áudio da Propaganda" small />
        )
      )}

      <div className="flex justify-around pt-2 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => onEdit(ad)}
          className="flex items-center space-x-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200 transition-colors duration-200 text-sm"
        >
          <PencilIcon className="w-5 h-5" />
          <span>Editar</span>
        </button>
        <button
          onClick={() => onDuplicate(ad)}
          className="flex items-center space-x-1 text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-200 transition-colors duration-200 text-sm"
        >
          <DocumentDuplicateIcon className="w-5 h-5" />
          <span>Duplicar</span>
        </button>
      </div>
    </div>
  );
};

export default AdCard;