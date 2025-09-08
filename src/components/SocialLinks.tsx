import React from 'react';

interface SocialLinksProps {
  variant?: 'default' | 'compact' | 'minimal';
  showLabels?: boolean;
  className?: string;
}

const SocialLinks: React.FC<SocialLinksProps> = ({ 
  variant = 'default', 
  showLabels = true, 
  className = '' 
}) => {
  const socialLinks = [
    {
      name: 'Telegram',
      url: 'https://t.me/NinetiesFresh',
      icon: '📱',
      color: 'from-blue-600 to-blue-500',
      hoverColor: 'hover:from-blue-700 hover:to-blue-600'
    },
    {
      name: 'Twitter/X',
      url: 'https://x.com/90sFRESHdotCom',
      icon: '🐦',
      color: 'from-gray-800 to-gray-700',
      hoverColor: 'hover:from-gray-900 hover:to-gray-800'
    },
    {
      name: 'Bags.fm',
      url: `https://bags.fm/${process.env.REACT_APP_CONTRACT_ADDRESS}`,
      icon: '👜',
      color: 'from-purple-600 to-purple-500',
      hoverColor: 'hover:from-purple-700 hover:to-purple-600'
    }
  ];

  const handleSocialClick = (url: string, name: string) => {
    // Add analytics or tracking here if needed
    console.log(`Opening ${name}: ${url}`);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (variant === 'minimal') {
    return (
      <div className={`flex gap-2 ${className}`}>
        {socialLinks.map((social) => (
          <button
            key={social.name}
            onClick={() => handleSocialClick(social.url, social.name)}
            className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-3 py-1 border-2 border-white/20 font-bold transition-all duration-300 hover:scale-105 text-sm"
            title={`Follow us on ${social.name}`}
          >
            <span className="text-sm">{social.icon}</span>
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex gap-3 ${className}`}>
        {socialLinks.map((social) => (
          <button
            key={social.name}
            onClick={() => handleSocialClick(social.url, social.name)}
            className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 border-2 border-white/20 font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2 text-sm"
            title={`Follow us on ${social.name}`}
          >
            <span className="text-sm">{social.icon}</span>
            {showLabels && <span className="text-sm font-bold">{social.name}</span>}
          </button>
        ))}
      </div>
    );
  }

  // Default variant
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <h3 className="text-center text-cyan-400 font-bold text-lg mb-2 animate-blink">
        🌐 CONNECT WITH US 🌐
      </h3>
      <div className="flex flex-wrap justify-center gap-3">
        {socialLinks.map((social) => (
          <button
            key={social.name}
            onClick={() => handleSocialClick(social.url, social.name)}
            className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-3 border-2 border-white/20 font-bold transition-all duration-300 hover:scale-105 flex items-center gap-3 hover:border-white/40"
            title={`Follow us on ${social.name}`}
          >
            <span className="text-xl">{social.icon}</span>
            {showLabels && (
              <div className="flex flex-col items-start">
                <span className="font-bold text-sm">{social.name}</span>
                <span className="text-xs opacity-80">Join the community!</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SocialLinks;
