import React, { useState } from 'react';

interface MemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, description: string, imageUrl: string) => void;
}

const MemeModal: React.FC<MemeModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [errors, setErrors] = useState<{ title?: string; description?: string; imageUrl?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({});
    
    // Validate inputs
    if (!title.trim()) {
      setErrors(prev => ({ ...prev, title: 'Meme title is required!' }));
      return;
    }
    
    if (!description.trim()) {
      setErrors(prev => ({ ...prev, description: 'Meme description is required!' }));
      return;
    }
    
    if (!imageUrl.trim()) {
      setErrors(prev => ({ ...prev, imageUrl: 'Image URL is required!' }));
      return;
    }
    
    if (title.length > 50) {
      setErrors(prev => ({ ...prev, title: 'Title must be 50 characters or less!' }));
      return;
    }
    
    if (description.length > 300) {
      setErrors(prev => ({ ...prev, description: 'Description must be 300 characters or less!' }));
      return;
    }
    
    // Basic URL validation
    try {
      new URL(imageUrl);
    } catch {
      setErrors(prev => ({ ...prev, imageUrl: 'Please enter a valid URL!' }));
      return;
    }
    
    // Submit the form
    onSubmit(title.trim(), description.trim(), imageUrl.trim());
    
    // Reset form
    setTitle('');
    setDescription('');
    setImageUrl('');
    onClose();
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setImageUrl('');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 border-4 border-pink-400 border-ridge rounded-none shadow-[0_0_30px_rgba(255,0,255,0.5)] max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-black p-4 border-b-2 border-pink-400">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">😂 Submit 90s Meme</h2>
            <button
              onClick={handleClose}
              className="text-black hover:text-white transition-colors text-2xl font-bold leading-none"
            >
              ×
            </button>
          </div>
          <p className="text-sm mt-2 opacity-80">Share your raddest 90s memes with the world!</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="md:p-6 p-4">
          {/* Title Field */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-pink-400 font-bold mb-2">
              🎭 Meme Title:
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full md:p-3 p-2 bg-slate-800 border-2 border-pink-400 rounded-none text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors ${
                errors.title ? 'border-red-500' : ''
              }`}
              placeholder="e.g., 'That 90s Kid', 'Dial-Up Problems'"
              maxLength={50}
            />
            {errors.title && (
              <p className="text-red-400 text-sm mt-1">⚠️ {errors.title}</p>
            )}
            <p className="text-gray-400 text-xs mt-1">
              {title.length}/50 characters
            </p>
          </div>

          {/* Description Field */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-pink-400 font-bold mb-2">
              💭 Meme Description:
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`w-full md:p-3 p-2 bg-slate-800 border-2 border-pink-400 rounded-none text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors resize-none ${
                errors.description ? 'border-red-500' : ''
              }`}
              placeholder="Describe your meme or add a funny caption! 🚀"
              maxLength={300}
            />
            {errors.description && (
              <p className="text-red-400 text-sm mt-1">⚠️ {errors.description}</p>
            )}
            <p className="text-gray-400 text-xs mt-1">
              {description.length}/300 characters
            </p>
          </div>

          {/* Image URL Field */}
          <div className="mb-6">
            <label htmlFor="imageUrl" className="block text-pink-400 font-bold mb-2">
              🖼️ Image URL:
            </label>
            <input
              type="url"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className={`w-full md:p-3 p-2 bg-slate-800 border-2 border-pink-400 rounded-none text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors ${
                errors.imageUrl ? 'border-red-500' : ''
              }`}
              placeholder="https://example.com/your-meme.jpg"
            />
            {errors.imageUrl && (
              <p className="text-red-400 text-sm mt-1">⚠️ {errors.imageUrl}</p>
            )}
            <p className="text-gray-400 text-xs mt-1">
              Paste the URL of your meme image
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
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-black md:py-3 md:px-4 py-2 px-2 rounded-none font-bold border-2 border-pink-400 hover:from-pink-600 hover:to-purple-600 transition-all duration-200 shadow-[0_0_15px_rgba(255,0,255,0.3)]"
            >
              😂 Submit Meme!
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-4 border-t-2 border-pink-400 rounded-b-none">
          <div className="text-center text-sm text-gray-400">
            <p>🌟 Your meme will be added to the 90s meme collection! 🌟</p>
            <p className="mt-1">🕰️ Keep the 90s spirit alive! 🕰️</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemeModal;
