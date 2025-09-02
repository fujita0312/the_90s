import React, { useState, useEffect } from 'react';

const HitCounter: React.FC = () => {
  const [counter, setCounter] = useState(420690);
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    // Update last updated time every second
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      setLastUpdated(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Animate counter every 5 seconds
    const counterInterval = setInterval(() => {
      setCounter(prev => prev + Math.floor(Math.random() * 10));
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(counterInterval);
    };
  }, []);

  return (
    <div className="bg-gradient-to-br from-black via-gray-800 to-black text-pink-500 md:p-5 p-1.5 md:border-4 border-2 border-cyan-400 border-ridge text-center mx-auto my-5 md:max-w-[400px] max-w-[300px] text-[22px] shadow-[0_0_20px_#00ffff] relative">
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-black px-2.5 py-1.5 md:border-4 border-2 border-ridge border-cyan-400 md:text-[25px] text-[15px]">
        📊
      </div>
      
      <div className="animate-blink md:text-2xl text-xl mt-3">
        You are visitor #<span>{counter.toLocaleString()}</span> since 1995!
      </div>
      
      <div className="mt-2.5 md:text-3xl text-xl">📎 WASSSSUPPPP 🕺</div>
      
      <div className="mt-1.5 md:text-sm text-xs">
        Last updated: <span>{lastUpdated}</span>
      </div>
    </div>
  );
};

export default HitCounter;
