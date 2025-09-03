import React, { useState, useEffect } from 'react';
import GuestbookModal from './GuestbookModal';
import { useToast } from '../contexts/ToastContext';
import { GuestbookEntry } from '../types/guestbook';
import guestbookApi from '../services/guestbookApi';
import { useNavigate } from 'react-router-dom';

// Extend Window interface for webkitAudioContext
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

const RightSidebar: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();
  const [guestbookEntries, setGuestbookEntries] = useState<GuestbookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastBulletinRefresh, setLastBulletinRefresh] = useState<Date>(new Date());
  const navigate = useNavigate();
  // Load guestbook entries on component mount
  useEffect(() => {
    loadGuestbookEntries();
  }, []);

  const loadGuestbookEntries = async () => {
    try {
      setIsLoading(true);
      const response = await guestbookApi.getAllEntries();

      if (response.success && response.data) {
        setGuestbookEntries(response.data);
      } else {
        showToast(`Failed to load guestbook: ${response.error}`, 'error');
      }
    } catch (error) {
      console.error('Error loading guestbook entries:', error);
      showToast('Failed to load guestbook entries', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignGuestbook = () => {
    setIsModalOpen(true);
  };

  const handleGuestbookSubmit = async (name: string, message: string) => {
    try {
      const response = await guestbookApi.addEntry({ name, message });

      if (response.success && response.data) {
        setGuestbookEntries(prev => [response.data!, ...prev]);
        showToast("📝 Thanks for signing the guestbook! Our message has been added to the time capsule! 🕰️", 'success');
      } else {
        showToast(`Failed to add entry: ${response.error}`, 'error');
      }
    } catch (error) {
      console.error('Error adding guestbook entry:', error);
      showToast('Failed to add guestbook entry', 'error');
    }
  };

  const handlePlayDialUp = () => {
    // Create a more realistic dial-up sound simulation
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Create the classic dial-up sequence
    const frequencies = [2100, 1800, 1200, 2400, 1200, 2400];
    let time = 0;

    frequencies.forEach((freq) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + time);
      oscillator.type = 'sawtooth';

      gainNode.gain.setValueAtTime(0, audioContext.currentTime + time);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + time + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + time + 0.5);

      oscillator.start(audioContext.currentTime + time);
      oscillator.stop(audioContext.currentTime + time + 0.5);

      time += 0.3;
    });

    // Show a fun message
    setTimeout(() => {
      showToast("🔊 *DIAL-UP NOISES* 📞\n\nConnecting to AOL...\nBaud rate: 56k\nStatus: WASSSSUPPPP!", 'info');
    }, 100);
  };

  const handleBulletinBoardClick = (post: { title: string; replies: number; emoji: string; category: string }) => {
    // Show a fun toast message when clicking on bulletin board posts
    const messages = [
      `📌 Opening "${post.title}"...\n\nLoading ${post.replies} replies...\nCategory: ${post.category}`,
      `🚀 Launching thread: ${post.title}\n\n${post.emoji} This thread is LIT!`,
      `💫 Accessing: ${post.title}\n\nConnecting to the 90s forum...\nBaud rate: 56k`
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    showToast(randomMessage, 'info');
  };

  const handleRefreshBulletinBoard = () => {
    setLastBulletinRefresh(new Date());
    showToast("🔄 Refreshing bulletin board...\n\nNew posts loaded!\nStay tuned for updates! 📌", 'success');
  };

  return (
    <div className="bg-gradient-to-br from-black/90 via-blue-900/80 to-black/90 md:border-4 border-2 border-yellow-400 border-ridge md:p-3 p-2 shadow-[0_0_25px_rgba(255,255,0,0.3),inset_0_0_25px_rgba(255,255,255,0.1)] relative gradient-border">
      <h3 className="animate-blink text-center text-pink-500 text-xl mb-8">
        📝 GUESTBOOK 📝
      </h3>

      {/* Guestbook */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 md:border-4 border-2 border-gray-300 border-ridge md:p-2 p-1 mb-5 max-h-96 overflow-y-auto shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
        {isLoading ? (
          <div className="text-center p-8 text-cyan-400">
            <div className="animate-spin text-2xl mb-2">🔄</div>
            Loading guestbook entries...
          </div>
        ) : guestbookEntries.length === 0 ? (
          <div className="text-center p-8 text-gray-400">
            <div className="text-2xl mb-2">📝</div>
            No entries yet. Be the first to sign!
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-3 p-2">
              <span className="text-cyan-400 text-sm">📝 {guestbookEntries.length} entries</span>
              <button
                onClick={loadGuestbookEntries}
                className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
                title="Refresh guestbook"
              >
                🔄 Refresh
              </button>
            </div>
            {guestbookEntries.map(entry => (
              <div key={entry.id} className="bg-gradient-to-r from-slate-800 to-slate-700 border-l-5 border-blue-800 p-4 mb-4 text-white rounded shadow-[0_2px_5px_rgba(0,0,0,0.3)] transition-transform duration-200 hover:translate-x-1">
                <strong className="text-cyan-400">{entry.name}:</strong><br />
                {entry.message}<br />
                <small className="text-gray-400">Posted: {entry.timestamp}</small>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Sign Guestbook Button */}
      <button
        onClick={handleSignGuestbook}
        className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 text-black md:border-4 border-2 border-pink-500 border-ridge p-4 font-bold cursor-pointer text-xl shadow-[0_0_10px_#00ced1]"
      >
        🖊️ SIGN GUESTBOOK 🖊️
      </button>

      {/* Bulletin Board */}
      <div className="bg-gradient-to-br from-purple-900 to-purple-800 text-white md:p-2 p-1 md:my-6 my-4 md:border-4 border-2 border-purple-400 border-ridge shadow-[0_0_15px_rgba(218,112,214,0.5)]">
        <h4 className="text-center text-purple-300 mb-4 text-xl">
          📌 BULLETIN BOARD 📌
        </h4>
        <div className="md:text-lg text-base leading-relaxed space-y-2">
          {[
            { title: "Moon mission planning thread", replies: 42, emoji: "🔥", category: "space" },
            { title: "Share our 90s memories!", replies: 138, emoji: "💭", category: "nostalgia" },
            { title: "Diamond hands support group", replies: 69, emoji: "💎", category: "crypto" },
            { title: "Pump.fun tips & tricks", replies: 420, emoji: "📈", category: "trading" },
            { title: "Time traveler AMA", replies: 1337, emoji: "🕰️", category: "meta" },
            { title: "Best dial-up sounds compilation", replies: 666, emoji: "📞", category: "audio" },
            { title: "Y2K bug survivors unite!", replies: 2000, emoji: "🐛", category: "history" }
          ].map((post, index) => (
            <div
              key={index}
              onClick={() => handleBulletinBoardClick(post)}
              className="cursor-pointer hover:bg-purple-700/50 p-2 transition-all duration-200 hover:scale-105 transform border-l-2 border-purple-300 hover:border-purple-100"
              title={`Click to view ${post.title}`}
            >
              → "{post.title}" ({post.replies} replies) {post.emoji}
            </div>
          ))}
        </div>
        <div className="text-center mt-4">
          <button
            onClick={handleRefreshBulletinBoard}
            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 border border-purple-400 transition-colors"
          >
            🔄 Refresh Board
          </button>
          <div className="text-xs text-purple-200 mt-2">
            Last updated: {lastBulletinRefresh.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Web Ring */}
      <div className="bg-pink-500/20 p-5 md:border-4 border-2 border-pink-500 border-ridge my-6 text-center shadow-[0_0_15px_rgba(255,0,255,0.3)]">
        <h4 className="animate-blink text-pink-500 mb-4 text-xl">🌐 WEB RING 🌐</h4>
        <div className="mb-4">
          <button className="text-cyan-400 no-underline mx-1.5 bg-transparent border-none cursor-pointer">← Previous</button>
          |
          <button className="text-cyan-400 no-underline mx-1.5 bg-transparent border-none cursor-pointer">Random</button>
          |
          <button className="text-cyan-400 no-underline mx-1.5 bg-transparent border-none cursor-pointer">Next →</button>
        </div>
        <div className="text-sm text-yellow-400 mt-2.5">
          Member of the Crypto90s Ring
        </div>
      </div>

      {/* Now Playing */}
      <div className="bg-[#00ff00]/10 md:border-4 border-2 border-dashed border-[#00ff00] p-4 my-5 text-center">
        <div className="text-[#00ff00] font-bold">🎵 NOW PLAYING 🎵</div>
        <div className="text-lg my-2.5">
          Dial-Up Connection Sounds
        </div>
        <div className="text-sm text-yellow-400">Volume: ████████░░</div>
        <button
          onClick={handlePlayDialUp}
          className="bg-black text-[#00ff00] border-2 border-[#00ff00] px-4 py-2 mt-2.5 cursor-pointer hover:bg-[#00ff00] hover:text-black transition-colors"
        >
          ▶️ PLAY
        </button>
      </div>

      {/* Games Section */}
      <div className="bg-gradient-to-r from-black via-gray-800 to-black md:border-4 border-2 border-pink-500 border-ridge md:p-4 p-2 shadow-[0_0_20px_rgba(255,0,255,0.3)] mb-6">
        <h4 className="text-pink-500 text-center mb-5 text-xl font-bold">
          🎮 90s GAMES ARCADE 🎮
        </h4>
        <div className="text-center">
          <p className="text-white mb-4">
            Take a break from the future and enjoy some classic 90s games!
          </p>
          <button
            onClick={() => navigate('/games')}
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white md:px-4 px-3 py-3 border-2 border-pink-400 hover:scale-105 transition-all duration-300 text-lg font-bold shadow-[0_0_20px_rgba(255,0,255,0.3)] hover:shadow-[0_0_30px_rgba(255,0,255,0.5)] hover:border-pink-300 group"
          >
            <span className="group-hover:animate-pulse">🎮 Play Games Now! 🎮</span>
          </button>
        </div>
      </div>

      {/* Guestbook Modal */}
      <GuestbookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleGuestbookSubmit}
      />


    </div>
  );
};

export default RightSidebar;
