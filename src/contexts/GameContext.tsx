import React, { createContext, useContext, useState, ReactNode } from 'react';

interface GameContextType {
  hideBackgroundElements: boolean;
  handleHideBackgroundElements: (active: boolean) => void;
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
  const [hideBackgroundElements, setHideBackgroundElements] = useState(false);

  const handleHideBackgroundElements = (active: boolean) => {
    setHideBackgroundElements(active);
  };

  return (
    <GameContext.Provider value={{ hideBackgroundElements, handleHideBackgroundElements }}>
      {children}
    </GameContext.Provider>
  );
};
