import React, { useState, useEffect } from 'react';
import { Meme } from '../types/meme';
import memeApi from '../services/memeApi';
import MemeModal from './MemeModal';
import { useToast } from '../contexts/ToastContext';

const MemesPage: React.FC = () => {
  const [isMemeModalOpen, setIsMemeModalOpen] = useState(false);
  const [memes, setMemes] = useState<Meme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  // Load memes on component mount
  useEffect(() => {
    const loadMemes = async () => {
      try {
        setIsLoading(true);
        const response = await memeApi.getAllMemes();
        if (response.success && response.data) {
          const validMemes = Array.isArray(response.data) ? response.data.filter(meme => meme && meme.id) : [];
          setMemes(validMemes);
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
  }, []);

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
        // Reload memes to show the new one
        const reloadResponse = await memeApi.getAllMemes();
        if (reloadResponse.success && reloadResponse.data) {
          const validMemes = Array.isArray(reloadResponse.data) ? reloadResponse.data.filter(meme => meme && meme.id) : [];
          setMemes(validMemes);
        }
      } else {
        showToast(response.error || 'Failed to add meme', 'error');
      }
    } catch (error) {
      showToast('Failed to add meme. Please try again.', 'error');
      console.error('Error adding meme:', error);
    }
  };

  const handleDeleteMeme = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this meme?')) {
      try {
        const response = await memeApi.deleteMeme(id);
        if (response.success) {
          showToast('Meme deleted successfully! 🗑️', 'success');
          // Reload memes
          const reloadResponse = await memeApi.getAllMemes();
          if (reloadResponse.success && reloadResponse.data) {
            const validMemes = Array.isArray(reloadResponse.data) ? reloadResponse.data.filter(meme => meme && meme.id) : [];
            setMemes(validMemes);
          }
        } else {
          showToast(response.error || 'Failed to delete meme', 'error');
        }
      } catch (error) {
        showToast('Failed to delete meme. Please try again.', 'error');
        console.error('Error deleting meme:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        <div className="text-center">
          <div className="animate-spin text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4">🔄</div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-pink-500 mb-3 sm:mb-4">Loading Memes...</h1>
          <p className="text-white text-sm sm:text-base lg:text-lg">Fetching the raddest 90s memes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-pink-500 mb-3 sm:mb-4 animate-pulse">
            😂 90s Memes Collection
          </h1>
          <p className="text-white text-sm sm:text-base md:text-lg mb-4 sm:mb-6 px-2">
            The most radical memes from the decade that brought us dial-up and Tamagotchis!
          </p>
          <button
            onClick={() => setIsMemeModalOpen(true)}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-4 font-bold text-sm sm:text-base lg:text-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            ➕ Add New Meme
          </button>
        </div>

        {/* Memes Grid */}
        {memes.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="text-6xl sm:text-7xl lg:text-8xl mb-3 sm:mb-4">😢</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-3 sm:mb-4">No Memes Yet!</h2>
            <p className="text-white text-base sm:text-lg mb-4 sm:mb-6 px-2">
              Be the first to add a totally tubular 90s meme!
            </p>
            <button
              onClick={() => setIsMemeModalOpen(true)}
              className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-4 font-bold text-sm sm:text-base lg:text-lg hover:from-green-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              🚀 Add First Meme
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {memes.map((meme) => (
              <div
                key={meme.id}
                className="bg-gradient-to-br from-gray-800 to-gray-900 p-2 md:p-4 border-2 border-pink-500 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="mb-3 sm:mb-4">
                  <img
                    src={meme.imageUrl}
                    alt="90s Meme"
                    className="w-full h-40 sm:h-44 lg:h-48 xl:h-52 object-cover border-2 border-yellow-400"
                    onLoad={() => console.log('✅ Image loaded successfully:', meme.imageUrl)}
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                  <span className="text-xs sm:text-sm text-gray-400">
                    Added: {new Date(meme.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleDeleteMeme(meme.id)}
                    // disabled={true}
                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm font-bold transition-colors duration-200 w-full sm:w-auto"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Meme Modal */}
        <MemeModal
          isOpen={isMemeModalOpen}
          onClose={() => setIsMemeModalOpen(false)}
          onSubmit={handleMemeSubmit}
        />
    </div>
  );
};

export default MemesPage;