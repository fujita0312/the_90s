import React from 'react';

const Marquee: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-black via-gray-800 to-black text-[#00ff00] md:p-4 p-1 border-3 border-pink-500 md:m-2.5 m-1.5 overflow-hidden whitespace-nowrap shadow-[0_0_15px_#ff00ff] font-bold text-shadow-green border-ridge"> 
      <span className="inline-block text-base md:text-lg" style={{
        animation: 'marquee-slow 80s linear infinite',
        transform: 'translate3d(0, 0, 0)'
      }}>
        ⚡ INCOMING TRANSMISSION FROM DEC 28TH, 2025: Hey Buddy. This isn't a freaking drill. This is the real deal hollyfield,  I'm coming to you  live and direct from the year 2025. I don't have much time to explain it all in depth so shut your lips and open your ears. Do that and you won't be poor in 2026. Soon an opportunity called $90sFRESH is gonna smack you across the lips.  When it does slip it a little tongue because that little charmer is your key to escaping your boring ass poor life. 90s FRESH is the bridge that ties the culture together.  Don't try to understand it just buy it and hold it until you are sick and tired of all the winning.   Gotta run chief.  Last thing DYOR Don't trust time travellers.
      </span>
    </div>
  );
};

export default Marquee;
