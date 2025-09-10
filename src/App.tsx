import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import LoadingScreen from './components/LoadingScreen';
import Layout from './components/Layout';
import { ToastProvider } from './contexts/ToastContext';
import { GameProvider } from './contexts/GameContext';

// Lazy load heavy components
const MainLayout = lazy(() => import('./components/MainLayout'));
const Games = lazy(() => import('./components/Games'));
const MemesPage = lazy(() => import('./components/MemesPage'));
const Chatroom = lazy(() => import('./components/Chatroom'));

function App() {
  return (
    <ToastProvider>
      <GameProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoadingScreen />} />
            <Route path="/" element={<Layout />}>
              <Route path="main" element={
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div></div>}>
                  <MainLayout />
                </Suspense>
              } />
              <Route path="games" element={<GamesPage />} />
              <Route path="memes" element={
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div></div>}>
                  <MemesPage />
                </Suspense>
              } />
              <Route path="memes/:memeId" element={
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div></div>}>
                  <MemesPage />
                </Suspense>
              } />
              <Route path="chatroom" element={<ChatroomPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </GameProvider>
    </ToastProvider>
  );
}

// Games page component
function GamesPage() {
  return (
    <div className="md:p-2 p-1.5 max-w-6xl mx-auto">
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div></div>}>
        <Games onBack={() => window.history.back()} />
      </Suspense>
    </div>
  );
}

// Chatroom page component
function ChatroomPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div></div>}>
      <Chatroom />
    </Suspense>
  );
}

export default App;


