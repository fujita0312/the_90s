import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: '/main', label: 'HOME', icon: '🏠', description: 'Main Page' },
    { path: '/games', label: 'GAMES', icon: '🎮', description: 'Arcade Games' },
    { path: '/memes', label: 'MEMES', icon: '😂', description: '90s Memes' },
    { path: '/chatroom', label: 'CHAT', icon: '💬', description: 'Live Chatroom' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <div className="relative">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="md:hidden fixed top-2 right-2 z-50 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 text-white p-2 border-2 border-yellow-400 hover:scale-110 transition-all duration-300 shadow-[0_0_20px_rgba(255,0,255,0.6)] hover:shadow-[0_0_30px_rgba(255,0,255,0.8)]"
        aria-label="Toggle navigation menu"
      >
        <div className="flex flex-col space-y-1">
          <div className={`w-5 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
          <div className={`w-5 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></div>
          <div className={`w-5 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
        </div>
      </button>

      {/* Mobile Navigation Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-black/80 via-purple-900/60 to-black/80 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu Content */}
          <div className="relative z-50 h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-3 border-b-2 border-yellow-400 bg-gradient-to-r from-purple-900/90 to-pink-900/90">
              <h2 className="text-lg font-bold text-yellow-400 animate-pulse">
                🌟 NAVIGATION 🌟
              </h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-white text-xl hover:text-yellow-400 transition-colors p-1"
              >
                ✕
              </button>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 flex flex-col justify-center items-center space-y-4 p-4">
              {navItems.map((item, index) => (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`group relative w-full max-w-xs px-4 py-3 border-2 transition-all duration-300 transform hover:scale-105 ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-yellow-400/30 to-orange-400/30 border-yellow-400 shadow-[0_0_20px_rgba(255,255,0,0.6)] text-yellow-400'
                      : 'bg-gradient-to-r from-cyan-400/20 to-pink-400/20 border-cyan-400 hover:border-pink-400 text-cyan-400 hover:text-pink-400 hover:shadow-[0_0_15px_rgba(0,255,255,0.4)]'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl group-hover:animate-bounce">
                      {item.icon}
                    </div>
                    <div className="flex flex-col items-start">
                      <div className="text-lg font-bold group-hover:animate-pulse">
                        {item.label}
                      </div>
                      <div className="text-xs opacity-80">
                        {item.description}
                      </div>
                    </div>
                  </div>
                  
                  {/* Active indicator */}
                  {isActive(item.path) && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 animate-pulse shadow-[0_0_10px_rgba(255,255,0,0.8)] flex items-center justify-center">
                      <span className="text-black text-xs">★</span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="p-3 border-t-2 border-yellow-400 bg-gradient-to-r from-purple-900/90 to-pink-900/90">
              <div className="text-center text-green-400 text-xs space-y-1">
                <div className="animate-blink">Optimized for 56k modems | No Flash required</div>
                <div className="text-xs opacity-80">⭐ Powered by Nostalgia Engine v1.0 ⭐</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Navigation */}
      <nav className="hidden md:block">
        <div className="flex items-center justify-center space-x-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`group relative px-3 py-2 text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                isActive(item.path)
                  ? 'text-yellow-400 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border-2 border-yellow-400 shadow-[0_0_15px_rgba(255,255,0,0.5)]'
                  : 'text-cyan-400 hover:text-pink-400 hover:bg-gradient-to-r hover:from-pink-400/20 hover:to-purple-400/20'
              } border-2 border-transparent hover:border-cyan-400`}
            >
              <span className="flex items-center space-x-1">
                <span className="text-lg group-hover:animate-bounce">
                  {item.icon}
                </span>
                <span className="group-hover:animate-pulse">
                  {item.label}
                </span>
              </span>
              
              {/* Active indicator */}
              {isActive(item.path) && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 animate-pulse shadow-[0_0_8px_rgba(255,255,0,0.8)]"></div>
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Navigation;
