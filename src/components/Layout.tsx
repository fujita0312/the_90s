import React, { useRef, useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Marquee from './Marquee';
import HitCounter from './HitCounter';
import Footer from './Footer';
import DancingBaby from './DancingBaby';
import Clippy from './Clippy';
import MatrixRain from './MatrixRain';
// import { use90sFeatures } from '../hooks/use90sFeatures';

interface LayoutProps {
  showSidebars?: boolean;
  showMatrixRain?: boolean;
  showAudio?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  showSidebars = true,
  showMatrixRain = true,
  showAudio = true
}) => {
  const budweiserAudioRef = useRef<HTMLAudioElement>(null);
  const [matrixRainVisible, setMatrixRainVisible] = useState(false);

  useEffect(() => {
    setMatrixRainVisible(true);
    if (showAudio) {
      try {
        if (budweiserAudioRef.current) {
          budweiserAudioRef.current.play().catch(err =>
            console.log('Budweiser audio play failed:', err)
          );
        }
      } catch (err) {
        console.log('Budweiser audio play failed:', err);
      }
    }
  }, []);

  return (
    <div className="min-h-screen">
      {/* Background Effects */}
      {showMatrixRain && matrixRainVisible && <MatrixRain />}

      {/* Interactive Elements */}
      <DancingBaby />
      <Clippy />

      {/* Header with Navigation */}
      <Header />
      <Marquee />


      {/* Main Content Area */}
      <div className="min-h-screen">
        <Outlet />
      </div>

      {/* Footer */}
      <Footer />

      {/* Audio */}
      {showAudio && (
        <audio ref={budweiserAudioRef} src="/budweiser_wassup.mp3" />
      )}

    </div>
  );
};

export default Layout;
