import React, { createContext, useContext, useState, ReactNode } from 'react';

interface GameContextType {
  isGameActive: boolean;
  setGameActive: (active: boolean) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [isGameActive, setIsGameActive] = useState(false);

  const setGameActive = (active: boolean) => {
    setIsGameActive(active);
  };

  return (
    <GameContext.Provider value={{ isGameActive, setGameActive }}>
      {children}
    </GameContext.Provider>
  );
};
