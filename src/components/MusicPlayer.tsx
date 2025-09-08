import React, { useState, useRef, useEffect } from 'react';
import musicApi from '../services/musicApi';
import { MusicTrack } from '../types/music';
import { isAdminMode } from '../utils/adminUtils';

// Custom 90s-style icons
const PlayIcon = () => (
  <span className="text-lg">▶</span>
);

const PauseIcon = () => (
  <span className="text-lg">⏸</span>
);

const SkipBackIcon = () => (
  <span className="text-lg">⏮</span>
);

const SkipForwardIcon = () => (
  <span className="text-lg">⏭</span>
);

const VolumeIcon = () => (
  <span className="text-lg">🔊</span>
);



// Default playlist for fallback
const defaultPlaylist: MusicTrack[] = [];

const MusicPlayer: React.FC = () => {
  const [currentVideo, setCurrentVideo] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState<MusicTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [volume, setVolume] = useState(50);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement>(null);

  // Load tracks from backend on component mount
  useEffect(() => {
    const loadTracksFromBackend = async () => {
      setIsLoadingTracks(true);
      try {
        const response = await musicApi.getAllMusic();
        if (response.success && response.data) {
          setPlaylist(response.data);
          if (response.data.length > 0) {
            setCurrentVideo(response.data[0]);
          }
        } else {
          // Fallback to default playlist if backend fails
          console.warn('Failed to load tracks from backend, using default playlist');
          setPlaylist(defaultPlaylist);
          setCurrentVideo(defaultPlaylist[0]);
        }
      } catch (error) {
        console.error('Error loading tracks:', error);
        // Fallback to default playlist
        setPlaylist(defaultPlaylist);
        setCurrentVideo(defaultPlaylist[0]);
      } finally {
        setIsLoadingTracks(false);
      }
    };

    loadTracksFromBackend();
  }, []);


  const loadAudioFile = (track: MusicTrack) => {
    setIsLoading(true);
    setCurrentVideo(track);
    setIsPlaying(false);
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const audioFiles = files.filter(file => file.type.startsWith('audio/'));
    setSelectedFiles(audioFiles);
  };

  const checkUniqueFileName = (fileName: string, existingTracks: MusicTrack[]): string => {
    const baseName = fileName.replace(/\.[^/.]+$/, "");
    const extension = fileName.match(/\.[^/.]+$/)?.[0] || "";
    const existingTitles = new Set(existingTracks.map(track => track.title));

    let uniqueName = baseName;
    let counter = 1;

    while (existingTitles.has(uniqueName)) {
      uniqueName = `${baseName} (${counter})`;
      counter++;
    }

    return uniqueName + extension;
  };

  const handleFileUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsLoadingTracks(true);
    setUploadProgress(0);

    try {
      // Check for duplicate file names and make them unique
      const uniqueFiles = selectedFiles.map(file => {
        const uniqueFileName = checkUniqueFileName(file.name, playlist);
        return {
          file,
          uniqueName: uniqueFileName
        };
      });

      // Upload files to backend with progress tracking
      const uploadPromises = uniqueFiles.map(async ({ file, uniqueName }, index) => {
        const formData = new FormData();
        formData.append('audioFile', file);
        formData.append('title', uniqueName.replace(/\.[^/.]+$/, ""));

        console.log(`Starting upload ${index + 1}/${uniqueFiles.length}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        
        const response = await musicApi.uploadAudioFile(formData);
        
        // Update progress
        setUploadProgress((prev) => prev + (100 / uniqueFiles.length));
        
        // The response structure is: { success: boolean, data: MusicTrack }
        if (response.success && response.data) {
          console.log(`✅ Upload successful: ${file.name}`);
          return response.data as MusicTrack;
        }
        
        // Handle specific error cases
        if (response.error) {
          if (response.error.includes('too large') || response.error.includes('413')) {
            console.error('File too large:', response.error);
            throw new Error(`File "${file.name}" is too large. Maximum size is 50MB.`);
          } else if (response.error.includes('timeout') || response.error.includes('504')) {
            console.error('Upload timeout:', response.error);
            throw new Error(`Upload timeout for "${file.name}". Please try again.`);
          } else {
            console.error('Upload failed:', response.error);
            throw new Error(`Upload failed for "${file.name}": ${response.error}`);
          }
        }
        
        console.error('Upload failed: Unknown error');
        throw new Error(`Upload failed for "${file.name}": Unknown error`);
      });

      const uploadedTracks = (await Promise.all(uploadPromises)).filter(Boolean) as MusicTrack[];

      if (uploadedTracks.length > 0) {
        // Add to current playlist
        setPlaylist(prev => [...prev, ...uploadedTracks]);

        // Load first uploaded track
        loadAudioFile(uploadedTracks[0]);
        setCurrentIndex(playlist.length);
        
        console.log(`🎵 Successfully uploaded ${uploadedTracks.length} file(s)`);
      }

      // Clear selected files after successful upload
      setSelectedFiles([]);
      setUploadProgress(0);
      // Reset file input
      const fileInput = document.getElementById('audio-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Error uploading audio files:', error);
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      alert(`❌ Upload Error: ${errorMessage}`);
      
      // Don't fallback to local handling for server errors
      // Just clear the selected files
      setSelectedFiles([]);
      setUploadProgress(0);
      const fileInput = document.getElementById('audio-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } finally {
      setIsLoadingTracks(false);
    }
  };


  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const nextTrack = () => {
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentIndex(nextIndex);
    const nextVideo = playlist[nextIndex];
    loadAudioFile(nextVideo);
  };

  const prevTrack = () => {
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    const prevVideo = playlist[prevIndex];
    loadAudioFile(prevVideo);
  };

  const selectTrack = (index: number) => {
    setCurrentIndex(index);
    const selectedVideo = playlist[index];
    loadAudioFile(selectedVideo);
  };

  // Update current time display
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) {
        const now = new Date();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        setCurrentTime(`${minutes}:${seconds}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Handle volume changes for audio files
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  return (
    <div
      data-music-player
      className="bg-gradient-to-br from-black/90 via-blue-900/80 to-black/90 border-2 sm:border-3 lg:border-4 border-cyan-400 border-ridge p-3 sm:p-4 lg:p-6 shadow-[0_0_30px_rgba(0,255,255,0.3),inset_0_0_25px_rgba(255,255,255,0.1)] mb-4 sm:mb-6 max-w-5xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-4">
        <h3 className="text-cyan-400 text-lg sm:text-xl lg:text-2xl font-bold mb-2 text-shadow-cyan">
          📻 90s MUSIC PLAYER 📻
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-yellow-400 text-sm hover:text-yellow-300 transition-colors text-shadow-yellow"
        >
          {isExpanded ? '▼ Collapse' : '▶ Expand Player'}
        </button>
      </div>

      {/* Compact Player View */}
      {!isExpanded && (
        <div className="bg-black/60 p-3 sm:p-4 border border-cyan-400 border-ridge shadow-[0_0_15px_rgba(0,255,255,0.2)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="bg-cyan-400 hover:bg-cyan-300 text-black p-2 rounded-full transition-colors shadow-glow-cyan"
              >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </button>
              <div className="text-white">
                <div className="text-sm font-bold md:max-w-[300px] max-w-[150px] text-shadow-green truncate">
                  {isLoading ? 'LOADING...' : currentVideo?.title || 'NO TRACK'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={prevTrack}
                className="text-cyan-400 hover:text-cyan-300 transition-colors text-shadow-cyan"
              >
                <SkipBackIcon />
              </button>
              <button
                onClick={nextTrack}
                className="text-cyan-400 hover:text-cyan-300 transition-colors text-shadow-cyan"
              >
                <SkipForwardIcon />
              </button>
              <div className="text-xs text-yellow-400 text-shadow-yellow">{currentTime}</div>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Player View */}
      {isExpanded && (
        <>
          {/* LED Display */}
          <div className="bg-black/60 p-3 sm:p-4 border border-cyan-400 border-ridge shadow-[0_0_15px_rgba(0,255,255,0.2)] mb-4">
            <div className="text-green-400 font-mono text-center text-shadow-green">
              <div className="text-lg sm:text-xl">{currentTime}</div>
              <div className="text-sm sm:text-base truncate">
                {isLoading ? 'LOADING...' : currentVideo?.title || 'NO TRACK'}
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center items-center gap-3 sm:gap-4 mb-4">
            <button
              onClick={prevTrack}
              className="bg-gray-700 hover:bg-gray-600 text-cyan-400 p-2 sm:p-3 rounded-full transition-colors shadow-glow-cyan"
            >
              <SkipBackIcon />
            </button>
            <button
              onClick={togglePlay}
              className="bg-cyan-400 hover:bg-cyan-300 text-black p-3 sm:p-4 rounded-full transition-colors shadow-glow-cyan"
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button
              onClick={nextTrack}
              className="bg-gray-700 hover:bg-gray-600 text-cyan-400 p-2 sm:p-3 rounded-full transition-colors shadow-glow-cyan"
            >
              <SkipForwardIcon />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <VolumeIcon />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-24 sm:w-32 accent-cyan-400 focus:outline-none"
            />
            <span className="text-cyan-400 font-mono text-sm text-shadow-cyan">{volume}</span>
          </div>

          {/* File Upload - Admin Only */}
          {isAdminMode() && (
            <div className="mb-4 p-3 sm:p-4 bg-black/60 border border-cyan-400 border-ridge shadow-[0_0_15px_rgba(0,255,255,0.2)]">
              <h4 className="text-cyan-400 font-bold mb-2 text-sm sm:text-base text-shadow-cyan">🎵 UPLOAD AUDIO FILES (ADMIN)</h4>
              <div className="mb-2">
                <input
                  id="audio-file-input"
                  type="file"
                  accept="audio/*"
                  multiple
                  onChange={handleFileSelect}
                  disabled={isLoadingTracks}
                  className="w-full p-2 bg-black text-green-400 border border-cyan-400 text-xs sm:text-sm text-shadow-green file:bg-cyan-400 file:text-black file:border-0 file:px-2 file:py-1 file:rounded file:text-xs disabled:opacity-50"
                />
              </div>

              {/* Selected Files Display */}
              {selectedFiles.length > 0 && (
                <div className="mb-3 p-2 bg-gray-800 border border-cyan-400/50 rounded">
                  <div className="text-xs text-cyan-400 mb-1">Selected Files:</div>
                  {selectedFiles.map((file, index) => {
                    const uniqueName = checkUniqueFileName(file.name, playlist);
                    const isDuplicate = uniqueName !== file.name;
                    return (
                      <div key={index} className="text-xs truncate">
                        <span className={isDuplicate ? "text-yellow-400" : "text-green-400"}>
                          {uniqueName}
                        </span>
                        {isDuplicate && (
                          <span className="text-yellow-400 ml-1">(renamed)</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Upload Button */}
              {selectedFiles.length > 0 && (
                <div className="mb-2">
                  <button
                    onClick={handleFileUpload}
                    disabled={isLoadingTracks}
                    className="w-full bg-cyan-400 hover:bg-cyan-300 text-black px-4 py-2 transition-colors shadow-glow-cyan flex items-center justify-center gap-2 disabled:opacity-50 font-bold"
                  >
                    {isLoadingTracks ? '⏳ Uploading...' : '🚀 Upload Files'}
                  </button>
                </div>
              )}

              {/* Upload Progress */}
              {isLoadingTracks && uploadProgress > 0 && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-cyan-400 mb-1">
                    <span>Upload Progress</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-cyan-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="text-xs text-yellow-400 text-shadow-yellow">
                💡 Supports MP3, WAV, OGG, M4A and other audio formats
                {isLoadingTracks && <span className="block mt-1 text-cyan-400">⏳ Uploading files...</span>}
              </div>
            </div>
          )}

          {/* YouTube Search */}
          {/* <div className="mb-4 p-3 sm:p-4 bg-black/60 border border-cyan-400 border-ridge shadow-[0_0_15px_rgba(0,255,255,0.2)]">
            <h4 className="text-cyan-400 font-bold mb-2 text-sm sm:text-base text-shadow-cyan">🔍 ADD YOUTUBE TRACKS</h4>
            <div className="mb-2">
              <textarea
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Paste YouTube URLs (one per line) or single URL/Video ID..."
                className="w-full p-2 bg-black text-green-400 border border-cyan-400 text-xs sm:text-sm text-shadow-green resize-none"
                rows={3}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSearch()}
                disabled={isLoadingTracks}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                disabled={isLoadingTracks}
                className="bg-cyan-400 hover:bg-cyan-300 text-black px-4 py-2 transition-colors shadow-glow-cyan flex items-center gap-2 disabled:opacity-50"
              >
                <SearchIcon />
                <span className="text-xs">{isLoadingTracks ? 'Adding...' : 'Add Tracks'}</span>
              </button>
              <button
                onClick={() => setSearchQuery('')}
                disabled={isLoadingTracks}
                className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 transition-colors text-xs disabled:opacity-50"
              >
                Clear
              </button>
            </div>
            <div className="text-xs text-yellow-400 mt-2 text-shadow-yellow">
              💡 Tip: Paste YouTube URLs (one per line) or playlist URLs to add them!
              <br />
              📋 Playlist URLs will be automatically broken down into individual tracks
              <br />
              🔧 If playlist extraction fails, try pasting individual video URLs instead
              {isLoadingTracks && (
                <span className="block mt-1 text-cyan-400">
                  ⏳ {playlistProcessingStatus || 'Processing playlist and adding tracks...'}
                </span>
              )}
            </div>
          </div> */}

          {/* Playlist */}
          <div className="p-3 sm:p-4 bg-black/60 border border-cyan-400 border-ridge shadow-[0_0_15px_rgba(0,255,255,0.2)]">
            <h4 className="text-cyan-400 font-bold mb-2 text-sm sm:text-base text-shadow-cyan">💿 PLAYLIST</h4>
            <div className="max-h-32 sm:max-h-40 overflow-y-auto">
              {playlist.map((track, index) => (
                <div
                  key={index}
                  onClick={() => selectTrack(index)}
                  className={`p-2 cursor-pointer mb-1 text-xs sm:text-sm transition-colors ${index === currentIndex
                    ? 'bg-cyan-400 text-black shadow-glow-cyan'
                    : 'bg-gray-800 text-cyan-300 hover:bg-gray-700 text-shadow-cyan'
                    }`}
                >
                  <div className="truncate font-bold">{track.title}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Audio Player (Hidden) */}
      {currentVideo && (
        <div className="hidden">
          <audio
            ref={audioRef}
            src={currentVideo.url}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => nextTrack()}
            onError={(e) => {
              console.error('Audio playback error:', e);
              console.error('Audio source:', currentVideo.url);
            }}
            onLoadStart={() => {
              console.log('Audio loading started:', currentVideo.url);
            }}
            onCanPlay={() => {
              console.log('Audio can play:', currentVideo.url);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;
