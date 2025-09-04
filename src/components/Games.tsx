import React, { Suspense, lazy, useMemo, useState } from 'react';

// Lazy-load game components for performance
const TicTacToe = lazy(() => import('./games/TicTacToe'));
const Snake = lazy(() => import('./games/Snake'));
const FamilyFeud = lazy(() => import('./games/FamilyFeud'));
const Tetris90s = lazy(() => import('./games/Tetris90s'));

interface GamesProps {
    onBack: () => void;
}

const Games: React.FC<GamesProps> = ({ onBack }) => {
    const [activeGame, setActiveGame] = useState<string>('menu');
    const [isLoading, setIsLoading] = useState(false);

    const games = useMemo(() => ([
        { id: 'tictactoe', name: 'Tic Tac Toe', icon: '⭕', description: 'Classic X vs O with AI' },
        { id: 'snake', name: 'Snake', icon: '🐍', description: 'Grow by eating food, avoid walls' },
        { id: 'familyfeud', name: 'Family Feud', icon: '👨‍👩‍👧‍👦', description: 'Guess the most popular answers' },
        { id: 'tetris90s', name: 'Tetris (90s)', icon: '🧩', description: 'Stack blocks, clear lines, level up' }
    ]), []);

    const handleGameSelect = (gameId: string) => {
        setIsLoading(true);
        // Small delay for a pleasant transition between menu and game load
        setTimeout(() => {
            setActiveGame(gameId);
            setIsLoading(false);
        }, 250);
    };

    const renderGame = () => {
        if (isLoading) {
            return (
                <div className="text-center py-16" role="status" aria-live="polite">
                    <div className="mx-auto mb-4 h-16 w-16 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin" aria-hidden="true"></div>
                    <div className="text-cyan-400 md:text-xl text-lg font-semibold">Loading game…</div>
                </div>
            );
        }

        switch (activeGame) {
            case 'tictactoe':
                return (
                    <Suspense fallback={
                        <div className="text-center py-16" role="status" aria-live="polite">
                            <div className="mx-auto mb-4 h-16 w-16 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin"></div>
                            <div className="text-cyan-400 md:text-xl text-lg font-semibold">Loading Tic Tac Toe…</div>
                        </div>
                    }>
                        <TicTacToe onBack={() => setActiveGame('menu')} />
                    </Suspense>
                );
            case 'snake':
                return (
                    <Suspense fallback={
                        <div className="text-center py-16" role="status" aria-live="polite">
                            <div className="mx-auto mb-4 h-16 w-16 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin"></div>
                            <div className="text-cyan-400 md:text-xl text-lg font-semibold">Loading Snake…</div>
                        </div>
                    }>
                        <Snake onBack={() => setActiveGame('menu')} />
                    </Suspense>
                );
            case 'familyfeud':
                return (
                    <Suspense fallback={
                        <div className="text-center py-16" role="status" aria-live="polite">
                            <div className="mx-auto mb-4 h-16 w-16 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin"></div>
                            <div className="text-cyan-400 md:text-xl text-lg font-semibold">Loading Family Feud…</div>
                        </div>
                    }>
                        <FamilyFeud onBack={() => setActiveGame('menu')} />
                    </Suspense>
                );
            case 'tetris90s':
                return (
                    <Suspense fallback={
                        <div className="text-center py-16" role="status" aria-live="polite">
                            <div className="mx-auto mb-4 h-16 w-16 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin"></div>
                            <div className="text-cyan-400 md:text-xl text-lg font-semibold">Loading Tetris…</div>
                        </div>
                    }>
                        <Tetris90s onBack={() => setActiveGame('menu')} />
                    </Suspense>
                );
            default:
                return (
                    <div className="mx-auto max-w-6xl text-center">
                        <h1 className="rainbow mb-6 md:text-5xl text-3xl font-impact retro-text-glow tracking-wide">
                            🎮 90s GAMES ARCADE 🎮
                        </h1>
                        <p className="text-gray-300 md:text-base text-sm mb-6">Pick a classic and start playing!</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
                            {games.map((game) => (
                                <button
                                    key={game.id}
                                    onClick={() => handleGameSelect(game.id)}
                                    className="text-left bg-gradient-to-br from-black via-gray-900 to-black md:border-4 border-2 border-cyan-400 border-ridge md:p-6 p-4 rounded-none hover:scale-[1.02] focus:scale-[1.02] transition-transform duration-300 shadow-[0_0_20px_rgba(0,255,255,0.25)] hover:shadow-[0_0_28px_rgba(0,255,255,0.45)] focus:outline-none focus:ring-2 focus:ring-cyan-300 group"
                                    aria-label={`Play ${game.name}`}
                                >
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div className="text-5xl md:text-6xl mb-1 group-hover:scale-110 transition-transform duration-300" aria-hidden="true">{game.icon}</div>
                                        <div>
                                            <h2 className="text-cyan-300 md:text-xl text-lg font-bold group-hover:text-cyan-200 transition-colors duration-300">{game.name}</h2>
                                            <p className="text-white/90 md:text-sm text-xs group-hover:text-white transition-colors duration-300">{game.description}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 text-cyan-300 text-xs md:text-sm opacity-80">
                                        Tap or click to play →
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="text-yellow-400 text-sm mb-2">Optimized for mobile and desktop</div>
                        <div className="text-gray-400 text-xs">🕹️ Relive the golden age of gaming! 🕹️</div>
                    </div>
                );
        }
    };

    return (
        <section id="games-section" className="md:p-6 p-3 relative animate-fade-in" aria-labelledby="games-heading">
            <div className="mx-auto max-w-6xl">
                <div className="mb-4 flex items-center justify-between gap-2">
                    <button
                        onClick={() => activeGame === 'menu' ? onBack() : setActiveGame('menu')}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black md:px-4 px-3 md:py-2 py-1 rounded-none border-2 border-yellow-400 hover:scale-105 transition-all duration-300 font-bold shadow-[0_0_15px_rgba(255,215,0,0.5)] focus:outline-none focus:ring-2 focus:ring-yellow-300"
                        aria-label={activeGame === 'menu' ? 'Go back' : 'Back to games menu'}
                    >
                        ← Back
                    </button>
                </div>

                <div aria-live="polite">
                    {renderGame()}
                </div>
            </div>
        </section>
    );
};

export default Games;
