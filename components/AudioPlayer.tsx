import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PlayCircleIcon, PauseCircleIcon, ArrowDownTrayIcon, ShareIcon } from '@heroicons/react/24/solid';

interface AudioPlayerProps {
  src: string;
  title?: string;
  onShare?: (src: string) => void;
  small?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, title, onShare, small = false }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    };

    const setAudioTime = () => setCurrentTime(audio.currentTime);
    const setAudioPlaying = () => setIsPlaying(true);
    const setAudioPaused = () => setIsPlaying(false);

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('play', setAudioPlaying);
    audio.addEventListener('pause', setAudioPaused);
    audio.addEventListener('ended', setAudioPaused);

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('play', setAudioPlaying);
      audio.removeEventListener('pause', setAudioPaused);
      audio.removeEventListener('ended', setAudioPaused);
    };
  }, [src]);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = parseFloat(e.target.value);
      setCurrentTime(audio.currentTime);
    }
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDownload = useCallback(() => {
    if (src) {
      const link = document.createElement('a');
      link.href = src;
      link.download = `${title || 'voxpromo_ad'}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [src, title]);

  const handleShare = useCallback(() => {
    if (onShare) {
      onShare(src);
    } else {
      // Fallback for web share API or copy link
      if (navigator.share && navigator.canShare && src.startsWith('data:')) {
        // Can't directly share data URLs easily, might need to upload or convert to blob.
        // For now, let's offer to copy the link.
        navigator.clipboard.writeText(src)
          .then(() => alert('Link do áudio copiado para a área de transferência!'))
          .catch(() => alert('Erro ao copiar link.'));
      } else if (navigator.clipboard) {
         navigator.clipboard.writeText(src)
          .then(() => alert('Link do áudio copiado para a área de transferência!'))
          .catch(() => alert('Erro ao copiar link.'));
      } else {
        alert('Seu navegador não suporta compartilhamento direto.');
      }
    }
  }, [src, onShare]);

  const playerClass = small ? 'p-2' : 'p-4';
  const iconSize = small ? 'w-6 h-6' : 'w-8 h-8';
  const textSize = small ? 'text-xs' : 'text-sm';

  return (
    <div className={`flex flex-col space-y-2 card bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-all duration-300 ${playerClass}`}>
      <audio ref={audioRef} src={src} preload="metadata" />
      {title && <h4 className={`text-center font-semibold text-gray-800 dark:text-gray-100 ${small ? 'text-sm' : 'text-lg'}`}>{title}</h4>}
      <div className="flex items-center space-x-3">
        <button onClick={togglePlayPause} className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200 transition-colors duration-200">
          {isPlaying ? (
            <PauseCircleIcon className={`${iconSize} drop-shadow-md`} />
          ) : (
            <PlayCircleIcon className={`${iconSize} drop-shadow-md`} />
          )}
        </button>
        <div className="flex-1 flex items-center space-x-2">
          <span className={`text-gray-600 dark:text-gray-300 ${textSize}`}>{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1 bg-purple-200 dark:bg-purple-700 rounded-lg appearance-none cursor-pointer range-sm
                       [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-purple-600
                       [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg
                       [&::-webkit-slider-thumb]:dark:bg-purple-400
                       [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-purple-600
                       [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-lg
                       [&::-moz-range-thumb]:dark:bg-purple-400"
          />
          <span className={`text-gray-600 dark:text-gray-300 ${textSize}`}>{formatTime(duration)}</span>
        </div>
      </div>
      <div className="flex justify-center space-x-4 mt-2">
        <button
          onClick={handleDownload}
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors duration-200 text-sm"
        >
          <ArrowDownTrayIcon className="w-5 h-5" />
          {!small && <span>Baixar</span>}
        </button>
        <button
          onClick={handleShare}
          className="flex items-center space-x-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 transition-colors duration-200 text-sm"
        >
          <ShareIcon className="w-5 h-5" />
          {!small && <span>Compartilhar</span>}
        </button>
      </div>
    </div>
  );
};

export default AudioPlayer;
