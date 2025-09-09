import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Meme, MemeQueryParams, PaginatedResponse } from '../types/meme';
import memeApi from '../services/memeApi';
import MemeModal from './MemeModal';
import FullscreenMemeModal from './FullscreenMemeModal';
import Pagination from './Pagination';
import { useToast } from '../contexts/ToastContext';
import { isAdminMode } from '../utils/adminUtils';
import { userFingerprint } from '../utils/userFingerprint';
import { shareService } from '../utils/shareUtils';

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
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
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
          // Clear loaded images when memes change
          setLoadedImages(new Set());
        } else {
          console.error('Failed to load memes:', response.error);
          setMemes([]);
          setLoadedImages(new Set());
        }
      } catch (error) {
        console.error('Error loading memes:', error);
        setMemes([]);
        setLoadedImages(new Set());
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
      // Check if user has already voted on this meme locally
      if (userFingerprint.hasVotedOnMeme(id)) {
        showToast('You have already voted on this meme! 🚫', 'info');
        return;
      }

      const userId = userFingerprint.getUserId();
      const response = await memeApi.voteMeme(id, voteType, userId);

      if (response.success) {
        // Mark meme as voted locally
        userFingerprint.markMemeAsVoted(id);
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

  const handleDeleteMeme = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this meme? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await memeApi.deleteMeme(id);
      if (response.success) {
        showToast('Meme deleted successfully! 🗑️', 'success');
        // Reload current page to reflect the deletion
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
        showToast(response.error || 'Failed to delete meme', 'error');
      }
    } catch (error) {
      showToast('Failed to delete meme. Please try again.', 'error');
      console.error('Error deleting meme:', error);
    }
  };

  const handleImageLoad = (memeId: string) => {
    setLoadedImages(prev => new Set(prev).add(memeId));
  };

  const hasUserVotedOnMeme = (memeId: string): boolean => {
    return userFingerprint.hasVotedOnMeme(memeId);
  };

  const handleShareMeme = async (memeId: string) => {
    try {
      const result = await shareService.share(memeId, {
        title: 'Check out this 90s meme!',
        text: 'Look at this radical 90s meme!'
      });

      if (result.success) {
        if (result.method === 'clipboard') {
          showToast('Meme link copied to clipboard! 📋', 'success');
        } else if (result.method === 'native') {
          showToast('Share dialog opened! 📤', 'success');
        }
      } else {
        // Fallback: show share options
        showShareOptions(memeId);
      }
    } catch (error) {
      console.error('Error sharing meme:', error);
      showToast('Failed to share meme', 'error');
    }
  };

  const showShareOptions = (memeId: string) => {
    const shareOptions = shareService.getAvailableShareOptions();

    if (shareOptions.native) {
      // Try native share as fallback
      shareService.shareNative(memeId, {
        title: 'Check out this 90s meme!',
        text: 'Look at this radical 90s meme!'
      });
    } else {
      // Show manual copy option
      const url = `${window.location.origin}/memes/${memeId}`;
      // eslint-disable-next-line no-alert
      if (window.confirm(`Copy this link to share:\n\n${url}\n\nClick OK to copy to clipboard`)) {
        shareService.copyToClipboard(memeId).then(success => {
          if (success) {
            showToast('Meme link copied to clipboard! 📋', 'success');
          } else {
            showToast('Failed to copy link. Please copy manually.', 'error');
          }
        });
      }
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
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center mb-6 w-full max-w-4xl mx-auto">
            {/* Search Bar */}
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search memes..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full sm:w-64 bg-gradient-to-r from-gray-800 to-gray-900 border-2 border-cyan-400 text-cyan-400 placeholder-gray-400 px-4 py-3 pr-12 font-bold focus:border-pink-400 focus:outline-none focus:shadow-[0_0_15px_rgba(0,255,255,0.3)] transition-all duration-300 rounded-none"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400 text-lg">
                🔍
              </div>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as any)}
              className="w-full sm:w-auto bg-gradient-to-r from-gray-800 to-gray-900 border-2 border-cyan-400 text-cyan-400 px-4 py-3 font-bold focus:border-pink-400 focus:outline-none focus:shadow-[0_0_15px_rgba(0,255,255,0.3)] transition-all duration-300 rounded-none"
            >
              <option value="mostVoted">🔥 Most Voted</option>
              <option value="leastVoted">👎 Least Voted</option>
              <option value="newest">🆕 Newest</option>
              <option value="oldest">⏰ Oldest</option>
            </select>

            {/* Add Meme Button */}
            <button
              onClick={() => setIsMemeModalOpen(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 font-bold transition-all duration-300 border-2 border-green-400 hover:border-blue-400 hover:shadow-[0_0_20px_rgba(0,255,0,0.5)] hover:scale-105 transform rounded-none"
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
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 font-bold transition-all duration-300 border-2 border-green-400 hover:border-blue-400 hover:shadow-[0_0_20px_rgba(0,255,0,0.5)] hover:scale-105 transform rounded-none"
            >
              ➕ Add First Meme
            </button>
          </div>
        ) : (
          <>
            {/* Memes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
              {memes.map((meme, index) => (
                <div
                  key={meme.id}
                  className="bg-gray-800 border relative border-gray-700 overflow-hidden hover:border-gray-600 transition-colors duration-200"
                >
                  {/* Image */}
                  <div
                    className="relative cursor-pointer"
                    onClick={() => handleMemeClick(meme)}
                  >
                    {/* Loading Animation */}
                    {!loadedImages.has(meme.id) && (
                      <div className="w-full h-60 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center relative overflow-hidden">
                        {/* 90s-style shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-loading-shimmer"></div>
                        <div className="relative z-10 flex flex-col items-center">
                          <div className="text-4xl mb-2 animate-loading-bounce">🎭</div>
                          <div className="text-cyan-400 text-sm font-bold animate-loading-pulse">LOADING...</div>
                          <div className="flex space-x-1 mt-2">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-loading-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-loading-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-loading-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actual Image */}
                    <img
                      src={meme.imageUrl}
                      alt="90s Meme"
                      className={`w-full h-60 object-cover transition-opacity duration-500 ${loadedImages.has(meme.id) ? 'opacity-100' : 'opacity-0 absolute top-0 left-0'
                        }`}
                      onLoad={() => handleImageLoad(meme.id)}
                      onError={() => handleImageLoad(meme.id)} // Also mark as "loaded" on error to hide loading animation
                    />
                  </div>

                  {/* Score and Date */}
                  <div className="absolute top-0 w-full md:p-2 p-1 flex justify-between items-center text-xs text-gray-400">
                    <span>Score: {meme.votes || 0}</span>
                    <span>{new Date(meme.createdAt).toLocaleDateString()}</span>
                  </div>
                  {/* Vote Controls */}
                  <div className="md:p-2 p-1 absolute bottom-0 left-0 right-0" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-1 sm:gap-2 bg-gray-800/50 p-1">
                      <button
                        onClick={() => handleVoteMeme(meme.id, 'up')}
                        disabled={hasUserVotedOnMeme(meme.id)}
                        className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-sm font-bold transition-all duration-300 border-2 rounded-none ${hasUserVotedOnMeme(meme.id)
                          ? 'bg-gray-600 border-gray-500 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-600 to-green-700 border-green-400 text-white hover:from-green-700 hover:to-green-800 hover:border-green-300 hover:shadow-[0_0_10px_rgba(0,255,0,0.4)] hover:scale-105 transform'
                        }`}
                        title={hasUserVotedOnMeme(meme.id) ? 'You have already voted on this meme' : 'Vote up'}
                      >
                        <span className="text-xs">{meme.upVotes || 0}</span>
                        <span className="text-base">👍</span>
                      </button>
                      <button
                        onClick={() => handleVoteMeme(meme.id, 'down')}
                        disabled={hasUserVotedOnMeme(meme.id)}
                        className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-sm font-bold transition-all duration-300 border-2 rounded-none ${hasUserVotedOnMeme(meme.id)
                          ? 'bg-gray-600 border-gray-500 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-red-600 to-red-700 border-red-400 text-white hover:from-red-700 hover:to-red-800 hover:border-red-300 hover:shadow-[0_0_10px_rgba(255,0,0,0.4)] hover:scale-105 transform'
                        }`}
                        title={hasUserVotedOnMeme(meme.id) ? 'You have already voted on this meme' : 'Vote down'}
                      >
                        <span className="text-xs">{meme.downVotes || 0}</span>
                        <span className="text-base">👎</span>
                      </button>
                      {/* Share Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareMeme(meme.id);
                        }}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 border-2 border-blue-400 text-white px-2 py-2 text-sm font-bold transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:border-blue-300 hover:shadow-[0_0_10px_rgba(0,0,255,0.4)] hover:scale-105 transform rounded-none"
                        title="Share this meme"
                      >
                        <span className="text-base">📤</span>
                      </button>

                      {/* Admin Delete Button */}
                      {isAdminMode() && (
                        <button
                          onClick={() => handleDeleteMeme(meme.id)}
                          className="bg-gradient-to-r from-red-600 to-red-700 border-2 border-red-400 text-white px-2 py-2 text-sm font-bold transition-all duration-300 hover:from-red-700 hover:to-red-800 hover:border-red-300 hover:shadow-[0_0_10px_rgba(255,0,0,0.4)] hover:scale-105 transform rounded-none"
                          title="Delete meme (Admin only)"
                        >
                          <span className="text-base">🗑️</span>
                        </button>
                      )}
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