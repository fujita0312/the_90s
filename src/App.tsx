import React, { useRef, useState } from 'react';
import LoadingScreen from './components/LoadingScreen';
import Header from './components/Header';
import Marquee from './components/Marquee';
import HitCounter from './components/HitCounter';
import MainContent from './components/MainContent';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import Footer from './components/Footer';
import DancingBaby from './components/DancingBaby';
import Clippy from './components/Clippy';
import PopupHint from './components/PopupHint';
import MatrixRain from './components/MatrixRain';
import { use90sFeatures } from './hooks/use90sFeatures';
import { ToastProvider } from './contexts/ToastContext';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showMatrixRain, setShowMatrixRain] = useState(false);
  const budweiserAudioRef = useRef<HTMLAudioElement>(null);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    setShowMatrixRain(true);
    try {
      if (budweiserAudioRef.current) {
        budweiserAudioRef.current.play();
      }
    } catch (err) {
      console.log('Budweiser audio play failed:', err);
    }

  };

  return (
    <ToastProvider>
      {isLoading ? (
        <LoadingScreen onComplete={handleLoadingComplete} />
      ) : (
        <AppContent
          showMatrixRain={showMatrixRain}
          onComplete={handleLoadingComplete}
        />
      )}
      <audio ref={budweiserAudioRef} src="/budweiser_wassup.mp3" />
    </ToastProvider>
  );
}

// Separate component to use the toast context
function AppContent({
  showMatrixRain,
  onComplete
}: {
  showMatrixRain: boolean;
  onComplete: () => void;
}) {
  // Initialize 90s features - now inside ToastProvider
  use90sFeatures();
  const [showGames, setShowGames] = useState(false);

  return (
    <div className="min-h-screen">
      {showMatrixRain && <MatrixRain />}

      <DancingBaby />
      <Clippy />
      {/* <PopupHint /> */}

      <Header onGamesClick={() => setShowGames(true)} />
      <Marquee />
      <HitCounter />

      <div className="grid grid-cols-1 md:grid-cols-[330px_1fr_330px] gap-[20px] md:p-5 p-1.5 max-w-[1500px] mx-auto">
        <LeftSidebar />
        <MainContent showGames={showGames} setShowGames={setShowGames} />
        <RightSidebar />
      </div>

      <Footer />
    </div>
  );
}

export default App;
