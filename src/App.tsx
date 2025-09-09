import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoadingScreen from './components/LoadingScreen';
import Layout from './components/Layout';
import MainLayout from './components/MainLayout';
import { ToastProvider } from './contexts/ToastContext';
import { GameProvider } from './contexts/GameContext';
import Games from './components/Games';
import MemesPage from './components/MemesPage';
import Chatroom from './components/Chatroom';

function App() {
  return (
    <ToastProvider>
      <GameProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoadingScreen />} />
            <Route path="/" element={<Layout />}>
              <Route path="main" element={<MainLayout />} />
              <Route path="games" element={<GamesPage />} />
              <Route path="memes" element={<MemesPage />} />
              <Route path="memes/:memeId" element={<MemesPage />} />
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
      <Games onBack={() => window.history.back()} />
    </div>
  );
}

// Chatroom page component
function ChatroomPage() {
  return (
    <Chatroom />
  );
}

export default App;


