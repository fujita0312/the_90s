import React, { useState } from 'react';

interface UsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUsernameSubmit: (username: string) => void;
}

const UsernameModal: React.FC<UsernameModalProps> = ({ isOpen, onClose, onUsernameSubmit }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username!');
      return;
    }
    
    if (username.length < 2) {
      setError('Username must be at least 2 characters!');
      return;
    }
    
    if (username.length > 20) {
      setError('Username must be less than 20 characters!');
      return;
    }

    onUsernameSubmit(username.trim());
    setUsername('');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-black/95 via-purple-900/90 to-black/95 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-md bg-gradient-to-br from-gray-900/95 via-purple-900/95 to-gray-900/95 backdrop-blur-sm border-2 border-cyan-400 rounded-2xl shadow-[0_0_40px_rgba(0,255,255,0.3)] p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-400 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl">💬</span>
          </div>
          <h2 className="text-2xl font-bold text-yellow-400 mb-2">
            Enter Chatroom
          </h2>
          <p className="text-cyan-400 text-sm">
            Choose your rad 90s username!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-pink-400 text-sm font-bold mb-2">
              Username:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              placeholder="Enter your username..."
              className="w-full px-4 py-3 bg-black/60 border-2 border-cyan-400/50 text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none focus:shadow-[0_0_15px_rgba(255,255,0,0.3)] transition-all duration-300"
              maxLength={20}
              autoFocus
            />
            {error && (
              <p className="text-red-400 text-sm mt-2 animate-blink">
                ⚠️ {error}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3  font-bold hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3  font-bold hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-[0_0_15px_rgba(0,255,0,0.3)]"
            >
              Join Chat! 🚀
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-400">
          <p>💬 Chat with other 90s enthusiasts!</p>
          <p className="mt-1">No registration required - just pure vibes!</p>
        </div>
      </div>
    </div>
  );
};

export default UsernameModal;
