import React from 'react';

interface HeaderProps {
}

const Header: React.FC<HeaderProps> = () => {
  return (
    <div className="text-center md:p-4 p-2 py-7 bg-gradient-to-r from-[#ff1493] via-[#00ced1] via-[#ffd700] to-[#ff1493] bg-[length:400%_400%] animate-gradient-shift-header md:border-4 border-2 border-yellow-400 border-ridge md:m-2.5 m-1 shadow-[0_0_20px_#ff00ff,inset_0_0_20px_rgba(255,255,255,0.2)] relative">
      {/* Left star */}
      <div className="absolute md:top-2.5 top-1.5 md:left-2.5 left-1.5 text-base md:text-3xl animate-spin">
        🌟
      </div>

      {/* Right star */}
      <div className="absolute md:top-2.5 top-1.5 md:right-2.5 right-1.5 text-base md:text-3xl animate-spin" style={{ animationDirection: 'reverse' }}>
        🌟
      </div>

      <h1 className="rainbow bounce animate-pulse text-2xl md:text-4xl">
        ☆ 90's FRESH TIL INFINITY ☆
      </h1>

      <div className="animate-blink text-base md:text-3xl md:mt-4 mt-2 md:mb-4 mb-2">
        🚀 TRANSMISSION FROM 2025! THE 90s CONQUERED THE FUTURE! 🚀
      </div>

      <div className="md:mt-4 mt-2 md:text-xl text-lg">
        <span className="animate-spin">💿</span> Best viewed in Netscape Navigator 4.0!
        <span className="animate-spin">💿</span>
      </div>

      <div className="md:mt-2.5 mt-1.5 text-lg">
        <span className="animate-blink">🌐 Now with 256 colors! 🌐</span>
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
