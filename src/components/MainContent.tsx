import React from 'react';
 
import MemeSlider from './MemeSlider';
import MusicPlayer from './MusicPlayer';



const MainContent: React.FC = () => {


  return (
    <div className="md:bg-gradient-to-br bg-transparent from-black/90 via-blue-900/80 to-black/90 md:border-2 border-0 border-cyan-400  md:border-ridge md:p-4 p-1 md:shadow-[0_0_25px_rgba(255,255,0,0.3),inset_0_0_25px_rgba(255,255,255,0.1)] relative md:gradient-border">
      <h2 className="rainbow text-center mb-8 md:text-3xl text-xl">
        📡 MESSAGE FROM THE FUTURE 📡
      </h2>

      {/* Coin Icon */}
      <div className="text-center mb-8">
        <div className="animate-spin md:text-8xl text-6xl filter drop-shadow-[0_0_20px_#ffd700] mb-2.5">
          🪙
        </div>
        <div className="md:text-xl text-lg text-yellow-400 mt-2.5">
          The Ultimate Meme Coin
        </div>
      </div>

      {/* Main Message */}
      <div className="md:p-4 p-2 md:border-4 border-2 border-cyan-400 border-ridge mb-8 text-white shadow-[0_0_30px_rgba(0,255,255,0.3)]" style={{ background: "linear-gradient(135deg,rgba(0, 0, 139, 0.9),rgba(25, 25, 112, 0.8))" }}>
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

      {/* Music Player Section */}
      <MusicPlayer />

      {/* Meme Slider Section */}
      <MemeSlider />

    </div>
  );
};

export default MainContent;
