import React, { useRef } from 'react';

const DancingBaby: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleClick = async () => {
    try {
      if (audioRef.current) {
        await audioRef.current.play();
      }
    } catch (err) {
      console.log('Audio play failed:', err);
    }
  };

  return (
    <>
      <div
        className="fixed bottom-5 md:right-5 right-1 md:text-6xl text-5xl animate-dance z-50 cursor-pointer filter drop-shadow-[0_0_10px_#ffd700]"
        onClick={handleClick}
        title="Click me for dial-up sounds!"
      >
        👶
      </div>
      <audio ref={audioRef} src="/dialup-sound.mp3" />
    </>
  );
};

export default DancingBaby;
