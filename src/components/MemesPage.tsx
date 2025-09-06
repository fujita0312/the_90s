import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Meme, MemeQueryParams, PaginatedResponse } from '../types/meme';
import memeApi from '../services/memeApi';
import MemeModal from './MemeModal';
import FullscreenMemeModal from './FullscreenMemeModal';
import Pagination from './Pagination';
import { useToast } from '../contexts/ToastContext';

const MemesPage: React.FC = () => {
  const { memeId } = useParams<{ memeId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMemeModalOpen, setIsMemeModalOpen] = useState(false);
  const [memes, setMemes] = useState<Meme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMeme, setSelectedMeme] = useState<Meme | null>(null);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 24,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'mostVoted' | 'leastVoted'>('mostVoted');
  const { showToast } = useToast();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Initialize URL parameters on component mount
  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24');
    const search = searchParams.get('search') || '';
    const sort = (searchParams.get('sortBy') as 'newest' | 'oldest' | 'mostVoted' | 'leastVoted') || 'mostVoted';
    
    setPagination(prev => ({ ...prev, page, limit }));
    setSearchTerm(search);
    setSortBy(sort);
  }, [searchParams]);

  // Load memes with pagination
  useEffect(() => {
    const loadMemes = async () => {
      try {
        setIsLoading(true);
        
        const queryParams: MemeQueryParams = {
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedSearchTerm,
          sortBy: sortBy
        };
        
        const response: PaginatedResponse<Meme> = await memeApi.getMemesPaginated(queryParams);
        
        if (response.success && response.data && response.pagination) {
          setMemes(response.data);
          setPagination(response.pagination);
        } else {
          console.error('Failed to load memes:', response.error);
          setMemes([]);
        }
      } catch (error) {
        console.error('Error loading memes:', error);
        setMemes([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadMemes();
  }, [pagination.page, pagination.limit, debouncedSearchTerm, sortBy]);

  // Handle URL-based meme opening
  useEffect(() => {
    if (memeId && memes.length > 0) {
      const meme = memes.find(m => m.id === memeId);
      if (meme) {
        setSelectedMeme(meme);
        setIsFullscreenOpen(true);
      }
    }
  }, [memeId, memes]);

  const handleMemeSubmit = async (imageUrl: string | undefined, file?: File) => {
    try {
      let response;

      console.log('handleMemeSubmit called with:', { imageUrl, file: file?.name });

      if (file && file.size > 0) {
        // Handle file upload
        console.log('Using file upload method for file:', file.name);
        const formData = new FormData();
        formData.append('image', file);
        formData.append('author', 'Anonymous');

        response = await memeApi.uploadMeme(formData);
      } else if (imageUrl && imageUrl.trim()) {
        // Handle URL submission
        console.log('Using URL submission method for URL:', imageUrl);
        response = await memeApi.addMeme({ imageUrl });
      } else {
        console.error('No valid file or URL provided:', { file: file?.name, imageUrl });
        throw new Error('Either a file or image URL must be provided');
      }

      if (response.success) {
        showToast('Meme added successfully! 🎉', 'success');
        setIsMemeModalOpen(false);
        // Reload current page to show the new meme
        const queryParams: MemeQueryParams = {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm,
          sortBy: sortBy
        };
        const reloadResponse: PaginatedResponse<Meme> = await memeApi.getMemesPaginated(queryParams);
        if (reloadResponse.success && reloadResponse.data && reloadResponse.pagination) {
          setMemes(reloadResponse.data);
          setPagination(reloadResponse.pagination);
        }
      } else {
        showToast(response.error || 'Failed to add meme', 'error');
      }
    } catch (error) {
      showToast('Failed to add meme. Please try again.', 'error');
      console.error('Error adding meme:', error);
    }
  };

  const handleVoteMeme = async (id: string, voteType: 'up' | 'down') => {
    try {
      const response = await memeApi.voteMeme(id, voteType);
      if (response.success) {
        showToast(`Meme ${voteType}voted! 👍`, 'success');
        // Reload current page to get updated vote counts
        const queryParams: MemeQueryParams = {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm,
          sortBy: sortBy
        };
        const reloadResponse: PaginatedResponse<Meme> = await memeApi.getMemesPaginated(queryParams);
        if (reloadResponse.success && reloadResponse.data && reloadResponse.pagination) {
          setMemes(reloadResponse.data);
          setPagination(reloadResponse.pagination);
          
          // Update selected meme if it's currently open
          if (selectedMeme && selectedMeme.id === id) {
            const updatedMeme = reloadResponse.data.find(m => m.id === id);
            if (updatedMeme) {
              setSelectedMeme(updatedMeme);
            }
          }
        }
      } else {
        showToast(response.error || 'Failed to vote meme', 'error');
      }
    } catch (error) {
      showToast('Failed to vote meme. Please try again.', 'error');
      console.error('Error voting meme:', error);
    }
  };

  const handleMemeClick = (meme: Meme) => {
    setSelectedMeme(meme);
    setIsFullscreenOpen(true);
    navigate(`/memes/${meme.id}`);
  };

  const handleCloseFullscreen = () => {
    setIsFullscreenOpen(false);
    setSelectedMeme(null);
    navigate('/memes');
  };

  // Update URL parameters when pagination, search, or sort changes
  const updateUrlParams = (updates: Partial<{ page: number; limit: number; search: string; sortBy: string }>) => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        newSearchParams.set(key, value.toString());
      } else {
        newSearchParams.delete(key);
      }
    });
    
    setSearchParams(newSearchParams);
  };

  const handlePageChange = (page: number) => {
    updateUrlParams({ page });
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
    updateUrlParams({ search, page: 1 });
  };

  const handleSortChange = (sort: 'newest' | 'oldest' | 'mostVoted' | 'leastVoted') => {
    setSortBy(sort);
    updateUrlParams({ sortBy: sort, page: 1 });
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    updateUrlParams({ limit: newLimit, page: 1 });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">🎭</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Loading Memes...
          </h1>
          <p className="text-gray-300 text-sm">Fetching the most radical 90s memes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-6">90s Memes Gallery</h1>
          
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-6">
            {/* Search Bar */}
            <div className="relative">
                          <input
              type="text"
              placeholder="Search memes..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="bg-gray-800 border-2 border-cyan-400 text-cyan-400 placeholder-gray-400 px-4 py-2 pr-10 font-bold focus:border-pink-400 focus:outline-none w-64"
            />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400">
                🔍
              </div>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as any)}
              className="bg-gray-800 border-2 border-cyan-400 text-cyan-400 px-4 py-2 font-bold focus:border-pink-400 focus:outline-none"
            >
              <option value="mostVoted">🔥 Most Voted</option>
              <option value="leastVoted">👎 Least Voted</option>
              <option value="newest">🆕 Newest</option>
              <option value="oldest">⏰ Oldest</option>
            </select>

            {/* Add Meme Button */}
            <button
              onClick={() => setIsMemeModalOpen(true)}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-2 font-bold transition-all duration-300 border-2 border-green-400 hover:border-blue-400 hover:shadow-[0_0_15px_rgba(0,255,0,0.4)]"
            >
              ➕ Add Meme
            </button>
          </div>

          {/* Results Info */}
          {searchTerm && (
            <div className="text-cyan-400 text-sm mb-4">
              Showing {memes.length} of {pagination.total} memes
            </div>
          )}
        </div>

        {/* Memes Grid */}
        {memes.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-xl font-bold text-white mb-4">No Memes Yet!</h2>
            <p className="text-gray-400 mb-6">Be the first to add a meme!</p>
            <button
              onClick={() => setIsMemeModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 font-medium transition-colors duration-200"
            >
              Add First Meme
            </button>
          </div>
        ) : (
          <>
            {/* Memes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
              {memes.map((meme, index) => (
                <div
                  key={meme.id}
                  className="bg-gray-800 border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors duration-200"
                >
                  {/* Image */}
                  <div 
                    className="relative cursor-pointer"
                    onClick={() => handleMemeClick(meme)}
                  >
                    <img
                      src={meme.imageUrl}
                      alt="90s Meme"
                      className="w-full h-48 object-cover"
                      onLoad={() => console.log('✅ Image loaded successfully:', meme.imageUrl)}
                    />
                  </div>

                  {/* Vote Controls */}
                  <div className="p-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2 mb-2">
                      <button
                        onClick={() => handleVoteMeme(meme.id, 'up')}
                        className="flex-1 flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white px-2 py-1 text-sm font-medium transition-colors duration-200"
                      >
                        <span className="text-xs">{meme.upVotes || 0}</span>
                        <span>👍</span>
                      </button>
                      <button
                        onClick={() => handleVoteMeme(meme.id, 'down')}
                        className="flex-1 flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-white px-2 py-1 text-sm font-medium transition-colors duration-200"
                      >
                        <span className="text-xs">{meme.downVotes || 0}</span>
                        <span>👎</span>
                      </button>
                    </div>
                    
                    {/* Score and Date */}
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span>Score: {meme.votes || 0}</span>
                      <span>{new Date(meme.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={pagination.limit}
                totalItems={pagination.total}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            )}
          </>
        )}

        {/* Meme Modal */}
        <MemeModal
          isOpen={isMemeModalOpen}
          onClose={() => setIsMemeModalOpen(false)}
          onSubmit={handleMemeSubmit}
        />

        {/* Fullscreen Meme Modal */}
        <FullscreenMemeModal
          isOpen={isFullscreenOpen}
          meme={selectedMeme}
          onClose={handleCloseFullscreen}
          onVote={handleVoteMeme}
        />
      </div>
    </div>
  );
};

export default MemesPage;