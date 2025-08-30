import React from 'react';
import { useToast } from '../contexts/ToastContext';

const Clippy: React.FC = () => {
  const { showToast } = useToast();
  
  const messages = [
    "It looks like you're trying to get rich! Would you like help with that?",
    "I see you're browsing a 90s website. Would you like me to find more nostalgia?",
    "Tip: Press F5 to refresh the page and see new visitor numbers!",
    "Did you know? This website is 100% Y2K compliant!",
    "I recommend buying this coin. Trust me, I'm from Microsoft!",
    "Would you like to sign the guestbook? It's the 90s thing to do!",
    "Fun fact: This page loads 420% faster than RealPlayer!",
    "I've been helping people since Windows 97. Buy the dip!",
  ];

  const handleClick = () => {
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    showToast("📎 Clippy says: " + randomMessage, 'info', 4000);
  };

  return (
    <div
      className="fixed top-1/2 left-5 text-4xl animate-clippy-bounce z-50 cursor-pointer filter drop-shadow-[0_0_10px_#00ff00] transform -translate-y-1/2"
      onClick={handleClick}
      title="Hi! I'm Clippy! Click me!"
    >
      📎
    </div>
  );
};

export default Clippy;
