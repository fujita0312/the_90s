import React from 'react';

const MainContent: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-black/90 via-blue-900/80 to-black/90 md:border-4 border-2 border-yellow-400 border-ridge md:p-4 p-1 shadow-[0_0_25px_rgba(255,255,0,0.3),inset_0_0_25px_rgba(255,255,255,0.1)] relative gradient-border">
      <h2 className="rainbow text-center mb-8 md:text-3xl text-xl">
        📡 MESSAGE FROM THE FUTURE 📡
      </h2>

      {/* Coin Icon */}
      <div className="text-center mb-8 flex justify-center items-center flex-col">
        {/* <div className=" md:text-8xl text-6xl filter drop-shadow-[0_0_20px_#ffd700] mb-2.5"> */}
          <img 
            src="/emoji_y2k.png" 
            alt="Y2K Coin" 
            className="animate-pulse w-20 h-20 md:w-32 md:h-32"
          />
        {/* </div> */}
        <div className="md:text-xl text-lg text-yellow-400 mt-2.5">
          The Ultimate Meme Coin
        </div>
      </div>

      {/* Main Message */}
      <div className="md:p-8 md:p-4 p-2 md:border-4 border-2 border-cyan-400 border-ridge mb-8 text-white shadow-[0_0_30px_rgba(0,255,255,0.3)]" style={{ background: "linear-gradient(135deg,rgba(0, 0, 139, 0.9),rgba(25, 25, 112, 0.8))" }}>
        <h3 className="text-cyan-400 text-center mb-5 md:text-2xl text-xl font-bold">
          🛸 INCOMING GLITCHED TRANSMISSION... SOURCE: UNKNOWN (2025?) 🛸
        </h3>

        <p className="md:text-2xl text-xl mb-4">
          <strong>Dear Original Internet Pioneers,</strong>
        </p>

        <p className="mb-5 leading-relaxed">
          We've discovered something MIND-BLOWING in the future - those dreams
          about internet money from your IRC chats? <span className="animate-blink text-yellow-400">THEY CAME TRUE!</span>
        </p>

        <div className="flame text-center my-8 md:text-2xl text-base bg-black/50 p-4 md:border-3 border-2 border-orange-500">
          🔥 YOUR DECADE CONQUERED EVERYTHING! 🔥
        </div>

        <p className="mb-6 leading-relaxed">
          In 2025, something called "MEME CULTURE" rules the internet, and
          guess what? <strong className="text-yellow-400">IT'S ALL YOUR STUFF!</strong>
        </p>

        <div className="bg-black/60 md:p-5 p-2 md:border-2 border border-[#00ff00] md:my-6 my-4">
          <ul className="text-[#00ff00] leading-loose">
            <li>🎵 Your dial-up sounds = Now considered music</li>
            <li>💬 Your AOL chat slang = Universal language</li>
            <li>🎨 Your GeoCities pages = Worth millions</li>
            <li>🎮 Your Tamagotchis = Came back bigger than ever</li>
            <li>✨ Your Y2K vibes = The ultimate aesthetic</li>
            <li>📺 Your CRT monitors = Premium gaming displays</li>
            <li>💿 Your CD collections = Vintage gold</li>
          </ul>
        </div>

        <div className="animate-bounce text-center bg-gradient-to-r from-yellow-400 to-orange-500 text-black md:p-5 p-2 md:my-8 my-4 border-4 border-red-600 border-ridge font-bold shadow-[0_0_20px_#ffd700] md:text-xl text-lg">
          <strong>
            YOU WEREN'T JUST USING THE INTERNET - YOU WERE CREATING THE
            FUTURE!
          </strong>
        </div>

        <p className="mb-6 leading-relaxed">
          This coin contains the pure essence of your cultural DNA. Every time
          someone buys it, they're not just getting internet money... <span className="rainbow"><strong>they're joining the FOUNDING FATHERS OF DIGITAL COOL!</strong></span>
        </p>

        <div className="text-center my-6">
          <div className="animate-blink md:text-2xl text-xl text-yellow-400">
            ⚡ YOU ARE THE CHOSEN ONES ⚡
          </div>
        </div>
      </div>

      {/* Why This Will Go Viral */}
      <div className="bg-gradient-to-r from-black via-gray-800 to-black md:border-4 border-2 border-pink-500 border-ridge md:p-6 p-2 shadow-[0_0_20px_rgba(255,0,255,0.3)]">
        <h4 className="text-pink-500 text-center mb-5 text-xl font-bold">
          🎯 WHY THIS WILL GO VIRAL:
        </h4>
        <div className="text-white leading-loose md:text-lg text-base ">
          • Perfect nostalgia timing for millennial money<br />
          • Zero utility = Maximum meme potential<br />
          • 90s aesthetic is trending everywhere<br />
          • Built-in community of culture creators<br />
          • Time travel narrative = infinite content<br />
          • Fair launch = No VC dumping<br />
          • Endorsed by dancing baby and Clippy<br />
          • Y2K compliant smart contracts
        </div>
      </div>
    </div>
  );
};

export default MainContent;
