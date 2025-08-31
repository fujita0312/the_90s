import React from 'react';

const Header: React.FC = () => {
  return (
    <div className="text-center md:p-4 p-2 py-7 bg-gradient-to-r from-[#ff1493] via-[#00ced1] via-[#ffd700] to-[#ff1493] bg-[length:400%_400%] animate-gradient-shift-header md:border-5 border-2 border-yellow-400 border-ridge md:m-2.5 m-1 shadow-[0_0_20px_#ff00ff,inset_0_0_20px_rgba(255,255,255,0.2)] relative">
      {/* Left star */}
      <div className="absolute md:top-2.5 top-1.5 md:left-2.5 left-1.5 text-base md:text-3xl animate-spin">
        🌟
      </div>

      {/* Right star */}
      <div className="absolute md:top-2.5 top-1.5 md:right-2.5 right-1.5 text-base md:text-3xl animate-spin" style={{ animationDirection: 'reverse' }}>
        🌟
      </div>

      <h1 className="rainbow bounce animate-pulse text-2xl md:text-4xl">
        ☆ 90's FRESH ☆
      </h1>

      <div className="animate-blink text-base md:text-3xl md:mt-4 mt-2 md:mb-4 mb-2">
        WARNING: TEMPORAL GLITCH DETECTED! 90s DATASTREAM CORRUPTING 2025!
      </div>

      <div className="md:mt-4 mt-2 md:text-xl text-lg">
        <span className="animate-spin">
          <img src="/emoji_floppy_disk.png" alt="Floppy Disk" className="inline-block w-6 h-6 md:w-8 md:h-8" />
        </span> Best viewed in Netscape Navigator 4.0!
        <span className="animate-spin">
          <img src="/emoji_floppy_disk.png" alt="Floppy Disk" className="inline-block w-6 h-6 md:w-8 md:h-8" />
        </span>
      </div>

      <div className="md:mt-2.5 mt-1.5 text-lg">
        <span className="animate-blink">🌐 Now with 256 colors! 🌐</span>
      </div>
    </div>
  );
};

export default Header;
