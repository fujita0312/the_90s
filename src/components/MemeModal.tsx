import React, { useState, useRef } from 'react';

interface MemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (imageUrl: string | undefined, file?: File) => void;
}

const MemeModal: React.FC<MemeModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [errors, setErrors] = useState<{ imageUrl?: string; file?: string }>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({});
    setIsUploading(true);
    
    console.log('Form submitted with method:', uploadMethod, 'file:', selectedFile?.name, 'url:', imageUrl);
    
    try {
      if (uploadMethod === 'url') {
        // Validate URL input
        if (!imageUrl.trim()) {
          setErrors(prev => ({ ...prev, imageUrl: 'Image URL is required!' }));
          return;
        }
        
        // Basic URL validation
        try {
          new URL(imageUrl);
        } catch {
          setErrors(prev => ({ ...prev, imageUrl: 'Please enter a valid URL!' }));
          return;
        }
        
        // Submit the form with URL
        console.log('Submitting URL:', imageUrl.trim());
        await onSubmit(imageUrl.trim(), undefined);
      } else {
        // Validate file input
        if (!selectedFile) {
          setErrors(prev => ({ ...prev, file: 'Please select an image file!' }));
          return;
        }
        
        // Validate file type
        if (!selectedFile.type.startsWith('image/')) {
          setErrors(prev => ({ ...prev, file: 'Please select a valid image file!' }));
          return;
        }
        
        // Validate file size (max 10MB)
        if (selectedFile.size > 10 * 1024 * 1024) {
          setErrors(prev => ({ ...prev, file: 'File size must be less than 10MB!' }));
          return;
        }
        
        // Submit the form with file
        console.log('Submitting file:', selectedFile.name, selectedFile.size);
        await onSubmit(undefined, selectedFile);
      }
      
      // Reset form
      setImageUrl('');
      setSelectedFile(null);
      setUploadMethod('url');
      onClose();
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setImageUrl('');
    setSelectedFile(null);
    setUploadMethod('url');
    setErrors({});
    setIsUploading(false);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setErrors(prev => ({ ...prev, file: undefined }));
  };

  const handleMethodChange = (method: 'url' | 'file') => {
    console.log('Upload method changed to:', method);
    setUploadMethod(method);
    setErrors({});
    setImageUrl('');
    setSelectedFile(null);
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
          {/* Upload Method Selection */}
          <div className="mb-6">
            <label className="block text-pink-400 font-bold mb-3">
              📤 Choose Upload Method:
            </label>
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => handleMethodChange('url')}
                className={`flex-1 py-2 px-4 border-2 rounded-none font-bold transition-all duration-200 ${
                  uploadMethod === 'url'
                    ? 'bg-pink-500 text-black border-pink-400'
                    : 'bg-slate-700 text-white border-gray-500 hover:bg-slate-600'
                }`}
              >
                🌐 Image URL
              </button>
              <button
                type="button"
                onClick={() => handleMethodChange('file')}
                className={`flex-1 py-2 px-4 border-2 rounded-none font-bold transition-all duration-200 ${
                  uploadMethod === 'file'
                    ? 'bg-pink-500 text-black border-pink-400'
                    : 'bg-slate-700 text-white border-gray-500 hover:bg-slate-600'
                }`}
              >
                📁 Upload File
              </button>
            </div>
          </div>

          {/* URL Input Field */}
          {uploadMethod === 'url' && (
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
          )}

          {/* File Upload Field */}
          {uploadMethod === 'file' && (
            <div className="mb-6">
              <label htmlFor="imageFile" className="block text-pink-400 font-bold mb-2">
                📁 Select Image File:
              </label>
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="imageFile"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full md:p-3 p-2 bg-slate-800 border-2 border-pink-400 rounded-none text-white hover:bg-slate-700 transition-colors text-left"
                >
                  {selectedFile ? (
                    <span className="text-green-400">✅ {selectedFile.name}</span>
                  ) : (
                    <span className="text-gray-400">Click to select an image file...</span>
                  )}
                </button>
              </div>
              {errors.file && (
                <p className="text-red-400 text-sm mt-1">⚠️ {errors.file}</p>
              )}
              <p className="text-gray-400 text-xs mt-1">
                Supported formats: JPG, PNG, GIF, WebP (max 10MB)
              </p>
              {selectedFile && (
                <div className="mt-2 p-2 bg-slate-700 rounded border border-gray-600">
                  <p className="text-xs text-gray-300">
                    <strong>File:</strong> {selectedFile.name}<br/>
                    <strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB<br/>
                    <strong>Type:</strong> {selectedFile.type}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUploading}
              className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white md:py-3 md:px-4 py-2 px-2 rounded-none font-bold border-2 border-gray-500 hover:from-gray-700 hover:to-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ❌ Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-black md:py-3 md:px-4 py-2 px-2 rounded-none font-bold border-2 border-pink-400 hover:from-pink-600 hover:to-purple-600 transition-all duration-200 shadow-[0_0_15px_rgba(255,0,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">🔄</span>
                  {uploadMethod === 'file' ? 'Uploading...' : 'Submitting...'}
                </span>
              ) : (
                '😂 Submit Meme!'
              )}
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
