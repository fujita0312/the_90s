import React, { useState } from 'react';
import MemeModal from './MemeModal';
import memeApi from '../services/memeApi';
import { useToast } from '../contexts/ToastContext';

const Footer: React.FC = () => {
  const [isMemeModalOpen, setIsMemeModalOpen] = useState(false);
  const { showToast } = useToast();

  const handleMemeSubmit = async (imageUrl: string | undefined, file?: File) => {
    try {
      let response;

      if (file && file.size > 0) {
        // Handle file upload
        const formData = new FormData();
        formData.append('image', file);
        formData.append('author', 'Anonymous');

        response = await memeApi.uploadMeme(formData);
      } else if (imageUrl && imageUrl.trim()) {
        // Handle URL submission
        response = await memeApi.addMeme({ imageUrl });
      } else {
        throw new Error('Either a file or image URL must be provided');
      }

      if (response.success) {
        showToast('Meme added successfully! 🎉', 'success');
        setIsMemeModalOpen(false);
      } else {
        showToast(response.error || 'Failed to add meme', 'error');
      }
    } catch (error) {
      showToast('Failed to add meme. Please try again.', 'error');
      console.error('Error adding meme:', error);
    }
  };

  return (
    <div className="bg-gradient-to-r from-black via-gray-800 to-black text-[#00ff00] text-center md:p-4 p-3 border-t-2 border-pink-500 border-ridge mt-10 shadow-[0_-10px_20px_rgba(255,0,255,0.3)]">
      {/* Web Ring Links */}
      <div className="flex justify-center gap-5 my-5 flex-wrap">
        <button className="bg-gradient-to-r from-blue-600 to-blue-500 text-white md:px-5 px-2 md:py-2.5 py-1 no-underline md:border-3 border-2 border-white border-ridge font-bold transition-all duration-300 shadow-[0_0_10px_#4169e1] hover:-translate-y-1 hover:shadow-[0_5px_15px_#4169e1] bg-transparent border-none cursor-pointer text-sm md:text-base">
          🏠 HOME
        </button>
        <button
          onClick={() => {
            const guestbookSection = document.querySelector('#guestbook-section');
            if (guestbookSection) {
              guestbookSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="bg-gradient-to-r from-blue-600 to-blue-500 text-white md:px-5 px-2 md:py-2.5 py-1 no-underline md:border-3 border-2 border-white border-ridge font-bold transition-all duration-300 shadow-[0_0_10px_#4169e1] hover:-translate-y-1 hover:shadow-[0_5px_15px_#4169e1] bg-transparent border-none cursor-pointer text-sm md:text-base">
          📝 GUESTBOOK
        </button>
        <button className="bg-gradient-to-r from-blue-600 to-blue-500 text-white md:px-5 px-2 md:py-2.5 py-1 no-underline md:border-3 border-2 border-white border-ridge font-bold transition-all duration-300 shadow-[0_0_10px_#4169e1] hover:-translate-y-1 hover:shadow-[0_5px_15px_#4169e1] bg-transparent border-none cursor-pointer text-sm md:text-base">
          📌 BULLETIN BOARD
        </button>
        <button className="bg-gradient-to-r from-blue-600 to-blue-500 text-white md:px-5 px-2 md:py-2.5 py-1 no-underline md:border-3 border-2 border-white border-ridge font-bold transition-all duration-300 shadow-[0_0_10px_#4169e1] hover:-translate-y-1 hover:shadow-[0_5px_15px_#4169e1] bg-transparent border-none cursor-pointer text-sm md:text-base">
          🔗 COOL LINKS
        </button>
        <button
          onClick={() => {
            const gamesSection = document.querySelector('#games-section');
            if (gamesSection) {
              gamesSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="bg-gradient-to-r from-blue-600 to-blue-500 text-white md:px-5 px-2 md:py-2.5 py-1 no-underline md:border-3 border-2 border-white border-ridge font-bold transition-all duration-300 shadow-[0_0_10px_#4169e1] hover:-translate-y-1 hover:shadow-[0_5px_15px_#4169e1] bg-transparent border-none cursor-pointer text-sm md:text-base">
          🎮 GAMES
        </button>
        <button className="bg-gradient-to-r from-blue-600 to-blue-500 text-white md:px-5 px-2 md:py-2.5 py-1 no-underline md:border-3 border-2 border-white border-ridge font-bold transition-all duration-300 shadow-[0_0_10px_#4169e1] hover:-translate-y-1 hover:shadow-[0_5px_15px_#4169e1] bg-transparent border-none cursor-pointer">
          👨‍💻 WEBMASTER
        </button>
        <button className="bg-gradient-to-r from-blue-600 to-blue-500 text-white md:px-5 px-2 md:py-2.5 py-1 no-underline md:border-3 border-2 border-white border-ridge font-bold transition-all duration-300 shadow-[0_0_10px_#4169e1] hover:-translate-y-1 hover:shadow-[0_5px_15px_#4169e1] bg-transparent border-none cursor-pointer">
          📊 STATS
        </button>
        <button
          onClick={() => setIsMemeModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-500 text-white md:px-5 px-2 md:py-2.5 py-1 no-underline md:border-3 border-2 border-white border-ridge font-bold transition-all duration-300 shadow-[0_0_10px_#4169e1] hover:-translate-y-1 hover:shadow-[0_5px_15px_#4169e1] bg-transparent border-none cursor-pointer"
        >
          😂 MEMES
        </button>
      </div>

      {/* Contact Info */}
      <div className="md:my-8 my-4 leading-loose md:text-lg text-base">
        📧 Email the Webmaster: hello@90sfresh.meme<br />
        Made with ❤️ and HTML 1.0 | Best viewed at 800x600 resolution<br />
        © 1995-2025 | <span className="animate-blink">This site is Y2K compliant!</span><br />
        <span className="text-sm">
          Optimized for 56k modems | No Flash required
        </span>
      </div>

      {/* Legal Disclaimer */}
      <div className="md:border-4 border-2 border-yellow-400 border-ridge md:p-5 p-2 mx-auto max-w-4xl bg-black/80 md:my-8 my-4">
        <strong className="text-yellow-400">⚠️ LEGAL DISCLAIMER ⚠️</strong><br /><br />
        This is not financial advice, just pure 90s vibes! Time travel not
        guaranteed. Side effects may include: extreme nostalgia, uncontrollable
        urge to use dial-up sounds as ringtone, sudden appreciation for Comic
        Sans font, compulsive CD burning, and the overwhelming desire to say
        "WASSSSUPPPP!"
        <br /><br />
        <span className="text-sm text-gray-400">
          No CRT monitors were harmed in the making of this website.
        </span>
      </div>

      {/* Powered By */}
      <div className="mt-5 text-sm text-gray-400">
        <div className="animate-blink">🌟 Powered by Nostalgia Engine v1.0 🌟</div>
      </div>

      {/* Meme Modal */}
      <MemeModal
        isOpen={isMemeModalOpen}
        onClose={() => setIsMemeModalOpen(false)}
        onSubmit={handleMemeSubmit}
      />
    </div>
  );
};

export default Footer;
