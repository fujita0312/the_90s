import React from 'react';

const Marquee: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-black via-gray-800 to-black text-[#00ff00] md:p-4 p-1.5 md:border-3 border-2 border-pink-500 border-ridge md:m-2.5 m-1.5 overflow-hidden whitespace-nowrap shadow-[0_0_15px_#ff00ff] font-bold text-shadow-green">
      <span className="inline-block pl-full animate-marquee text-base md:text-lg">
        ⚡ BREAKING: Future humans confirm 90s culture dominated meme history! LOL, no cap! Your decade created the internet! Join the original digital pioneers! ⚡ WASSSSUPPPP! ⚡ Y2K COMPLIANT... mostly. ⚡
      </span>
    </div>
  );
};

export default Marquee;
