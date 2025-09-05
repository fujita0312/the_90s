import React, { useState, useRef, useEffect } from 'react';
import musicApi from '../services/musicApi';
import { MusicTrack } from '../types/music';

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

const SearchIcon = () => (
  <span className="text-lg">🔍</span>
);


// Default playlist for fallback
const defaultPlaylist: MusicTrack[] = [
  {
    id: 'dQw4w9WgXcQ',
    title: 'Rick Astley - Never Gonna Give You Up',
    artist: 'Rick Astley',
    type: 'youtube' as const,
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'fJ9rUzIMcZQ',
    title: 'Queen - Bohemian Rhapsody',
    artist: 'Queen',
    type: 'youtube' as const,
    url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'hTWKbfoikeg',
    title: 'Nirvana - Smells Like Teen Spirit',
    artist: 'Nirvana',
    type: 'youtube' as const,
    url: 'https://www.youtube.com/watch?v=hTWKbfoikeg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const MusicPlayer: React.FC = () => {
  const [currentVideo, setCurrentVideo] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [playlist, setPlaylist] = useState<MusicTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [volume, setVolume] = useState(50);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const [playlistProcessingStatus, setPlaylistProcessingStatus] = useState<string>('');
  
  const playerRef = useRef<HTMLIFrameElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Load tracks from backend on component mount
  useEffect(() => {
    const loadTracksFromBackend = async () => {
      setIsLoadingTracks(true);
      try {
        const response = await musicApi.getAllTracks();
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

  // Extract YouTube video ID from URL
  const extractVideoId = (url: string): string => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : url;
  };

  // Extract playlist ID from YouTube playlist URL
  const extractPlaylistId = (url: string): string | null => {
    const regex = /[?&]list=([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Check if URL is a YouTube playlist
  const isPlaylistUrl = (url: string): boolean => {
    return url.includes('youtube.com/playlist') || url.includes('list=');
  };

  // Extract video IDs from YouTube playlist using multiple methods
  const extractPlaylistVideos = async (playlistUrl: string): Promise<string[]> => {
    const playlistId = extractPlaylistId(playlistUrl);
    if (!playlistId) {
      throw new Error('Invalid playlist URL');
    }

    console.log(`Attempting to extract videos from playlist: ${playlistId}`);

    // Method 2: Try multiple CORS proxies
    const proxies = [
      'https://api.allorigins.win/get?url=',
      'https://cors-anywhere.herokuapp.com/',
      'https://api.codetabs.com/v1/proxy?quest='
    ];

    for (const proxy of proxies) {
      try {
        console.log(`Trying proxy: ${proxy}`);
        const proxyUrl = `${proxy}${encodeURIComponent(playlistUrl)}`;
        const response = await fetch(proxyUrl, {
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const html = data.contents || data;

        if (typeof html !== 'string') {
          throw new Error('Invalid response format');
        }

        console.log('HTML content length:', html.length);
        console.log('HTML preview:', html.substring(0, 200));

        // Multiple regex patterns to find video IDs
        const patterns = [
          /"videoId":"([a-zA-Z0-9_-]{11})"/g,
          /videoId["\s]*:["\s]*"([a-zA-Z0-9_-]{11})"/g,
          /"videoId":\s*"([a-zA-Z0-9_-]{11})"/g,
          /watch\?v=([a-zA-Z0-9_-]{11})/g,
          /\/embed\/([a-zA-Z0-9_-]{11})/g
        ];

        const videoIds: string[] = [];

        for (const pattern of patterns) {
          let match;
          while ((match = pattern.exec(html)) !== null) {
            const videoId = match[1];
            if (videoId && !videoIds.includes(videoId)) {
              videoIds.push(videoId);
            }
          }
        }

        console.log(`Found ${videoIds.length} video IDs using proxy: ${proxy}`);

        if (videoIds.length > 0) {
          return videoIds;
        }
      } catch (error) {
        console.log(`Proxy ${proxy} failed:`, error);
        continue;
      }
    }

    // Method 3: Fallback - return some popular 90s songs for demonstration
    console.log('All extraction methods failed, using fallback tracks');
    return [
      // 'dQw4w9WgXcQ', // Rick Astley - Never Gonna Give You Up
      // 'fJ9rUzIMcZQ', // Nirvana - Smells Like Teen Spirit
      // 'hTWKbfoikeg', // Nirvana - Come As You Are
      // 'YQHsXMglC9A', // Adele - Hello
      // 'kJQP7kiw5Fk', // Luis Fonsi - Despacito
      // '09R8_2nJtjg', // Maroon 5 - Sugar
      // 'YlUKc32myk8', // Ed Sheeran - Shape of You
      // 'L_jWHffIx5E', // Smash Mouth - All Star
      // '9bZkp7q19f0', // PSY - Gangnam Style
      // 'kJQP7kiw5Fk'  // Luis Fonsi - Despacito
    ];
  };

  // Handle YouTube playlist URL
  const handlePlaylistUrl = async (playlistUrl: string) => {
    const playlistId = extractPlaylistId(playlistUrl);
    if (!playlistId) {
      console.error('Invalid playlist URL');
      return;
    }

    try {
      setPlaylistProcessingStatus('Extracting videos from playlist...');
      console.log('Extracting videos from playlist...');
      const videoIds = await extractPlaylistVideos(playlistUrl);
      console.log(`Found ${videoIds.length} videos in playlist`);

      if (videoIds.length === 0) {
        throw new Error('No videos found in playlist');
      }

      setPlaylistProcessingStatus(`Found ${videoIds.length} videos, saving to database...`);

      // Create tracks for each video
      const trackPromises = videoIds.map(async (videoId, index) => {
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const trackData = {
          title: `Playlist Track ${index + 1}`,
          artist: 'YouTube Playlist',
          type: 'youtube' as const,
          url: videoUrl
        };

        const response = await musicApi.addTrack(trackData);
        return response.data;
      });

      const newTracks = (await Promise.all(trackPromises)).filter(Boolean) as MusicTrack[];

      if (newTracks.length > 0) {
        setPlaylist(prev => [...prev, ...newTracks]);
        loadVideo(newTracks[0]);
        setCurrentIndex(playlist.length);
        setPlaylistProcessingStatus(`Successfully added ${newTracks.length} tracks from playlist!`);
        console.log(`Successfully added ${newTracks.length} tracks from playlist`);

        // Clear status after 3 seconds
        setTimeout(() => setPlaylistProcessingStatus(''), 3000);
      }
    } catch (error) {
      console.error('Error processing playlist:', error);
      setPlaylistProcessingStatus('Failed to extract playlist. Using fallback tracks...');
      
      // Fallback: Use the fallback tracks from extractPlaylistVideos
      try {
        const fallbackVideoIds = [
          'dQw4w9WgXcQ', // Rick Astley - Never Gonna Give You Up
          'fJ9rUzIMcZQ', // Nirvana - Smells Like Teen Spirit
          'hTWKbfoikeg', // Nirvana - Come As You Are
          'YQHsXMglC9A', // Adele - Hello
          'kJQP7kiw5Fk', // Luis Fonsi - Despacito
          '09R8_2nJtjg', // Maroon 5 - Sugar
          'YlUKc32myk8', // Ed Sheeran - Shape of You
          'L_jWHffIx5E', // Smash Mouth - All Star
          '9bZkp7q19f0', // PSY - Gangnam Style
          'kJQP7kiw5Fk'  // Luis Fonsi - Despacito
        ];

        // Create tracks for fallback videos
        const trackPromises = fallbackVideoIds.map(async (videoId, index) => {
          const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
          const trackData = {
            title: `Fallback Track ${index + 1}`,
            artist: 'YouTube Fallback',
            type: 'youtube' as const,
            url: videoUrl
          };

          const response = await musicApi.addTrack(trackData);
          return response.data;
        });

        const newTracks = (await Promise.all(trackPromises)).filter(Boolean) as MusicTrack[];
        
        if (newTracks.length > 0) {
          setPlaylist(prev => [...prev, ...newTracks]);
          loadVideo(newTracks[0]);
          setCurrentIndex(playlist.length);
          setPlaylistProcessingStatus(`Added ${newTracks.length} fallback tracks (playlist extraction failed)`);
          console.log(`Added ${newTracks.length} fallback tracks`);
          
          // Clear status after 5 seconds
          setTimeout(() => setPlaylistProcessingStatus(''), 5000);
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        setPlaylistProcessingStatus('All methods failed. Please try individual video URLs instead.');
        setTimeout(() => setPlaylistProcessingStatus(''), 5000);
      }
    }
  };


  // Load multiple YouTube videos from URLs
  const loadMultipleVideos = (urls: string[]) => {
    const newTracks: MusicTrack[] = urls.map((url, index) => {
      const videoId = extractVideoId(url);
      return {
        id: videoId,
        title: `Custom Track ${index + 1}`,
        artist: 'YouTube',
        type: 'youtube' as const,
        url: url,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });

    setPlaylist(prev => [...prev, ...newTracks]);
    if (newTracks.length > 0) {
      loadVideo(newTracks[0]);
      setCurrentIndex(playlist.length);
    }
  };

  const loadVideo = (track: MusicTrack) => {
    setIsLoading(true);
    setCurrentVideo(track);
    setIsPlaying(false);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const loadAudioFile = (track: MusicTrack) => {
    setIsLoading(true);
    setCurrentVideo(track);
    setIsPlaying(false);
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const audioFiles = files.filter(file => file.type.startsWith('audio/'));

    if (audioFiles.length > 0) {
      setIsLoadingTracks(true);

      try {
        // Upload files to backend
        const uploadPromises = audioFiles.map(async (file) => {
          const formData = new FormData();
          formData.append('audioFile', file);
          formData.append('title', file.name.replace(/\.[^/.]+$/, ""));
          formData.append('artist', 'Uploaded File');

          const response = await musicApi.uploadAudioFile(formData);
          return response.data?.track;
        });

        const uploadedTracks = (await Promise.all(uploadPromises)).filter(Boolean) as MusicTrack[];

        if (uploadedTracks.length > 0) {
          // Add to current playlist
          setPlaylist(prev => [...prev, ...uploadedTracks]);

          // Load first uploaded track
          loadAudioFile(uploadedTracks[0]);
          setCurrentIndex(playlist.length);
        }
      } catch (error) {
        console.error('Error uploading audio files:', error);
        // Fallback to local handling
        const newTracks = audioFiles.map(file => ({
          id: URL.createObjectURL(file),
          title: file.name.replace(/\.[^/.]+$/, ""),
          artist: 'Local File',
          type: 'audio' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));

        setPlaylist(prev => [...prev, ...newTracks]);
        if (newTracks.length > 0) {
          loadAudioFile(newTracks[0]);
          setCurrentIndex(playlist.length);
        }
      } finally {
        setIsLoadingTracks(false);
      }
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoadingTracks(true);
    setPlaylistProcessingStatus('');

    try {
      // Check if it's multiple URLs (one per line)
      const urls = searchQuery.split('\n').filter(url => url.trim());

      if (urls.length > 1) {
        // Multiple URLs - save to backend
        const trackPromises = urls.map(async (url) => {
          // Check if it's a playlist URL
          if (isPlaylistUrl(url)) {
            await handlePlaylistUrl(url);
            return null; // Playlist handled separately
          }

          const trackData = {
            title: `Custom Track ${urls.indexOf(url) + 1}`,
            artist: 'YouTube',
            type: 'youtube' as const,
            url: url
          };

          const response = await musicApi.addTrack(trackData);
          return response.data;
        });

        const newTracks = (await Promise.all(trackPromises)).filter(Boolean) as MusicTrack[];

        if (newTracks.length > 0) {
          setPlaylist(prev => [...prev, ...newTracks]);
          loadVideo(newTracks[0]);
          setCurrentIndex(playlist.length);
        }
      } else {
        // Single URL - check if it's a playlist
        if (isPlaylistUrl(searchQuery)) {
          await handlePlaylistUrl(searchQuery);
        } else {
          // Single video URL - save to backend
          const trackData = {
            title: 'Custom Track',
            artist: 'YouTube',
            type: 'youtube' as const,
            url: searchQuery
          };

          const response = await musicApi.addTrack(trackData);

          if (response.success && response.data) {
            setPlaylist(prev => [...prev, response.data!]);
            loadVideo(response.data);
            setCurrentIndex(playlist.length);
          }
        }
      }
    } catch (error) {
      console.error('Error adding YouTube tracks:', error);
      // Fallback to local handling
      const urls = searchQuery.split('\n').filter(url => url.trim());

      if (urls.length > 1) {
        loadMultipleVideos(urls);
      } else {
    const videoId = extractVideoId(searchQuery);
        const newTrack: MusicTrack = {
      id: videoId,
      title: 'Custom Track',
          artist: 'YouTube',
          type: 'youtube' as const,
          url: searchQuery,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
    };
    
    setPlaylist(prev => [...prev, newTrack]);
        loadVideo(newTrack);
    setCurrentIndex(playlist.length);
      }
    } finally {
      setIsLoadingTracks(false);
    setSearchQuery('');
    }
  };

  const togglePlay = () => {
    if (currentVideo?.type === 'audio' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    } else {
    setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentIndex(nextIndex);
    const nextVideo = playlist[nextIndex];
    loadVideo(nextVideo);
  };

  const prevTrack = () => {
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    const prevVideo = playlist[prevIndex];
    loadVideo(prevVideo);
  };

  const selectTrack = (index: number) => {
    setCurrentIndex(index);
    const selectedVideo = playlist[index];
    loadVideo(selectedVideo);
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
                <div className="text-xs text-cyan-400 text-shadow-cyan">
                  {currentVideo?.artist || ''}
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
              <div className="text-xs text-cyan-400 text-shadow-cyan">
                {currentVideo?.artist || ''}
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
              className="w-24 sm:w-32 accent-cyan-400"
            />
            <span className="text-cyan-400 font-mono text-sm text-shadow-cyan">{volume}</span>
          </div>

          {/* File Upload */}
          <div className="mb-4 p-3 sm:p-4 bg-black/60 border border-cyan-400 border-ridge shadow-[0_0_15px_rgba(0,255,255,0.2)]">
            <h4 className="text-cyan-400 font-bold mb-2 text-sm sm:text-base text-shadow-cyan">🎵 UPLOAD AUDIO FILES</h4>
            <div className="mb-2">
              <input
                type="file"
                accept="audio/*"
                multiple
                onChange={handleFileUpload}
                disabled={isLoadingTracks}
                className="w-full p-2 bg-black text-green-400 border border-cyan-400 text-xs sm:text-sm text-shadow-green file:bg-cyan-400 file:text-black file:border-0 file:px-2 file:py-1 file:rounded file:text-xs disabled:opacity-50"
              />
            </div>
            <div className="text-xs text-yellow-400 text-shadow-yellow">
              💡 Supports MP3, WAV, OGG, M4A and other audio formats
              {isLoadingTracks && <span className="block mt-1 text-cyan-400">⏳ Uploading files...</span>}
            </div>
          </div>

          {/* YouTube Search */}
          <div className="mb-4 p-3 sm:p-4 bg-black/60 border border-cyan-400 border-ridge shadow-[0_0_15px_rgba(0,255,255,0.2)]">
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
          </div>

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
                  <div className="text-xs text-gray-400">{track.artist}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* YouTube Player (Hidden) */}
      {currentVideo && currentVideo.type === 'youtube' && (
        <div className="hidden">
          <iframe
            ref={playerRef}
            width="0"
            height="0"
            src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=${isPlaying ? 1 : 0}&controls=0`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}

      {/* Audio Player (Hidden) */}
      {currentVideo && currentVideo.type === 'audio' && (
        <div className="hidden">
          <audio
            ref={audioRef}
            src={currentVideo.url || currentVideo.id}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => nextTrack()}
            onError={(e) => {
              console.error('Audio playback error:', e);
              console.error('Audio source:', currentVideo.url || currentVideo.id);
            }}
            onLoadStart={() => {
              console.log('Audio loading started:', currentVideo.url || currentVideo.id);
            }}
            onCanPlay={() => {
              console.log('Audio can play:', currentVideo.url || currentVideo.id);
            }}
          />
        </div>
      )}

      <div className="text-xs text-cyan-400 text-center mt-3 text-shadow-cyan">
        Note: For full YouTube playback, open videos in new tab due to embedding restrictions
      </div>
    </div>
  );
};

export default MusicPlayer;
