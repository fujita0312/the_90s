import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';

const LeftSidebar: React.FC = () => {
  const [holders, setHolders] = useState(1337);
  const { showToast } = useToast();

  useEffect(() => {
    // Update holders count every 7 seconds
    const interval = setInterval(() => {
      setHolders(prev => prev + Math.floor(Math.random() * 5));
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  const handleBuyNow = () => {
    showToast("🚀 LAUNCHING TO PUMP.FUN! 🚀\n\nRemember: This is not financial advice!\nJust pure 90s nostalgia vibes!\n\nWASSSUPPP! 🕺", 'info');
  };

  return (
    <div className="bg-gradient-to-br from-black/90 via-blue-900/80 to-black/90 md:border-4 border-2 border-yellow-400 border-ridge md:p-3 p-1 shadow-[0_0_25px_rgba(255,255,0,0.3),inset_0_0_25px_rgba(255,255,255,0.1)] relative gradient-border">
      <h3 className="animate-blink text-center text-pink-500 md:text-xl text-lg mb-8">
        🔥 LIVE STATS 🔥
      </h3>

      {/* Dancing Baby Section */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center md:mb-2.5 mb-1.5">
          <img
            src="/emoji_dancing_baby.png"
            alt="Dancing Baby"
            className="w-[60%] rounded"
          />
        </div>
        <div className="text-lg text-[#00ff00] mt-2.5">
          Dancing Baby Approved!
        </div>
        <div className="text-sm text-yellow-400 mt-1.5">
          Since 1996!
        </div>
      </div>

      {/* Holders Stats */}
      <div className="md:border-4 border-2 border-[#00ff00] md:p-5 p-2 mb-5 text-[#00ff00] shadow-[0_0_15px_#00ff00] relative" style={{ background: "linear-gradient(45deg,rgba(0, 100, 0, 0.9),rgba(0, 150, 0, 0.7))" }}>
        <div className="absolute -top-2.5 -right-2.5 bg-black p-1.5 border-2 border-[#00ff00] rounded-full">
          📈
        </div>
        <div className="text-xl">
          Holders: <span className="flame">{holders.toLocaleString()}</span>
        </div>
        <div className="flame text-center my-4">
          🔥 HOTTER THAN A PENTIUM! 🔥
        </div>
        <div className="mt-4 text-center bg-black/50 p-2.5 border border-[#00ff00]">
          <img src="/emoji_floppy_disk.png" alt="Clippy" className="inline-block w-5 h-5 mr-1" />
          <span className="text-xl">👀</span> Clippy Says: "BUY!"
          <div className="text-sm mt-1.5">
            "It looks like you're trying to get rich!"
          </div>
        </div>
      </div>

      {/* Vibe Meter */}
      <div className="border-2 md:border-4 border-[#00ff00] md:p-5 p-2 mb-5 text-[#00ff00] shadow-[0_0_15px_#00ff00] relative" style={{ background: "linear-gradient(45deg,rgba(0, 100, 0, 0.9),rgba(0, 150, 0, 0.7))" }}>
        <div className="absolute -top-2.5 -right-2.5 bg-black p-1.5 border-2 border-[#00ff00] rounded-full">
          📈
        </div>
        <h4 className="text-yellow-400 md:text-center text-left mb-2.5 md:text-xl text-lg">🎮 VIBE METER 🎮</h4>
        <div className="md:mb-2.5 mb-1.5 flex md:flex-col">
          <span>
            Nostalgia Level:
          </span>
          <span className="text-[#00ff00] md:text-xl text-base">████████░░ (8/10)</span>
        </div>
        <div className="md:mb-2.5 mb-1.5 flex md:flex-col">
          <span>
            Meme Potential:
          </span>
          <span className="text-pink-500 md:text-xl text-base">██████████ (MAX)</span>
        </div>
        <div className="md:mb-2.5 mb-1.5 flex md:flex-col">
          <span>
            90s Energy:
          </span>
          <span className="flame md:text-xl text-base">OVER 9000!</span>
        </div>
        <div className="md:mb-2.5 mb-1.5 flex md:flex-col">
          <span>
            Y2K Compliance:
          </span>
          <span className="text-cyan-400 md:text-xl text-base">██████████ (100%)</span>
        </div>
      </div>

      {/* Buy Button */}
      <button
        onClick={handleBuyNow}
        className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-[length:200%_200%] text-white border-2 md:border-4 border-yellow-400 border-ridge py-5 md:text-xl text-lg font-bold cursor-pointer animate-bounce animate-gradient-shift my-5 block text-center shadow-[0_0_20px_#ff4500] text-shadow-90s font-orbitron transition-all duration-300 hover:scale-110 hover:rotate-1"
      >
        🚀 BUY ON PUMP.FUN 🚀
        <div className="text-lg mt-1.5">TO THE MOON!</div>
      </button>

      {/* Under Construction */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-red-600 p-4 text-center md:border-4 border-2 border-red-600 border-ridge my-5 font-bold animate-pulse shadow-[0_0_15px_#ffff00]">
        🚧 TOKENOMICS UNDER CONSTRUCTION 🚧<br />
        <div className="text-lg mt-2.5">
          (But who needs utility when you have PURE VIBES!)
        </div>
        <div className="text-sm mt-1.5">
          Webmaster is updating from his 56k modem
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


    </div>
  );
};

export default LeftSidebar;
