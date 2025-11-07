import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PlayCircleIcon, PauseCircleIcon, ArrowDownTrayIcon, ShareIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';

interface CombinedAudioPlayerProps {
  speechSrc: string;
  musicSrc: string | null;
  title?: string;
  onShare?: (speechSrc: string, musicSrc: string | null) => void;
  small?: boolean;
}

const CombinedAudioPlayer: React.FC<CombinedAudioPlayerProps> = ({ speechSrc, musicSrc, title, onShare, small = false }) => {
  const speechAudioRef = useRef<HTMLAudioElement>(null);
  const musicAudioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speechDuration, setSpeechDuration] = useState(0);
  const [musicDuration, setMusicDuration] = useState(0);
  const [speechVolume, setSpeechVolume] = useState(0.8);
  const [musicVolume, setMusicVolume] = useState(0.3);
  const [isSpeechMuted, setIsSpeechMuted] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(false);

  // Load audio data and attach event listeners
  useEffect(() => {
    const speechAudio = speechAudioRef.current;
    const musicAudio = musicAudioRef.current;

    const setAudioData = () => {
      if (speechAudio) setSpeechDuration(speechAudio.duration);
      if (musicAudio) setMusicDuration(musicAudio.duration);
    };

    const handleSpeechTimeUpdate = () => {
      if (speechAudio) setCurrentTime(speechAudio.currentTime);
    };

    const handleSpeechEnded = () => {
      setIsPlaying(false);
      if (musicAudio) musicAudio.pause();
    };

    if (speechAudio) {
      speechAudio.volume = speechVolume;
      speechAudio.muted = isSpeechMuted;
      speechAudio.addEventListener('loadeddata', setAudioData);
      speechAudio.addEventListener('timeupdate', handleSpeechTimeUpdate);
      speechAudio.addEventListener('ended', handleSpeechEnded);
    }
    if (musicAudio) {
      musicAudio.volume = musicVolume;
      musicAudio.muted = isMusicMuted;
      musicAudio.loop = true; // Loop background music
      musicAudio.addEventListener('loadeddata', setAudioData);
    }

    return () => {
      if (speechAudio) {
        speechAudio.removeEventListener('loadeddata', setAudioData);
        speechAudio.removeEventListener('timeupdate', handleSpeechTimeUpdate);
        speechAudio.removeEventListener('ended', handleSpeechEnded);
      }
      if (musicAudio) {
        musicAudio.removeEventListener('loadeddata', setAudioData);
      }
    };
  }, [speechVolume, musicVolume, isSpeechMuted, isMusicMuted]); // Re-run if volume/mute changes

  // Control play/pause for both tracks
  const togglePlayPause = useCallback(() => {
    const speechAudio = speechAudioRef.current;
    const musicAudio = musicAudioRef.current;

    if (speechAudio) {
      if (isPlaying) {
        speechAudio.pause();
        if (musicAudio) musicAudio.pause();
      } else {
        speechAudio.play();
        if (musicAudio && musicSrc) musicAudio.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying, musicSrc]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const speechAudio = speechAudioRef.current;
    const musicAudio = musicAudioRef.current;
    const newTime = parseFloat(e.target.value);

    if (speechAudio) {
      speechAudio.currentTime = newTime;
    }
    if (musicAudio) {
      // Synchronize music with speech, considering looping
      if (musicDuration > 0) {
        musicAudio.currentTime = newTime % musicDuration;
      }
    }
    setCurrentTime(newTime);
  }, [musicDuration]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDownload = useCallback(() => {
    // Note: Directly mixing and downloading combined audio on the client-side
    // is complex and outside the scope of this component.
    // For now, only the speech audio can be downloaded directly if it's a data URL.
    if (speechSrc) {
      const link = document.createElement('a');
      link.href = speechSrc;
      link.download = `${title || 'voxpromo_speech'}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert('Apenas o áudio da voz pode ser baixado nesta versão. Para áudio mixado, é necessário um software de edição.');
    }
  }, [speechSrc, title]);

  const handleShare = useCallback(() => {
    if (onShare) {
      onShare(speechSrc, musicSrc);
    } else {
      alert('Função de compartilhar indisponível ou em desenvolvimento.');
    }
  }, [speechSrc, musicSrc, onShare]);

  const playerClass = small ? 'p-2' : 'p-4';
  const iconSize = small ? 'w-6 h-6' : 'w-8 h-8';
  const textSize = small ? 'text-xs' : 'text-sm';

  return (
    <div className={`flex flex-col space-y-2 card bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-all duration-300 ${playerClass}`}>
      <audio ref={speechAudioRef} src={speechSrc} preload="metadata" />
      {musicSrc && <audio ref={musicAudioRef} src={musicSrc} preload="metadata" loop />}

      {title && <h4 className={`text-center font-semibold text-gray-800 dark:text-gray-100 ${small ? 'text-sm' : 'text-lg'}`}>{title}</h4>}

      {/* Main Playback Controls */}
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
            max={speechDuration || 0}
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
          <span className={`text-gray-600 dark:text-gray-300 ${textSize}`}>{formatTime(speechDuration)}</span>
        </div>
      </div>

      {/* Volume Controls */}
      <div className="flex justify-around items-center space-x-4 mt-2">
        {/* Speech Volume */}
        <div className="flex items-center space-x-1">
          <button onClick={() => setIsSpeechMuted(!isSpeechMuted)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200">
            {isSpeechMuted ? <SpeakerXMarkIcon className="w-5 h-5" /> : <SpeakerWaveIcon className="w-5 h-5" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={speechVolume}
            onChange={(e) => setSpeechVolume(parseFloat(e.target.value))}
            className="w-20 h-1 bg-blue-200 dark:bg-blue-700 rounded-lg appearance-none cursor-pointer range-xs"
            aria-label="Volume da Voz"
            title="Volume da Voz"
          />
          <span className={`text-gray-600 dark:text-gray-300 ${textSize}`}>Voz</span>
        </div>

        {/* Music Volume */}
        {musicSrc && (
          <div className="flex items-center space-x-1">
            <button onClick={() => setIsMusicMuted(!isMusicMuted)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200">
              {isMusicMuted ? <SpeakerXMarkIcon className="w-5 h-5" /> : <SpeakerWaveIcon className="w-5 h-5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={musicVolume}
              onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
              className="w-20 h-1 bg-yellow-200 dark:bg-yellow-700 rounded-lg appearance-none cursor-pointer range-xs"
              aria-label="Volume da Música"
              title="Volume da Música"
            />
            <span className={`text-gray-600 dark:text-gray-300 ${textSize}`}>Música</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 mt-2">
        <button
          onClick={handleDownload}
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors duration-200 text-sm"
        >
          <ArrowDownTrayIcon className="w-5 h-5" />
          {!small && <span>Baixar Voz</span>}
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

export default CombinedAudioPlayer;