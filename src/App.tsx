import { useRef, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
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
import MatrixRain from './components/MatrixRain';
import { use90sFeatures } from './hooks/use90sFeatures';
import { ToastProvider } from './contexts/ToastContext';
import Games from './components/Games';
import MemesPage from './components/MemesPage';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoadingScreen />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/memes" element={<MemesPage />} />
          <Route path="/main" element={<AppContent />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

// Separate component to use the toast context
function AppContent() {
  // Initialize 90s features - now inside ToastProvider
  use90sFeatures();
  const navigate = useNavigate();
  const budweiserAudioRef = useRef<HTMLAudioElement>(null);
  const [showMatrixRain, setShowMatrixRain] = useState(false);

  const handleLoadingComplete = () => {
    setShowMatrixRain(true);
    try {
      if (budweiserAudioRef.current) {
        budweiserAudioRef.current.play().catch(err => console.log('Budweiser audio play failed:', err));
      }
    } catch (err) {
      console.log('Budweiser audio play failed:', err);
    }

  };

  useEffect(() => {
    handleLoadingComplete();
  }, []);

  return (
    <div className="min-h-screen">
      {showMatrixRain && <MatrixRain />}

      <DancingBaby />
      <Clippy />
      {/* <PopupHint /> */}

      <Header />
      <Marquee />
      <HitCounter />

      <div className="grid grid-cols-1 md:grid-cols-[330px_1fr_330px] gap-[20px] md:p-5 p-1.5 max-w-[1500px] mx-auto">
        <LeftSidebar />
        <MainContent />
        <RightSidebar />
      </div>

      <Footer />
      <audio ref={budweiserAudioRef} src="/budweiser_wassup.mp3" />
    </div>
  );
}

export default App;

// Standalone Games page
function GamesPage() {
  const navigate = useNavigate();
  use90sFeatures();

  return (
    <div className="min-h-screen">
      <Games onBack={() => navigate('/main')} />
    </div>
  );
}


