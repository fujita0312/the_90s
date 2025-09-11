import React, { useEffect, useState } from 'react';

// import MemeSlider from './MemeSlider';
// import HitCounter from './HitCounter';



const MainContent: React.FC = () => {
  const [showAllManifesto, setShowAllManifesto] = useState(false);
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

  return (
    <div className="md:bg-gradient-to-r from-black via-gray-800 to-black bg-transparent md:border-2 border-0 border-cyan-400  md:border-ridge md:p-4 p-0 md:shadow-[0_0_25px_rgba(255,255,0,0.3),inset_0_0_25px_rgba(255,255,255,0.1)] relative md:gradient-border">
      <h2 className="rainbow text-center mb-8 md:text-3xl text-xl">
        📡 MESSAGE FROM THE FUTURE 📡
      </h2>

      {/* Coin Icon */}
      <div className="text-center mb-8 flex flex-col items-center justify-center">
        <div className="relative md:w-40 w-32 md:h-40 h-32 mb-2.5">
          {/* 3D Coin Container with Reflection */}
          <div className="coin-purse w-full h-full">
            <div className="coin-3d-container coin-enhanced w-full h-full">
              {/* Back side of coin */}
              <div className="coin-back"></div>
              {/* Thickness layers */}
              <div className="coin-middle coin-middle-1"></div>
              <div className="coin-middle coin-middle-2"></div>
              <div className="coin-middle coin-middle-3"></div>
              <div className="coin-middle coin-middle-4"></div>
              <div className="coin-middle coin-middle-5"></div>
              <div className="coin-middle coin-middle-6"></div>
              <div className="coin-middle coin-middle-7"></div>
              <div className="coin-middle coin-middle-8"></div>
              <div className="coin-middle coin-middle-9"></div>
              {/* Front side of coin */}
              <div className="coin-front"></div>
            </div>
          </div>
        </div>
        <div className="md:text-xl text-lg text-yellow-400 mt-2.5 animate-pulse">
          The Ultimate Meme Coin
        </div>
      </div>

      {/* Main Message */}
      <div className="md:p-4 p-2 border-3 border-cyan-400 border-ridge mb-8 text-white shadow-[0_0_30px_rgba(0,255,255,0.3)]" style={{ background: "linear-gradient(135deg,rgba(0, 0, 139, 0.9),rgba(25, 25, 112, 0.8))" }}>
        <h3 className="text-cyan-400 text-center mb-5 md:text-2xl text-xl font-bold">
          In 2025 the 90s are literally EVERYWHERE.
        </h3>

        <p className="mb-4 leading-relaxed md:text-xl text-lg">
          We created the culture that never dies. Beepers and Walkmans, time flies.
        </p>
        <p className="mb-2 leading-relaxed">Computer room. box tv screens.</p>
        <p className="mb-2 leading-relaxed">Video memories. Dial-up dreams.</p>
        <p className="mb-6 leading-relaxed">Mix tapes and now the memes.</p>

        <div className="flame text-center my-8 md:text-2xl text-base bg-black/50 p-4 md:border-3 border-2 border-orange-500">
          THATS ALL US. WE DID THAT.
        </div>

        <div className="bg-black/60 md:p-5 p-2 md:border-2 border border-[#00ff00] md:my-6 my-4">
          <div className="text-[#00ff00] text-center mb-4 font-bold md:text-lg text-base">
            GUIDE TO GETTING PAID IN 2025.
          </div>
          <ul className="text-[#00ff00] leading-loose list-disc ml-5">
            <li>
              🕹 Save your video games systems and all the games. Honestly it's
              best if you don't play them and keep them unopened and in original
              package. TRUST ME.
            </li>
            <li>
              👖 90s Fashion is everywhere. Starter Jackets, Band Tee's, Snap
              Backs Hats. All things 90s Style fetch a pretty penny.
            </li>
            <li>
              😐 Those Pokemon and Magic the Gathering Cards you're thinking
              about playing with don't. Seriously. Unopened packs of both fetch
              many $1000s of dollars each pack.
            </li>
            <li>🎮 Original Sealed Tomagatchis are selling for 3k.</li>
            <li>
              📼 Disney VHS. BLACK DIAMOND EDITION. Find em. Keep them. Protect
              them. Why $1000-$15000 each
            </li>
            <li>
              💶 90s FRESH Coin. When ever it comes to you grab some. This is
              what they refer to as crypto. It's internet money and 90s Fresh is
              hot. But don't take my advice dyor.
            </li>
          </ul>
        </div>
      </div>

      {/* The 90s Manifesto Section */}
      <div className="md:p-4 p-2 border-3 border-purple-500 border-ridge mb-8 text-white shadow-[0_0_30px_rgba(147,51,234,0.3)]" style={{ background: "linear-gradient(135deg,rgba(75, 0, 130, 0.9),rgba(138, 43, 226, 0.8))" }}>
        <div className="space-y-4 text-sm md:text-base leading-relaxed">
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
          {showAllManifesto && (
            <>
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
            </>
          )}
        </div>

        {/* Toggle Button */}
        <div className="text-center mt-4">
          <button
            onClick={() => setShowAllManifesto(!showAllManifesto)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold md:py-2 py-1.5 md:px-6 px-4 border-2 border-purple-400 hover:border-purple-300 transition-all duration-300 hover:scale-105 shadow-[0_0_15px_rgba(147,51,234,0.4)] hover:shadow-[0_0_25px_rgba(147,51,234,0.6)] md:text-base text-sm md:w-auto w-full max-w-xs mx-auto block"
          >
            {showAllManifesto ? '🔼 Show Less' : '🔽 Show More (4 more principles)'}
          </button>
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

      {/* Meme Slider Section */}
      {/* <MemeSlider /> */}

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

    </div>
  );
};

export default MainContent;
