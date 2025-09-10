import React, { useState, useEffect } from 'react';
import GuestbookModal from './GuestbookModal';
import { useToast } from '../contexts/ToastContext';
import { GuestbookEntry } from '../types/guestbook';
import guestbookApi from '../services/guestbookApi';
import { useNavigate } from 'react-router-dom';
import HitCounter from './HitCounter';

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
    <div id="guestbook-section" className="md:bg-gradient-to-r from-black via-gray-800 to-black bg-transparent md:border-2 border-0 border-cyan-400  md:border-ridge md:p-3 p-0 md:shadow-[0_0_25px_rgba(255,255,0,0.3),inset_0_0_25px_rgba(255,255,255,0.1)] relative md:gradient-border">

      {/* Guestbook */}
      <div id="guestbook-section" className="bg-gradient-to-r from-black via-gray-800 to-black border-3 border-cyan-500 border-ridge md:p-2 p-2 shadow-[0_0_20px_rgba(0,255,255,0.3)] mb-6">
        {/* Guestbook Banner Image */}
        <div className="mb-4 flex justify-center">
          <img
            src="/assets/img/guestbook-banner.png"
            alt="Guest Book - Retro pixel art banner with neon colors and classic computer elements"
            className="max-w-full h-auto w-full rounded-lg transition-all duration-500"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        {/* Guestbook Entries */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 md:border-2 border border-cyan-400 border-ridge md:p-2 p-1 mb-4 max-h-64 overflow-y-auto shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
          {isLoading ? (
            <div className="text-center p-6 text-cyan-400">
              <div className="animate-spin text-2xl mb-2">🔄</div>
              Loading guestbook entries...
            </div>
          ) : guestbookEntries.length === 0 ? (
            <div className="text-center p-6 text-gray-400">
              <div className="text-2xl mb-2">📝</div>
              No entries yet. Be the first to sign!
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-3 p-2 border-b border-cyan-400/30">
                <span className="text-cyan-400 text-sm font-bold">📝 {guestbookEntries.length} entries</span>
                <button
                  onClick={loadGuestbookEntries}
                  className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors hover:scale-110 transform"
                  title="Refresh guestbook"
                >
                  🔄 Refresh
                </button>
              </div>
              {guestbookEntries.map(entry => (
                <div key={entry.id} className="bg-gradient-to-r from-slate-800 to-slate-700 border-l-4 border-cyan-400 p-3 mb-3 text-white shadow-[0_2px_8px_rgba(0,0,0,0.4)] transition-all duration-200 hover:translate-x-1 hover:shadow-[0_4px_12px_rgba(0,255,255,0.2)]">
                  <strong className="text-cyan-300 text-sm">{entry.name}:</strong><br />
                  <span className="text-gray-200 text-sm leading-relaxed">{entry.message}</span><br />
                  <small className="text-cyan-400 text-xs">Posted: {entry.timestamp}</small>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Sign Guestbook Button */}
        <button
          onClick={handleSignGuestbook}
          className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 text-black md:border-4 border-2 border-cyan-400 border-ridge p-4 font-bold cursor-pointer text-lg shadow-[0_0_15px_rgba(0,255,255,0.4)] hover:shadow-[0_0_25px_rgba(0,255,255,0.6)] hover:scale-105 transition-all duration-300"
        >
          🖊️ SIGN GUESTBOOK 🖊️
        </button>
      </div>


      {/* Games Section */}
      <div id="games-section" className="mt-5 bg-gradient-to-r from-black via-gray-800 to-black border-3 border-pink-500 border-ridge md:p-4 p-2 shadow-[0_0_20px_rgba(255,0,255,0.3)] mb-6">
        {/* Arcade Banner Image */}
        <div className="mb-4 flex justify-center">
          <img
            src="/assets/img/arcade-banner.png"
            alt="90s Games Arcade - Classic retro gaming banner with pixel art elements"
            className="max-w-full h-auto w-full rounded-lg transition-all duration-500"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
        <div className="text-center">
          <p className="text-white mb-4">
            Take a break from the future and enjoy some classic 90s games!
          </p>
          <button
            onClick={() => {
              navigate('/games')
              setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }, 100);
            }}
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white md:px-4 px-3 py-3 border-2 border-pink-400 hover:scale-105 transition-all duration-300 text-lg font-bold shadow-[0_0_20px_rgba(255,0,255,0.3)] hover:shadow-[0_0_30px_rgba(255,0,255,0.5)] hover:border-pink-300 group"
          >
            <span className="group-hover:animate-pulse">🎮 Play Games Now! 🎮</span>
          </button>
        </div>
      </div>

      {/* Why 90sFRESH Will Run */}
      <div className="bg-gradient-to-r from-black via-gray-800 to-black border-3 border-pink-500 border-ridge md:p-3 p-2 shadow-[0_0_20px_rgba(255,0,255,0.3)]">
        <h4 className="text-pink-500 text-center mb-5 text-xl font-bold">
          🎯 WHY 90sFRESH WILL RUN:
        </h4>
        <div className="text-white leading-loose md:text-lg text-base ">
          • 95% of Crypto Users were either born in the 90s or Lived through the 90s.<br />
          • The 90's are the most Influential decade as it pertains to technology and current Pop Culture.<br />
          • 100% FUBU.<br />
          • The 90's Created MEME Culture which is now Pop Culture. We fully understand the power of the meme.<br />
          • The Meta, Aura & Orgin are deeply tied to the core of our beings.<br />
          • Dancing Baby & Clippy give it TWO SNAPS IN A Z FORMATION.<br />
          • 100% Organic. No Bundles. No Insiders. No Cabal.<br />
          • Ultimate Meme. No Utility. Pure Xtreme Vibes.<br />
          • The 90s just like 90sFRESH is a fresh breath in a copy cat meme coin market.
        </div>
      </div>

      {/* Awards */}
      <div className="text-center md:p-4 p-2 bg-gradient-to-br from-yellow-400/30 to-orange-500/20 border-3 border-yellow-400 border-ridge my-5 shadow-[0_0_20px_rgba(255,215,0,0.5)]">
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

      {/* Hit Counter Section */}
      <HitCounter />

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
