import React from 'react';

const PopupHint: React.FC = () => {
  return (
    <div className="fixed md:top-5 top-1 md:right-5 right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black md:p-4 p-2 md:border-4 border-2 border-red-600 z-50 animate-blink2 font-bold shadow-[0_0_20px_#ffff00] font-orbitron text-sm md:text-base text-center">
      🔥 THE CA: {process.env.REACT_APP_CONTRACT_ADDRESS} 🔥
    </div>
  );
};

export default PopupHint;
