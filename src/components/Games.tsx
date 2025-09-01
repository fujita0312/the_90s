import React, { useState } from 'react';

// Game components will be imported here
import TicTacToe from './games/TicTacToe';
import Snake from './games/Snake';
import FamilyFeud from './games/FamilyFeud';

interface GamesProps {
    onBack: () => void;
}

const Games: React.FC<GamesProps> = ({ onBack }) => {
    const [activeGame, setActiveGame] = useState<string>('menu');
    const [isLoading, setIsLoading] = useState(false);

    const games = [
        { id: 'tictactoe', name: 'Tic Tac Toe', icon: '⭕', description: 'Classic X vs O game with AI opponent' },
        { id: 'snake', name: 'Snake', icon: '🐍', description: 'Grow your snake by eating food' },
        { id: 'familyfeud', name: 'Family Feud', icon: '👨‍👩‍👧‍👦', description: 'Guess the most popular answers' }
    ];

    const handleGameSelect = (gameId: string) => {
        setIsLoading(true);
        setTimeout(() => {
            setActiveGame(gameId);
            setIsLoading(false);
        }, 300);
    };

    const renderGame = () => {
        if (isLoading) {
            return (
                <div className="text-center py-20">
                    <div className="animate-spin text-6xl mb-4">🎮</div>
                    <div className="text-cyan-400 text-xl">Loading Game...</div>
                </div>
            );
        }

        switch (activeGame) {
            case 'tictactoe':
                return <TicTacToe onBack={() => setActiveGame('menu')} />;
            case 'snake':
                return <Snake onBack={() => setActiveGame('menu')} />;
            case 'familyfeud':
                return <FamilyFeud onBack={() => setActiveGame('menu')} />;
            default:
                return (
                    <div className="text-center">
                        <h3 className="rainbow text-center mb-8 md:text-3xl text-xl animate-pulse">
                            🎮 90s GAMES ARCADE 🎮
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            {games.map((game) => (
                                <div
                                    key={game.id}
                                    onClick={() => handleGameSelect(game.id)}
                                    className="bg-gradient-to-r from-black via-gray-800 to-black md:border-4 border-2 border-cyan-400 border-ridge md:p-6 p-2 cursor-pointer hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,255,255,0.5)] group"
                                >
                                    <div className="text-6xl mb-3 group-hover:scale-110 transition-transform duration-300">{game.icon}</div>
                                    <h4 className="text-cyan-400 text-lg font-bold mb-2 group-hover:text-cyan-300 transition-colors duration-300">{game.name}</h4>
                                    <p className="text-white text-sm group-hover:text-gray-200 transition-colors duration-300">{game.description}</p>
                                    <div className="mt-3 text-cyan-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        Click to play →
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="text-yellow-400 text-sm mb-4">
                            Click on any game to start playing!
                        </div>
                        <div className="text-gray-400 text-xs">
                            🕹️ Relive the golden age of gaming! 🕹️
                        </div>
                    </div>
                );
        }
    };

    return (
        <div id="games-section" className="bg-gradient-to-br from-black/90 via-blue-900/80 to-black/90 md:border-4 border-2 border-yellow-400 border-ridge md:p-4 p-1 shadow-[0_0_25px_rgba(255,255,0,0.3),inset_0_0_25px_rgba(255,255,255,0.1)] relative gradient-border animate-fade-in">
            {/* Back Button */}
            <div className="mb-6">
                <button
                    onClick={() => activeGame === 'menu' ? onBack() : setActiveGame('menu')}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black md:px-4 px-2 md:py-2 py-1 rounded border-2 border-yellow-400 hover:scale-105 transition-all duration-300 font-bold shadow-[0_0_15px_rgba(255,215,0,0.5)]"
                >
                    ← Back
                </button>
            </div>

            {renderGame()}
        </div>
    );
};

export default Games;
