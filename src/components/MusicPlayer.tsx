import React, { useState, useRef, useEffect } from 'react';

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


// 90s Music Playlist
const defaultPlaylist = [
  { id: 'dQw4w9WgXcQ', title: 'Rick Astley - Never Gonna Give You Up', artist: 'Rick Astley' },
  { id: 'fJ9rUzIMcZQ', title: 'Queen - Bohemian Rhapsody', artist: 'Queen' },
  { id: 'kJQP7kiw5Fk', title: 'Luis Fonsi - Despacito ft. Daddy Yankee', artist: 'Luis Fonsi' },
  { id: 'JGwWNGJdvx8', title: 'Ed Sheeran - Shape of You', artist: 'Ed Sheeran' },
  { id: '9bZkp7q19f0', title: 'PSY - GANGNAM STYLE', artist: 'PSY' },
  { id: 'YQHsXMglC9A', title: 'Adele - Hello', artist: 'Adele' }
];

const MusicPlayer: React.FC = () => {
  const [currentVideo, setCurrentVideo] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [playlist, setPlaylist] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [volume, setVolume] = useState(50);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const playerRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setPlaylist(defaultPlaylist);
    setCurrentVideo(defaultPlaylist[0]);
  }, []);

  // Extract YouTube video ID from URL
  const extractVideoId = (url: string): string => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : url;
  };

  const loadVideo = (videoId: string, title: string = 'Unknown Track', artist: string = 'Unknown Artist') => {
    setIsLoading(true);
    setCurrentVideo({ id: videoId, title, artist });
    setIsPlaying(false);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    const videoId = extractVideoId(searchQuery);
    const newTrack = {
      id: videoId,
      title: 'Custom Track',
      artist: 'YouTube'
    };
    
    setPlaylist(prev => [...prev, newTrack]);
    loadVideo(videoId, newTrack.title, newTrack.artist);
    setCurrentIndex(playlist.length);
    setSearchQuery('');
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentIndex(nextIndex);
    const nextVideo = playlist[nextIndex];
    loadVideo(nextVideo.id, nextVideo.title, nextVideo.artist);
  };

  const prevTrack = () => {
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    const prevVideo = playlist[prevIndex];
    loadVideo(prevVideo.id, prevVideo.title, prevVideo.artist);
  };

  const selectTrack = (index: number) => {
    setCurrentIndex(index);
    const selectedVideo = playlist[index];
    loadVideo(selectedVideo.id, selectedVideo.title, selectedVideo.artist);
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

          {/* YouTube Search */}
          <div className="mb-4 p-3 sm:p-4 bg-black/60 border border-cyan-400 border-ridge shadow-[0_0_15px_rgba(0,255,255,0.2)]">
            <h4 className="text-cyan-400 font-bold mb-2 text-sm sm:text-base text-shadow-cyan">🔍 ADD YOUTUBE TRACK</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Paste YouTube URL or Video ID..."
                className="flex-1 p-2 bg-black text-green-400 border border-cyan-400 text-xs sm:text-sm text-shadow-green"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                className="bg-cyan-400 hover:bg-cyan-300 text-black px-3 py-2 transition-colors shadow-glow-cyan"
              >
                <SearchIcon />
              </button>
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
                  className={`p-2 cursor-pointer mb-1 text-xs sm:text-sm transition-colors ${
                    index === currentIndex
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
      {currentVideo && (
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

      <div className="text-xs text-cyan-400 text-center mt-3 text-shadow-cyan">
        Note: For full YouTube playback, open videos in new tab due to embedding restrictions
      </div>
    </div>
  );
};

export default MusicPlayer;
