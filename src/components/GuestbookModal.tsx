import React, { useState } from 'react';

interface GuestbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, message: string) => void;
}

const GuestbookModal: React.FC<GuestbookModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ name?: string; message?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({});
    
    // Validate inputs
    if (!name.trim()) {
      setErrors(prev => ({ ...prev, name: 'Username is required!' }));
      return;
    }
    
    if (!message.trim()) {
      setErrors(prev => ({ ...prev, message: 'Message is required!' }));
      return;
    }
    
    if (name.length > 30) {
      setErrors(prev => ({ ...prev, name: 'Username must be 30 characters or less!' }));
      return;
    }
    
    if (message.length > 500) {
      setErrors(prev => ({ ...prev, message: 'Message must be 500 characters or less!' }));
      return;
    }
    
    // Submit the form
    onSubmit(name.trim(), message.trim());
    
    // Reset form
    setName('');
    setMessage('');
    onClose();
  };

  const handleClose = () => {
    setName('');
    setMessage('');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 border-4 border-cyan-400 border-ridge rounded-none shadow-[0_0_30px_rgba(0,255,255,0.5)] max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-teal-500 text-black p-4 border-b-2 border-cyan-400">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">🖊️ Sign Guestbook</h2>
            <button
              onClick={handleClose}
              className="text-black hover:text-white transition-colors text-2xl font-bold leading-none"
            >
              ×
            </button>
          </div>
          <p className="text-sm mt-2 opacity-80">Leave our mark in the 90s time capsule!</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="md:p-6 p-4">
          {/* Username Field */}
          <div className="mb-4">
            <label htmlFor="username" className="block text-cyan-400 font-bold mb-2">
              🎭 Our 90s Username:
            </label>
            <input
              type="text"
              id="username"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full md:p-3 p-2 bg-slate-800 border-2 border-cyan-400 rounded-none text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 transition-colors ${
                errors.name ? 'border-red-500' : ''
              }`}
              placeholder="e.g., CryptoKid98, DialUpDreamer"
              maxLength={30}
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">⚠️ {errors.name}</p>
            )}
            <p className="text-gray-400 text-xs mt-1">
              {name.length}/30 characters
            </p>
          </div>

          {/* Message Field */}
          <div className="mb-6">
            <label htmlFor="message" className="block text-cyan-400 font-bold mb-2">
              💭 Our Message:
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className={`w-full md:p-3 p-2 bg-slate-800 border-2 border-cyan-400 rounded-none text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 transition-colors resize-none ${
                errors.message ? 'border-red-500' : ''
              }`}
                              placeholder="Share our thoughts, memories, or just say WASSSUPPP! 🚀"
              maxLength={500}
            />
            {errors.message && (
              <p className="text-red-400 text-sm mt-1">⚠️ {errors.message}</p>
            )}
            <p className="text-gray-400 text-xs mt-1">
              {message.length}/500 characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white md:py-3 md:px-4 py-2 px-2 rounded-none font-bold border-2 border-gray-500 hover:from-gray-700 hover:to-gray-800 transition-all duration-200"
            >
              ❌ Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-500 text-black md:py-3 md:px-4 py-2 px-2 rounded-none font-bold border-2 border-cyan-400 hover:from-cyan-600 hover:to-teal-600 transition-all duration-200 shadow-[0_0_15px_rgba(0,255,255,0.3)]"
            >
              🖊️ Sign It!
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-4 border-t-2 border-cyan-400 rounded-b-none">
          <div className="text-center text-sm text-gray-400">
            <p>🌟 Our message will be preserved in the 90s time capsule! 🌟</p>
            <p className="mt-1">🕰️ Future generations will thank you! 🕰️</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestbookModal;
