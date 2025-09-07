import React from 'react';
import Navigation from './Navigation';

interface HeaderProps {
}

const Header: React.FC<HeaderProps> = () => {
  return (
    <div className="bg-gradient-to-r from-[#ff1493] via-[#00ced1]  to-[#ff1493] bg-[length:400%_400%] text-center md:p-6 p-4 py-8 md:m-3 m-1.5 relative cyber-scan-line animate-gradient-shift-header md:border-2 border-2 border-yellow-400 ">
      {/* Enhanced star decorations */}
      <div className="absolute md:top-3 top-2 md:left-3 left-2 text-lg md:text-4xl animate-spin ">
        ⭐
      </div>
      <div className="absolute md:top-3 top-2 md:right-3 right-2 text-lg md:text-4xl animate-spin " style={{ animationDirection: 'reverse' }}>
        ⭐
      </div>
      
      {/* Additional corner decorations */}
      <div className="absolute md:bottom-3 bottom-2 md:left-3 left-2 text-sm md:text-xl animate-pulse text-90s-neon-cyan">
        🔥
      </div>
      <div className="absolute md:bottom-3 bottom-2 md:right-3 right-2 text-sm md:text-xl animate-pulse text-90s-neon-pink">
        💫
      </div>

      <h1 className="rainbow bounce animate-pulse text-2xl md:text-5xl font-impact retro-text-glow mb-2">
        ☆ 90's FRESH TIL INFINITY ☆
      </h1>

      <div className="animate-blink text-lg md:text-4xl md:mt-6 mt-3 md:mb-6 mb-3 font-bold text-90s-neon-yellow retro-text-glow">
        🚀 TRANSMISSION FROM 2025! THE 90s CONQUERED THE FUTURE! 🚀
      </div>

      <div className="md:mt-6 mt-3 md:text-2xl text-lg font-comic text-90s-neon-cyan">
        <span className="animate-spin inline-block">💿</span> Best viewed in Netscape Navigator 4.0!
        <span className="animate-spin inline-block">💿</span>
      </div>

      <div className="md:mt-4 mt-2 text-lg md:text-xl font-comic text-90s-neon-green">
        <span className="animate-blink">🌐 Now with 256 colors! 🌐</span>
      </div>

      {/* Navigation Menu */}
      <div className="md:mt-6 mt-4">
        <Navigation />
      </div>

      {/* Enhanced status indicators */}
      <div className="md:mt-6 mt-4 flex flex-wrap justify-center gap-4 text-sm md:text-base">
        <div className=" px-3 py-1 text-90s-neon-green">
          <span className="animate-pulse">●</span> ONLINE
        </div>
        <div className=" px-3 py-1 text-90s-neon-cyan">
          <span className="animate-pulse">●</span> 56K MODEM
        </div>
        <div className=" px-3 py-1 text-90s-neon-pink">
          <span className="animate-pulse">●</span> 1995 MODE
        </div>
      </div>

      {/* Games Button */}
      {/* {onGamesClick && (
        <div className="md:mt-4 mt-2">
          <button
            onClick={onGamesClick}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded border-2 border-purple-400 hover:scale-105 transition-all duration-300 text-lg font-bold shadow-[0_0_15px_rgba(255,0,255,0.5)] hover:shadow-[0_0_25px_rgba(255,0,255,0.7)] hover:border-purple-300 group"
          >
            <span className="group-hover:animate-pulse">🎮 Play Games 🎮</span>
          </button>
        </div>
      )} */}
    </div>
  );
};

export default Header;
