import React, { useState, useEffect, useMemo } from 'react';
// fix: remove .js extension from import
import { AdHistoryItem, AdPromptConfig, BackgroundMusicOption } from '../types';
import AdCard from '../components/AdCard';
import { FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useAdHistory } from '../hooks/useAdHistory';
// fix: remove .js extension from import
import { VoiceOption } from '../types';
// fix: remove .js extension from import
import { VOICE_OPTIONS, BACKGROUND_MUSIC_OPTIONS } from '../constants';

interface HistoryProps {
  onEditAd: (config: AdPromptConfig) => void;
}

const ITEMS_PER_PAGE = 6;

const History: React.FC<HistoryProps> = ({ onEditAd }) => {
  const { history, updateAdInHistory } = useAdHistory();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVoiceFilter, setSelectedVoiceFilter] = useState<string>('all');
  const [selectedMusicFilter, setSelectedMusicFilter] = useState<string>('all'); // New state for music filter

  const filteredHistory = useMemo(() => {
    let filtered = history;

    if (filterFavorites) {
      filtered = filtered.filter(ad => ad.isFavorite);
    }

    if (searchTerm) {
      filtered = filtered.filter(ad =>
        ad.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.generatedText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.voice.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.tone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.mediaType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (BACKGROUND_MUSIC_OPTIONS.find(music => music.id === ad.backgroundMusicId)?.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedVoiceFilter !== 'all') {
      filtered = filtered.filter(ad => ad.voice.id === selectedVoiceFilter);
    }

    if (selectedMusicFilter !== 'all') {
      filtered = filtered.filter(ad => ad.backgroundMusicId === selectedMusicFilter);
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [history, filterFavorites, searchTerm, selectedVoiceFilter, selectedMusicFilter]);

  const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);
  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredHistory.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredHistory, currentPage]);

  const handleFavoriteToggle = (id: string) => {
    const adToUpdate = history.find(ad => ad.id === id);
    if (adToUpdate) {
      updateAdInHistory({ ...adToUpdate, isFavorite: !adToUpdate.isFavorite });
    }
  };

  const handleEdit = (ad: AdHistoryItem) => {
    onEditAd({
      prompt: ad.prompt,
      voiceId: ad.voice.id,
      tone: ad.tone,
      mediaType: ad.mediaType,
      backgroundMusicId: ad.backgroundMusicId, // Include background music ID
    });
  };

  const handleDuplicate = (ad: AdHistoryItem) => {
    onEditAd({
      prompt: ad.prompt,
      voiceId: ad.voice.id,
      tone: ad.tone,
      mediaType: ad.mediaType,
      backgroundMusicId: ad.backgroundMusicId, // Include background music ID
    });
  };

  useEffect(() => {
    // Reset page to 1 when filters or search change
    setCurrentPage(1);
  }, [searchTerm, filterFavorites, selectedVoiceFilter, selectedMusicFilter]);

  return (
    <div className="container mx-auto p-4 pt-20 min-h-screen"> {/* Adjusted pt-20 */}
      <h2 className="text-3xl font-bold text-center text-purple-700 dark:text-yellow-400 mb-8 tracking-wide">
        Seu Histórico de Criações
      </h2>

      {history.length === 0 ? (
        <div className="text-center text-gray-600 dark:text-gray-300 text-lg py-12 card bg-white dark:bg-gray-800 rounded-xl shadow-xl">
          <p>Você ainda não criou nenhuma propaganda.</p>
          <p>Comece a criar na aba "Criar"!</p>
        </div>
      ) : (
        <>
          <div className="card bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="col-span-full md:col-span-2 lg:col-span-2 flex items-center border border-gray-300 dark:border-purple-600 rounded-lg bg-gray-50 dark:bg-gray-700 px-3 py-2">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Buscar por prompt, voz, tom..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field flex-1 bg-transparent focus:outline-none text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="lg:col-span-1">
                <select
                  value={selectedVoiceFilter}
                  onChange={(e) => setSelectedVoiceFilter(e.target.value)}
                  className="select-field w-full p-2 border border-gray-300 dark:border-purple-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors duration-200"
                >
                  <option value="all">Todas as Vozes</option>
                  {VOICE_OPTIONS.map((voice: VoiceOption) => (
                    <option key={voice.id} value={voice.id}>
                      {voice.name} ({voice.gender})
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-1">
                <select
                  value={selectedMusicFilter}
                  onChange={(e) => setSelectedMusicFilter(e.target.value)}
                  className="select-field w-full p-2 border border-gray-300 dark:border-purple-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors duration-200"
                >
                  <option value="all">Todas as Músicas</option>
                  {BACKGROUND_MUSIC_OPTIONS.map((music: BackgroundMusicOption) => (
                    <option key={music.id} value={music.id}>
                      {music.name}
                    </option>
                  ))}
                </select>
              </div>


              <div className="col-span-full flex justify-center">
                <button
                  onClick={() => setFilterFavorites(!filterFavorites)}
                  className={`btn py-2 px-4 rounded-full flex items-center space-x-2 transition-colors duration-200
                    ${filterFavorites ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                >
                  <FunnelIcon className="w-5 h-5" />
                  <span>{filterFavorites ? 'Meus Favoritos' : 'Ver Favoritos'}</span>
                </button>
              </div>
            </div>
          </div>

          {filteredHistory.length === 0 ? (
             <div className="text-center text-gray-600 dark:text-gray-300 text-lg py-12 card bg-white dark:bg-gray-800 rounded-xl shadow-xl">
               <p>Nenhuma propaganda encontrada com os filtros aplicados.</p>
             </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedHistory.map((ad) => (
                  <AdCard
                    key={ad.id}
                    ad={ad}
                    onFavoriteToggle={handleFavoriteToggle}
                    onEdit={handleEdit}
                    onDuplicate={handleDuplicate}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-8">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="btn px-4 py-2 bg-purple-200 dark:bg-purple-700 text-purple-800 dark:text-purple-200 rounded-lg hover:bg-purple-300 dark:hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <span className="text-gray-700 dark:text-gray-200">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="btn px-4 py-2 bg-purple-200 dark:bg-purple-700 text-purple-800 dark:text-purple-200 rounded-lg hover:bg-purple-300 dark:hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próxima
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default History;