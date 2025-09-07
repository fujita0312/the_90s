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

  return (
    <div className="md:bg-gradient-to-br bg-transparent from-black/90 via-blue-900/80 to-black/90 md:border-2 border-0 border-cyan-400  md:border-ridge md:p-3 p-2 md:shadow-[0_0_25px_rgba(255,255,0,0.3),inset_0_0_25px_rgba(255,255,255,0.1)] relative md:gradient-border">
      <h3 className="animate-blink text-center text-pink-500 text-xl mb-8">
        📝 GUESTBOOK 📝
      </h3>

      {/* Guestbook */}
      <div id="guestbook-section" className="bg-gradient-to-br from-slate-900 to-slate-800 md:border-4 border-2 border-gray-300 border-ridge md:p-2 p-1 mb-5 max-h-96 overflow-y-auto shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
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

      {/* Games Section */}
      <div id="games-section" className="mt-5 bg-gradient-to-r from-black via-gray-800 to-black md:border-4 border-2 border-pink-500 border-ridge md:p-4 p-2 shadow-[0_0_20px_rgba(255,0,255,0.3)] mb-6">
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

      {/* Why This Will Go Viral */}
      <div className="bg-gradient-to-r from-black via-gray-800 to-black md:border-4 border-2 border-pink-500 border-ridge md:p-6 p-2 shadow-[0_0_20px_rgba(255,0,255,0.3)]">
        <h4 className="text-pink-500 text-center mb-5 text-xl font-bold">
          🎯 WHY THIS WILL GO VIRAL:
        </h4>
        <div className="text-white leading-loose md:text-lg text-base ">
          • Perfect nostalgia timing for millennial money<br />
          • Zero utility = Maximum meme potential<br />
          • 90s aesthetic is trending everywhere<br />
          • Built-in community of culture creators<br />
          • Time travel narrative = infinite content<br />
          • Fair launch = No VC dumping<br />
          • Endorsed by dancing baby and Clippy<br />
          • Y2K compliant smart contracts
        </div>
      </div>

      {/* Awards */}
      <div className="text-center p-6 bg-gradient-to-br from-yellow-400/30 to-orange-500/20 border-3 border-yellow-400 border-ridge my-5 shadow-[0_0_20px_rgba(255,215,0,0.5)]">
        <h4 className="text-yellow-400 mb-4">🏆 AWARDS WON 🏆</h4>
        <div className="leading-relaxed">
          ⭐ Best Time Travel Coin 2025<br />
          🔥 Sickest Nostalgia Vibes<br />
          💎 Diamond Hands Approved<br />
          🎯 Most Viral Potential<br />
          🌟 GeoCities Hall of Fame<br />
          📺 Featured on TechTV
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
