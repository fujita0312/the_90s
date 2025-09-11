import React, { Suspense, lazy, useMemo, useState, useEffect } from 'react';
import { useGameContext } from '../contexts/GameContext';
import { gameApi } from '../services/gameApi';

// Lazy-load game components for performance
const TicTacToe = lazy(() => import('./games/TicTacToe'));
const Snake = lazy(() => import('./games/Snake'));
const FamilyFeud = lazy(() => import('./games/FamilyFeud'));
const Tetris90s = lazy(() => import('./games/Tetris90s'));
const DuckHunt = lazy(() => import('./games/DuckHunt'));
const Mario = lazy(() => import('./games/Mario'));
const Contra = lazy(() => import('./games/Contra'));
const Jackal = lazy(() => import('./games/Jackal'));
// const EasterEgg = lazy(() => import('./games/EasterEgg'));

interface GamesProps {
    onBack: () => void;
}

const Games: React.FC<GamesProps> = ({ onBack }) => {
    const [activeGame, setActiveGame] = useState<string>('menu');
    const [isLoading, setIsLoading] = useState(false);
    const { handleHideBackgroundElements } = useGameContext();
    const [visitCounts, setVisitCounts] = useState<Record<string, number>>({});

    // Global keyboard handler to prevent page scrolling during gameplay
    useEffect(() => {
        const handleGlobalKeyPress = (e: KeyboardEvent) => {
            // Only prevent default for games that are active (not menu)
            if (activeGame !== 'menu') {
                // List of keys that commonly cause page scrolling or unwanted behavior
                const problematicKeys = [
                    ' ', // Spacebar - causes page scroll
                    'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', // Arrow keys - can cause scrolling
                    'PageUp', 'PageDown', 'Home', 'End', // Page navigation
                    'Tab' // Tab navigation (but we'll be more selective)
                ];

                // For iframe games (DuckHunt, Mario, Contra, Jackal), only prevent spacebar
                if (activeGame === 'duckhunt' || activeGame === 'mario' || activeGame === 'contra' || activeGame === 'jackal') {
                    if (e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                } else {
                    // For other games, prevent all problematic keys
                    if (problematicKeys.includes(e.key)) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }
            }
        };

        // Add event listener with capture to intercept before other handlers
        window.addEventListener('keydown', handleGlobalKeyPress, { capture: true });

        return () => {
            window.removeEventListener('keydown', handleGlobalKeyPress, { capture: true });
        };
    }, [activeGame]);

    // Update game state when activeGame changes
    useEffect(() => {
        handleHideBackgroundElements(activeGame !== 'menu');
    }, [activeGame, handleHideBackgroundElements]);

    // Load visit counts on mount
    useEffect(() => {
        const fetchVisits = async () => {
            try {
                const res: any = await gameApi.getAllVisits();
                if (res && res.success && Array.isArray(res.data)) {
                    const counts: Record<string, number> = {};
                    for (const item of res.data) {
                        if (item && item.gameId) counts[item.gameId] = item.count || 0;
                    }
                    setVisitCounts(counts);
                }
            } catch (e) {
                // noop
            }
        };
        fetchVisits();
    }, []);

    const games = useMemo(() => ([
        { id: 'tictactoe', name: 'Tic Tac Toe', icon: '⭕', description: 'Classic X vs O with AI' },
        { id: 'snake', name: 'Snake', icon: '🐍', description: 'Grow by eating food, avoid walls' },
        { id: 'familyfeud', name: 'Family Feud', icon: '👨‍👩‍👧‍👦', description: 'Guess the most popular answers' },
        { id: 'tetris90s', name: 'Tetris (90s)', icon: '🧩', description: 'Stack blocks, clear lines, level up' },
        { id: 'duckhunt', name: 'Duck Hunt', icon: '🦆', description: 'Aim, shoot, and beat the clock' },
        { id: 'mario', name: 'Super Mario', icon: '🍄', description: 'Run, jump, and save the day' },
        { id: 'contra', name: 'Contra', icon: '🔫', description: 'Classic run-and-gun action!' },
        { id: 'jackal', name: 'Jackal', icon: '🚗', description: 'Top-down military action!' },
        // { id: 'easteregg', name: 'Easter Egg', icon: '🥚', description: 'Hidden gem surprise' }
    ]), []);

    const handleGameSelect = (gameId: string) => {
        setIsLoading(true);
        // Increment visit count in the backend (fire-and-forget) and optimistically update UI
        (async () => {
            try {
                const res: any = await gameApi.incrementVisit(gameId);
                const newCount = (res?.data?.count as number) ?? ((visitCounts[gameId] || 0) + 1);
                setVisitCounts(prev => ({ ...prev, [gameId]: newCount }));
            } catch {
                setVisitCounts(prev => ({ ...prev, [gameId]: (prev[gameId] || 0) + 1 }));
            }
        })();
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
            case 'duckhunt':
                return (
                    <Suspense fallback={
                        <div className="text-center py-16" role="status" aria-live="polite">
                            <div className="mx-auto mb-4 h-16 w-16 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin"></div>
                            <div className="text-cyan-400 md:text-xl text-lg font-semibold">Loading Duck Hunt…</div>
                        </div>
                    }>
                        <DuckHunt onBack={() => setActiveGame('menu')} />
                    </Suspense>
                );
            case 'mario':
                return (
                    <Suspense fallback={
                        <div className="text-center py-16" role="status" aria-live="polite">
                            <div className="mx-auto mb-4 h-16 w-16 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin"></div>
                            <div className="text-cyan-400 md:text-xl text-lg font-semibold">Loading Mario…</div>
                        </div>
                    }>
                        <Mario onBack={() => setActiveGame('menu')} />
                    </Suspense>
                );
            case 'contra':
                return (
                    <Suspense fallback={
                        <div className="text-center py-16" role="status" aria-live="polite">
                            <div className="mx-auto mb-4 h-16 w-16 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin"></div>
                            <div className="text-cyan-400 md:text-xl text-lg font-semibold">Loading Contra…</div>
                        </div>
                    }>
                        <Contra onBack={() => setActiveGame('menu')} />
                    </Suspense>
                );
            case 'jackal':
                return (
                    <Suspense fallback={
                        <div className="text-center py-16" role="status" aria-live="polite">
                            <div className="mx-auto mb-4 h-16 w-16 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin"></div>
                            <div className="text-cyan-400 md:text-xl text-lg font-semibold">Loading Jackal…</div>
                        </div>
                    }>
                        <Jackal onBack={() => setActiveGame('menu')} />
                    </Suspense>
                );
            // case 'easteregg':
            //     return (
            //         <Suspense fallback={
            //             <div className="text-center py-16" role="status" aria-live="polite">
            //                 <div className="mx-auto mb-4 h-16 w-16 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin"></div>
            //                 <div className="text-cyan-400 md:text-xl text-lg font-semibold">Loading Easter Egg…</div>
            //             </div>
            //         }>
            //             <EasterEgg onBack={() => setActiveGame('menu')} />
            //         </Suspense>
            //     );
            default:
                // Games menu with sorting by visit count
                const sortedGames = [...games].sort((a, b) => (visitCounts[b.id] || 0) - (visitCounts[a.id] || 0));
                return (
                    <div className="mx-auto max-w-6xl text-center">
                        <h1 className="rainbow mb-6 md:text-5xl text-3xl font-impact retro-text-glow tracking-wide">
                            🎮 90s GAMES ARCADE 🎮
                        </h1>
                        <p className="text-gray-300 md:text-base text-sm mb-6">Pick a classic and start playing!</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
                            {sortedGames.map((game) => (
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
                                            <div className="text-cyan-400/90 md:text-xs text-[11px] mt-1">Visits: {visitCounts[game.id] || 0}</div>
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
        <section id="games-section" className="relative animate-fade-in" aria-labelledby="games-heading">
            <div className="mx-auto max-w-6xl">
                {/* <div className="mb-4 flex items-center justify-between gap-2">
                    <button
                        onClick={() => activeGame === 'menu' ? onBack() : setActiveGame('menu')}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black md:px-4 px-3 md:py-2 py-1 rounded-none border-2 border-yellow-400 hover:scale-105 transition-all duration-300 font-bold shadow-[0_0_15px_rgba(255,215,0,0.5)] focus:outline-none focus:ring-2 focus:ring-yellow-300"
                        aria-label={activeGame === 'menu' ? 'Go back' : 'Back to games menu'}
                    >
                        ← Back
                    </button>
                </div> */}

                <div aria-live="polite">
                    {renderGame()}
                </div>
            </div>
        </section>
    );
};

export default Games;
