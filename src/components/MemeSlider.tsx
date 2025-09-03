import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Meme } from '../types/meme';
import memeApi from '../services/memeApi';

const MemeSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [memes, setMemes] = useState<Meme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();
  const autoplayRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

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

  // Helpers
  const goToIndex = useCallback((index: number) => {
    if (memes.length === 0) return;
    const normalized = (index + memes.length) % memes.length;
    setCurrentIndex(normalized);
  }, [memes.length]);

  const nextMeme = useCallback(() => {
    if (memes.length > 0) {
      goToIndex(currentIndex + 1);
    }
  }, [currentIndex, memes.length, goToIndex]);

  const prevMeme = useCallback(() => {
    if (memes.length > 0) {
      goToIndex(currentIndex - 1);
    }
  }, [currentIndex, memes.length, goToIndex]);

  // Autoplay (paused on hover and when tab not visible)
  useEffect(() => {
    const shouldRun = memes.length > 1 && !isHovering && !document.hidden;
    if (shouldRun) {
      autoplayRef.current = window.setInterval(() => {
        nextMeme();
      }, 5000);
    }
    return () => {
      if (autoplayRef.current) {
        window.clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
    };
  }, [memes.length, isHovering, nextMeme]);

  // Pause/resume on tab visibility change
  useEffect(() => {
    const handleVisibility = () => {
      if (autoplayRef.current) {
        window.clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(document.activeElement)) return;
      if (e.key === 'ArrowRight') nextMeme();
      if (e.key === 'ArrowLeft') prevMeme();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nextMeme, prevMeme]);

  // Touch swipe (mobile)
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const dx = e.touches[0].clientX - touchStartXRef.current;
    // Threshold ~50px
    if (Math.abs(dx) > 50) {
      if (dx < 0) nextMeme(); else prevMeme();
      touchStartXRef.current = null;
    }
  };
  const onTouchEnd = () => {
    touchStartXRef.current = null;
  };

  // Reset current index when memes change
  useEffect(() => {
    if (memes && memes.length > 0 && currentIndex >= memes.length) {
      setCurrentIndex(0);
    }
  }, [memes, currentIndex]);


  const handleViewAll = () => {
    navigate('/memes');
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-black via-gray-800 to-black md:border-4 border-2 border-pink-500 border-ridge md:p-4 p-2 shadow-[0_0_20px_rgba(255,0,255,0.3)] mb-6 max-w-4xl mx-auto">
        <h4 className="text-pink-500 text-center mb-5 text-xl font-bold">
          😂 90s MEME GALLERY 😂
        </h4>
        <div className="text-center text-white">
          <div className="animate-spin text-4xl mb-4">🔄</div>
          <p>Loading the raddest memes...</p>
        </div>
      </div>
    );
  }

  if (memes.length === 0) {
    return (
      <div className="bg-gradient-to-r from-black via-gray-800 to-black md:border-4 border-2 border-pink-500 border-ridge md:p-4 p-2 shadow-[0_0_20px_rgba(255,0,255,0.3)] mb-6 max-w-4xl mx-auto">
        <h4 className="text-pink-500 text-center mb-5 text-xl font-bold">
          😂 90s MEME GALLERY 😂
        </h4>
        <div className="text-center text-white">
          <div className="text-4xl mb-4">📭</div>
          <p className="mb-4">No memes yet! Be the first to submit one!</p>
          <p className="text-sm text-gray-400">Click the MEMES button in the footer to submit your first meme!</p>
        </div>
      </div>
    );
  }

  // Safety check to ensure we have a valid meme at the current index
  if (!memes || memes.length === 0 || !memes[currentIndex]) {
    return (
      <div className="bg-gradient-to-r from-black via-gray-800 to-black md:border-4 border-2 border-pink-500 border-ridge md:p-4 p-2 shadow-[0_0_20px_rgba(255,0,255,0.3)] mb-6">
        <h4 className="text-pink-500 text-center mb-5 text-xl font-bold">
          😂 90s MEME GALLERY 😂
        </h4>
        <div className="text-center text-white">
          <div className="text-4xl mb-4">📭</div>
          <p className="mb-4">No memes available right now!</p>
          <p className="text-sm text-gray-400">Try refreshing the page or check back later.</p>
        </div>
      </div>
    );
  }

  const currentMeme = memes[currentIndex];

  return (
    <div
      ref={containerRef}
      className="bg-gradient-to-r from-black via-gray-800 to-black md:border-4 border-2 border-pink-500 border-ridge md:p-4 p-2 shadow-[0_0_20px_rgba(255,0,255,0.3)] mb-6 max-w-4xl mx-auto select-none"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      tabIndex={0}
      aria-roledescription="carousel"
      aria-label="90s Meme Gallery"
    >
      <h4 className="text-pink-500 text-center mb-5 text-xl font-bold">
        😂 90s MEME GALLERY 😂
      </h4>
      
      {/* Meme Display */}
      <div className="relative mb-6">
        <div className="bg-black/60 md:p-4 p-2 md:border-2 border border-pink-400 rounded-none">
          {/* Meme Image */}
          <div className="text-center mb-4">
            <img
              src={currentMeme.imageUrl}
              alt={currentMeme.title}
              className="w-full h-[38vh] md:h-[420px] object-contain mx-auto  shadow-[0_0_15px_rgba(255,0,255,0.3)] bg-black"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
              }}
            />
          </div>
          
          {/* Meme Info */}
          <div className="text-center px-2">
            <h5 className="text-pink-400 font-bold text-lg mb-2 truncate">
              {currentMeme.title}
            </h5>
            <p className="text-white text-sm mb-2 leading-relaxed">
              {currentMeme.description}
            </p>
            <div className="text-gray-400 text-xs">
              By: {currentMeme.author} | {new Date(currentMeme.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {memes.length > 1 && (
          <>
            <button
              onClick={prevMeme}
              aria-label="Previous meme"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-pink-500/90 hover:bg-pink-600 text-black w-10 h-10 md:w-12 md:h-12 rounded-full grid place-items-center border-2 border-pink-300 transition-all duration-200 shadow-[0_0_10px_rgba(255,0,255,0.3)]"
            >
              ←
            </button>
            <button
              onClick={nextMeme}
              aria-label="Next meme"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-pink-500/90 hover:bg-pink-600 text-black w-10 h-10 md:w-12 md:h-12 rounded-full grid place-items-center border-2 border-pink-300 transition-all duration-200 shadow-[0_0_10px_rgba(255,0,255,0.3)]"
            >
              →
            </button>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {memes.length > 1 && (
        <div className="flex justify-center mb-4 gap-2">
          {memes.map((_, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              aria-label={`Go to meme ${index + 1}`}
              className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border-2 border-pink-400 transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-pink-500 shadow-[0_0_10px_rgba(255,0,255,0.5)]' 
                  : 'bg-transparent hover:bg-pink-500/50'
              }`}
            />
          ))}
        </div>
      )}

      {/* View All Button */}
      <div className="text-center">
        <button
          onClick={handleViewAll}
          className="bg-gradient-to-r from-pink-500 to-purple-500 text-black px-6 py-2 border-2 border-pink-400 hover:scale-105 transition-all duration-300 text-sm font-bold shadow-[0_0_15px_rgba(255,0,255,0.3)] hover:shadow-[0_0_25px_rgba(255,0,255,0.5)] hover:border-pink-300"
        >
          <span className="animate-pulse">🎭 View All Memes 🎭</span>
        </button>
        <p className="text-gray-400 text-xs mt-2">
          Showing {currentIndex + 1} of {memes.length} memes
        </p>
      </div>
    </div>
  );
};

export default MemeSlider;
