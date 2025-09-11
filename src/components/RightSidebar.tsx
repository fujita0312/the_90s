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

  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [userInitials, setUserInitials] = useState('');
  const [hasAgreed, setHasAgreed] = useState(false);
  const [agreementError, setAgreementError] = useState('');

  const handleAgreementSubmit = () => {
    if (!userInitials.trim()) {
      setAgreementError('Please enter your initials');
      return;
    }
    if (userInitials.length < 2) {
      setAgreementError('Initials must be at least 2 characters');
      return;
    }
    setAgreementError('');
    localStorage.setItem('hasAgreed', userInitials);
    setHasAgreed(true);
    setShowAgreementModal(false);
  };

  useEffect(() => {
    const hasAgreed = localStorage.getItem('hasAgreed');
    if (hasAgreed) {
      setHasAgreed(true);
      setUserInitials(hasAgreed);
    }
  }, []);

  const handleInitialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
    setUserInitials(value);
    setAgreementError('');
  };

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
            className="max-w-full h-auto w-full rounded-lg transition-all duration-500 animate-fade-in"
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


      {/* The 90s Manifesto Section */}
      <div className="mt-5 md:p-1 p-2 border-3 border-purple-500 border-ridge mb-8 text-white shadow-[0_0_30px_rgba(147,51,234,0.3)]" style={{ background: "linear-gradient(135deg,rgba(75, 0, 130, 0.9),rgba(138, 43, 226, 0.8))" }}>
        <div className="mb-1 flex justify-center">
          <img
            src="/assets/img/manifesto-banner.png"
            alt="Manifesto - Retro pixel art banner with neon colors and classic computer elements"
            className="max-w-full h-auto w-full rounded-lg transition-all duration-500 animate-fade-in"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
        <div className="space-y-4 text-sm md:text-base leading-relaxed max-h-96 overflow-y-auto custom-scrollbar">
          <div className="bg-black/40 p-3 rounded border-l-4 border-purple-400">
            <strong className="text-purple-300">I. We are Freethinkers, Not Followers.</strong><br />
            We are creators, not destroyers. Though our visions may differ, we journey toward the same destination—a future we shape with our own hands.
          </div>

          <div className="bg-black/40 p-3 rounded border-l-4 border-purple-400">
            <strong className="text-purple-300">II. We Believe Anything is Possible.</strong><br />
            Built to persevere, we rise from every fall and create anew. We embrace the journey's uncertainty, for while the path remains uncharted, our outcome is inevitable.
          </div>

          <div className="bg-black/40 p-3 rounded border-l-4 border-purple-400">
            <strong className="text-purple-300">III. Each Voice Matters in Our Collective Symphony.</strong><br />
            We will not wait for others to act. When we see what needs fixing, we fix it—respectfully, selflessly, without hunger for recognition.
          </div>

          <div className="bg-black/40 p-3 rounded border-l-4 border-purple-400">
            <strong className="text-purple-300">IV. We Act with Love, Not Permission.</strong><br />
            We don't wait for approval. We respond to what stands before us, guided by hearts full of love and minds sharp with purpose.
          </div>

          <div className="bg-black/40 p-3 rounded border-l-4 border-purple-400">
            <strong className="text-purple-300">V. Leaderless Yet Unstoppable.</strong><br />
            Our movement flows without a single commander, yet our mission burns crystal clear. We cannot, will not lose.
          </div>

          <div className="bg-black/40 p-3 rounded border-l-4 border-purple-400">
            <strong className="text-purple-300">VI. United by Our Sacred Decade.</strong><br />
            Bound together through the music that moved us, the movies that shaped us, the fashion that defined us, and above all—our memes. We are the alpha and omega of meme culture. When the moment demands it, we remind the world who truly runs this kingdom.
          </div>

          <div className="bg-black/40 p-3 rounded border-l-4 border-purple-400">
            <strong className="text-purple-300">VII. Ideas Live Through Action.</strong><br />
            Your brilliance means nothing without the courage to execute. We implement without permission, we create without recognition. The reward is the creation itself—awesome as an undeniable force, excellence as our baseline.
          </div>

          <div className="bg-black/40 p-3 rounded border-l-4 border-purple-400">
            <strong className="text-purple-300">VIII. We Create Unapologetically.</strong><br />
            We believe in ourselves and understand our place in the hierarchy of meme history. We are both students and masters of the craft that defines generations.
          </div>

          <div className="bg-black/40 p-3 rounded border-l-4 border-purple-400">
            <strong className="text-purple-300">IX. We Ride Together Until the End.</strong><br />
            We support our 90s movement and every soul riding this wave with us—until the fucking wheels fall off.
          </div>
        </div>


        <div className="text-center mt-6 md:p-4 p-3 bg-gradient-to-r from-purple-600/30 to-pink-600/30 border-2 border-purple-400">
          <div className="text-purple-300 font-bold md:text-lg text-base mb-2">We created a culture that never dies.</div>
          <div className="text-pink-400 font-bold md:text-xl text-lg">WE ARE 90sFRESH.</div>
        </div>

        {/* Agreement Section */}
        <div className="text-center mt-6 md:p-4 p-3 bg-gradient-to-r from-green-600/30 to-blue-600/30 border-2 border-green-400">
          {!hasAgreed ? (
            <div>
              <div className="text-green-300 font-bold md:text-lg text-base mb-4 px-2">
                Do you agree to the 90s Fresh Manifesto?
              </div>
              <button
                onClick={() => setShowAgreementModal(true)}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold md:py-3 py-2 md:px-8 px-4 border-2 border-green-400 hover:border-green-300 transition-all duration-300 hover:scale-105 shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:shadow-[0_0_25px_rgba(34,197,94,0.6)] md:text-lg text-sm md:w-auto w-full max-w-xs mx-auto block"
              >
                ✍️ I AGREE - SIGN WITH INITIALS
              </button>
            </div>
          ) : (
            <div>
              <div className="text-green-300 font-bold md:text-lg text-base mb-2">
                ✅ AGREED & SIGNED
              </div>
              <div className="text-blue-400 font-bold md:text-xl text-lg break-words">
                {userInitials} - OFFICIALLY 90sFRESH
              </div>
              <div className="text-green-400 md:text-sm text-xs mt-2">
                Welcome to the movement! 🎮✨
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Agreement Modal */}
      {showAgreementModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-gradient-to-br from-purple-900 via-gray-800 to-black border-3 border-cyan-400 border-ridge md:p-6 p-4 max-w-md w-full mx-2 shadow-[0_0_50px_rgba(0,255,255,0.5)] max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-4 md:mb-6">
              <h3 className="text-cyan-400 md:text-2xl text-xl font-bold mb-2">
                🎮 90s FRESH AGREEMENT 🎮
              </h3>
              <p className="text-white md:text-lg text-base leading-relaxed px-2">
                By signing below, you agree to uphold the 90s Fresh Manifesto and join our movement.
              </p>
            </div>

            <div className="mb-4 md:mb-6">
              <label className="block text-green-400 font-bold md:text-lg text-base mb-2">
                Enter Your Initials:
              </label>
              <input
                type="text"
                value={userInitials}
                onChange={handleInitialsChange}
                placeholder="e.g., JD"
                maxLength={10}
                className="w-full md:p-3 p-2 text-center md:text-2xl text-xl font-bold bg-black/50 border-2 border-cyan-400 text-cyan-400 focus:border-green-400 focus:outline-none focus:shadow-[0_0_15px_rgba(0,255,255,0.3)] uppercase tracking-widest"
              />
              {agreementError && (
                <p className="text-red-400 text-sm mt-2 text-center">{agreementError}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => {
                  setShowAgreementModal(false);
                  setAgreementError('');
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold md:py-3 py-2 px-4 border-2 border-gray-400 hover:border-gray-300 transition-all duration-300 md:text-base text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAgreementSubmit}
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold md:py-3 py-2 px-4 border-2 border-green-400 hover:border-green-300 transition-all duration-300 hover:scale-105 shadow-[0_0_15px_rgba(34,197,94,0.4)] md:text-base text-sm"
              >
                ✍️ Sign & Agree
              </button>
            </div>

            <div className="text-center mt-3 md:mt-4 text-xs text-gray-400 px-2">
              Your initials will be displayed as proof of agreement
            </div>
          </div>
        </div>
      )}

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
