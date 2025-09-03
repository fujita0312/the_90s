import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Meme } from '../types/meme';
import memeApi from '../services/memeApi';
import MemeModal from './MemeModal';
import { useToast } from '../contexts/ToastContext';

const MemesPage: React.FC = () => {
  const [isMemeModalOpen, setIsMemeModalOpen] = useState(false);
  const [memes, setMemes] = useState<Meme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
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

  const handleMemeSubmit = async (title: string, description: string, imageUrl: string) => {
    try {
      const response = await memeApi.addMeme({ title, description, imageUrl });
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
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin text-6xl mb-4">🔄</div>
            <h1 className="text-4xl font-bold text-pink-500 mb-4">Loading Memes...</h1>
            <p className="text-white">Fetching the raddest 90s memes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-pink-500 mb-4 animate-pulse">
            😂 90s Memes Collection
          </h1>
          <p className="text-white text-lg mb-6">
            The most radical memes from the decade that brought us dial-up and Tamagotchis!
          </p>
          <button
            onClick={() => setIsMemeModalOpen(true)}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 font-bold text-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            ➕ Add New Meme
          </button>
        </div>

        {/* Memes Grid */}
        {memes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-8xl mb-4">😢</div>
            <h2 className="text-3xl font-bold text-yellow-400 mb-4">No Memes Yet!</h2>
            <p className="text-white text-lg mb-6">
              Be the first to add a totally tubular 90s meme!
            </p>
            <button
              onClick={() => setIsMemeModalOpen(true)}
              className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 font-bold text-lg hover:from-green-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              🚀 Add First Meme
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memes.map((meme) => (
              <div
                key={meme.id}
                className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 border-2 border-pink-500 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="mb-4">
                  <img
                    src={meme.imageUrl}
                    alt={meme.title}
                    className="w-full h-48 object-cover border-2 border-yellow-400"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/300x200/ff69b4/ffffff?text=90s+Meme';
                    }}
                  />
                </div>
                <h3 className="text-xl font-bold text-pink-400 mb-2">{meme.title}</h3>
                <p className="text-gray-300 mb-4">{meme.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">
                    Added: {new Date(meme.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleDeleteMeme(meme.id)}
                    disabled={true}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-sm font-bold transition-colors duration-200"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/main')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            ← Back to Home
          </button>
        </div>

        {/* Meme Modal */}
        <MemeModal
          isOpen={isMemeModalOpen}
          onClose={() => setIsMemeModalOpen(false)}
          onSubmit={handleMemeSubmit}
        />
      </div>
    </div>
  );
};

export default MemesPage;