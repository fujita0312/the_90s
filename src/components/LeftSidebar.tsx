import React from 'react';
import { useToast } from '../contexts/ToastContext';
import MusicPlayer from './MusicPlayer';
import { useNavigate } from 'react-router-dom';
// import SocialLinks from './SocialLinks';
const ContractAddress = process.env.REACT_APP_CONTRACT_ADDRESS || '';
const BagsFmUrl = 'https://bags.fm/' + ContractAddress;
const LeftSidebar: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const handleBuyNow = () => {
    showToast("🚀 LAUNCHING TO BAGS.FM! 🚀\n\nRemember: This is not financial advice!\nJust pure 90s nostalgia vibes!\n\nWASSSUPPP! 🕺", 'info');
  };

  return (
    <div className="md:bg-gradient-to-r from-black via-gray-800 to-black bg-transparent md:border-2 border-0 border-cyan-400 md:border-ridge md:p-3 p-0 md:shadow-[0_0_25px_rgba(255,255,0,0.3),inset_0_0_25px_rgba(255,255,255,0.1)] relative md:gradient-border">
      {/* Music Player Section */}
      <MusicPlayer />

      <h3 className="animate-blink text-center text-pink-500 md:text-xl text-lg mb-8 font-bold">
        🔥 $90sFRESH 🔥
      </h3>

      {/* Dancing Baby Section */}
      <div className="text-center mb-8">
        <div className="md:text-6xl text-3xl md:mb-2.5 mb-1.5 relative">
          <div className='w-[60%] h-[50px] rounded-full mx-auto absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#5c5c5c49] transform rotate-x-12 scale-y-75 shadow-[0_8px_16px_rgba(0,0,0,0.8)]' />
          <img
            src="/babydancing.gif"
            alt="baby dancing"
            className="w-full relative z-10"
          />
        </div>
        <div className="text-lg text-[#00ff00] mt-2.5">
          Dancing Baby Approved!
        </div>
        <div className="text-sm text-yellow-400 mt-1.5">
          Since 1996!
        </div>
      </div>

      {/* Contract Address Section */}
      <div className="bg-gradient-to-r from-black via-gray-800 to-black border-3 border-cyan-500 border-ridge md:p-4 p-2 shadow-[0_0_20px_rgba(0,255,255,0.3)] mb-6">
        <h4 className="text-cyan-400 text-center mb-5 text-xl font-bold animate-blink">
          📋 CONTRACT ADDRESS 📋
        </h4>
        <div className="text-center">
          <div className="bg-black/60 md:p-4 p-2 md:border-2 border border-cyan-400 mb-4 hover:bg-black/80 transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,255,255,0.5)]">
            <div className="text-cyan-400 text-sm mb-2">Click to copy & buy:</div>
            <a
              href={BagsFmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-400 hover:text-yellow-300 transition-all duration-300 font-mono text-sm md:text-base break-all hover:underline cursor-pointer hover:scale-105 transform block"
              onClick={(e) => {
                e.preventDefault();
                navigator.clipboard.writeText(ContractAddress);
                showToast("📋 Contract address copied to clipboard!\n\n🚀 Opening bags.fm to buy...\n\nTO THE MOON! 🌙", 'success');
                // Open bags.fm in new tab
                window.open(BagsFmUrl, '_blank');
              }}
            >
              {ContractAddress}
            </a>
          </div>
          <div className="text-white text-sm mb-2">
            🚀 <strong>Ready to join the time travel revolution?</strong> 🚀
          </div>
          <div className="text-cyan-400 text-xs">
            Click address above to copy & visit bags.fm!
          </div>
          <div className="text-yellow-400 text-xs mt-1 animate-pulse">
            ⚡ Instant copy + buy link! ⚡
          </div>
        </div>
      </div>

      {/* Vibe Meter */}
      <div className="border-3 border-ridge border-[#00ff00] md:p-5 p-2 mb-5 text-[#00ff00] shadow-[0_0_15px_#306bb7] relative" style={{
        background: "linear-gradient(45deg,rgba(0, 100, 0, 0.9),rgba(0, 150, 0, 0.7))"
      }}>
        {/* <div className="absolute -top-3 -right-3 bg-black p-2 border-2 border-90s-neon-green rounded-full retro-border-glow">
          🎮
        </div> */}
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

      {/* Chatroom Banner Section */}
      <div className="mb-4 sm:mb-6 max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-black via-gray-800 to-black border-3 border-cyan-400 border-ridge p-3 md:p-4 shadow-[0_0_20px_rgba(0,255,255,0.3)]">
          <div className="mb-4 flex justify-center md:px-6 px-0">
            <a
              href="/chat"
              className="block transition-transform duration-300 hover:scale-105"
              title="Join the 90s Fresh Chatroom!"
            >
              <img
                src="/assets/img/chat-banner.png"
                alt="90s Fresh Chatroom - Join the conversation!"
                className="max-w-full h-auto w-full rounded-lg transition-all duration-500"
                style={{ imageRendering: 'pixelated' }}
              />
            </a>
          </div>
          <div className="text-center">
            <p className="text-cyan-400 text-sm sm:text-base mb-2">
              💬 Join the conversation in our retro chatroom! 💬
            </p>
            <button
              onClick={() => {
                navigate('/chatroom');
                // setTimeout(() => {
                //   window.scrollTo({ top: 0, behavior: 'smooth' });
                // }, 100);
              }}
              className="inline-block bg-gradient-to-r from-cyan-500 to-blue-500 text-black px-4 py-2 sm:px-6 sm:py-2.5 lg:px-8 lg:py-3 border-2 border-cyan-400 hover:scale-105 transition-all duration-300 text-xs sm:text-sm lg:text-base font-bold shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:shadow-[0_0_25px_rgba(0,255,255,0.5)] hover:border-cyan-300"
            >
              <span className="animate-pulse">🚀 Enter Chatroom 🚀</span>
            </button>
          </div>
        </div>
      </div>

      {/* Buy Button */}
      <button
        onClick={handleBuyNow}
        className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-[length:200%_200%] text-white border-3 border-yellow-400 border-ridge py-5 md:text-xl text-lg font-bold cursor-pointer animate-bounce my-5 block text-center shadow-[0_0_20px_#ff4500] text-shadow-90s font-orbitron transition-all duration-300 hover:scale-110 hover:rotate-1"
      >
        🚀 BUY ON BAGS.FM 🚀
        <div className="text-lg mt-1.5">TO THE MOON!</div>
      </button>

      {/* Under Construction */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-red-600 p-4 text-center border-3 border-red-600 border-ridge my-5 m-1 font-bold animate-pulse shadow-[0_0_15px_#ffff00]">
        🚧 TOKENOMICS UNDER CONSTRUCTION 🚧<br />
        <div className="text-lg mt-2.5">
          (But who needs utility when you have PURE VIBES!)
        </div>
        <div className="text-sm mt-1.5">
          Webmaster is updating from his 56k modem
        </div>
      </div>

    </div>
  );
};

export default LeftSidebar;
