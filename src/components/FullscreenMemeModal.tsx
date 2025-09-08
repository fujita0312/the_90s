import React, { useEffect } from 'react';
import { Meme } from '../types/meme';

interface FullscreenMemeModalProps {
  isOpen: boolean;
  meme: Meme | null;
  onClose: () => void;
  onVote: (id: string, voteType: 'up' | 'down') => void;
}

const FullscreenMemeModal: React.FC<FullscreenMemeModalProps> = ({
  isOpen,
  meme,
  onClose,
  onVote
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !meme) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 bg-gray-800 hover:bg-gray-700 text-white p-3 transition-colors duration-200"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Meme Content */}
      <div className="relative max-w-4xl max-h-full mx-4">
        {/* Meme Image */}
        <div className="relative">
          <img
            src={meme.imageUrl}
            alt="90s Meme"
            className="max-w-full max-h-[80vh] object-contain"
            // onLoad={() => console.log('✅ Fullscreen image loaded successfully:', meme.imageUrl)}
          />
          
          {/* Overlay Info */}
       
        </div>
      </div>

      {/* Background Click to Close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  );
};

export default FullscreenMemeModal;
