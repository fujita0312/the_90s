import React, { useState, useEffect, useCallback } from 'react';

interface SnakeProps {
    onBack: () => void;
}

interface Position {
    x: number;
    y: number;
}

const Snake: React.FC<SnakeProps> = ({ onBack }) => {
    const BOARD_SIZE = 20;
    const INITIAL_SNAKE: Position[] = [{ x: 10, y: 10 }];
    const INITIAL_FOOD: Position = { x: 15, y: 15 };
    const INITIAL_DIRECTION: Position = { x: 0, y: -1 };

    const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
    const [food, setFood] = useState<Position>(INITIAL_FOOD);
    const [direction, setDirection] = useState<Position>(INITIAL_DIRECTION);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [showMobileControls, setShowMobileControls] = useState(false);
    const [cellSize, setCellSize] = useState<number>(16); // px

    useEffect(() => {
        const checkMobile = () => {
            setShowMobileControls(window.innerWidth <= 768);
            // Responsive cell size: slightly larger on desktop
            const width = window.innerWidth;
            if (width >= 1440) setCellSize(24); // XL desktops
            else if (width >= 1200) setCellSize(22);
            else if (width >= 1024) setCellSize(20);
            else if (width >= 768) setCellSize(18);
            else setCellSize(16);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const generateFood = useCallback((currentSnake: Position[]): Position => {
        // Try up to N times to find an empty cell
        for (let attempt = 0; attempt < 200; attempt++) {
            const candidate: Position = {
                x: Math.floor(Math.random() * BOARD_SIZE),
                y: Math.floor(Math.random() * BOARD_SIZE)
            };
            const occupied = currentSnake.some(segment => segment.x === candidate.x && segment.y === candidate.y);
            if (!occupied) return candidate;
        }
        // Fallback: scan board for first free cell
        for (let y = 0; y < BOARD_SIZE; y++) {
            for (let x = 0; x < BOARD_SIZE; x++) {
                if (!currentSnake.some(s => s.x === x && s.y === y)) {
                    return { x, y };
                }
            }
        }
        return { x: 0, y: 0 };
    }, []);

    const resetGame = () => {
        setSnake(INITIAL_SNAKE);
        setFood(INITIAL_FOOD);
        setDirection(INITIAL_DIRECTION);
        setGameOver(false);
        setScore(0);
        setGameStarted(false);
        setIsPaused(false);
    };

    const startGame = () => {
        setGameStarted(true);
        setIsPaused(false);
        setGameOver(false);
        if (food.x === INITIAL_SNAKE[0].x && food.y === INITIAL_SNAKE[0].y) {
            setFood(generateFood(INITIAL_SNAKE));
        }
    };

    const togglePause = useCallback(() => {
        setIsPaused(prev => !prev);
    }, []);

    const handleMobileDirection = useCallback((newDirection: Position) => {
        if (!gameStarted || gameOver) return;
        if (newDirection.x !== 0 && direction.x !== 0) return;
        if (newDirection.y !== 0 && direction.y !== 0) return;
        setDirection(newDirection);
    }, [direction, gameOver, gameStarted]);

    const moveSnake = useCallback(() => {
        if (gameOver || !gameStarted || isPaused) return;
        setSnake(currentSnake => {
            const newSnake = [...currentSnake];
            const head = { ...newSnake[0] };
            head.x += direction.x;
            head.y += direction.y;
            if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
                setGameOver(true);
                return currentSnake;
            }
            if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
                setGameOver(true);
                return currentSnake;
            }
            newSnake.unshift(head);
            if (head.x === food.x && head.y === food.y) {
                setScore(prevScore => prevScore + 10);
                setFood(generateFood(newSnake));
            } else {
                newSnake.pop();
            }
            return newSnake;
        });
    }, [direction, food, gameOver, gameStarted, isPaused, generateFood]);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (!gameStarted || gameOver) return;
            switch (e.key) {
                case 'ArrowUp': e.preventDefault(); setDirection(prev => prev.y !== 1 ? { x: 0, y: -1 } : prev); break;
                case 'ArrowDown': e.preventDefault(); setDirection(prev => prev.y !== -1 ? { x: 0, y: 1 } : prev); break;
                case 'ArrowLeft': e.preventDefault(); setDirection(prev => prev.x !== 1 ? { x: -1, y: 0 } : prev); break;
                case 'ArrowRight': e.preventDefault(); setDirection(prev => prev.x !== -1 ? { x: 1, y: 0 } : prev); break;
                case ' ': e.preventDefault(); togglePause(); break;
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [gameStarted, gameOver, togglePause]);

    useEffect(() => {
        if (!showMobileControls || !gameStarted || gameOver) return;
        let startX = 0; let startY = 0; let endX = 0; let endY = 0;
        const handleTouchStart = (e: Event) => {
            const touchEvent = e as TouchEvent;
            startX = touchEvent.touches[0].clientX;
            startY = touchEvent.touches[0].clientY;
        };
        const handleTouchEnd = (e: Event) => {
            const touchEvent = e as TouchEvent;
            endX = touchEvent.changedTouches[0].clientX;
            endY = touchEvent.changedTouches[0].clientY;
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const minSwipeDistance = 30;
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (Math.abs(deltaX) > minSwipeDistance) {
                    handleMobileDirection({ x: deltaX > 0 ? 1 : -1, y: 0 });
                }
            } else {
                if (Math.abs(deltaY) > minSwipeDistance) {
                    handleMobileDirection({ x: 0, y: deltaY > 0 ? 1 : -1 });
                }
            }
        };
        const gameBoard = document.querySelector('[data-game-board]');
        if (gameBoard) {
            gameBoard.addEventListener('touchstart', handleTouchStart, { passive: true });
            gameBoard.addEventListener('touchend', handleTouchEnd, { passive: true });
        }
        return () => {
            if (gameBoard) {
                gameBoard.removeEventListener('touchstart', handleTouchStart);
                gameBoard.removeEventListener('touchend', handleTouchEnd);
            }
        };
    }, [showMobileControls, gameStarted, gameOver, handleMobileDirection]);

    useEffect(() => {
        if (!gameStarted || gameOver || isPaused) return;
        const interval = setInterval(moveSnake, 300);
        return () => clearInterval(interval);
    }, [gameStarted, gameOver, isPaused, moveSnake]);

    const renderCell = (x: number, y: number) => {
        const isSnakeHead = snake[0]?.x === x && snake[0]?.y === y;
        const isSnakeBody = snake.slice(1).some(segment => segment.x === x && segment.y === y);
        const isFood = food.x === x && food.y === y;
        let baseClass = 'border border-gray-700';
        if (isSnakeHead) baseClass += ' bg-green-400 rounded-full';
        else if (isSnakeBody) baseClass += ' bg-green-600';
        else if (isFood) baseClass += ' bg-red-500 rounded-full animate-pulse';
        else baseClass += ' bg-gray-800';
        return <div key={`${x}-${y}`} className={baseClass} style={{ width: cellSize, height: cellSize }} />;
    };

    return (
        <div className="text-center">
            <div className="flex justify-center items-center mb-6">
                {/* <button onClick={onBack} className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black md:px-4 md:py-2 px-2 py-1 rounded border-2 border-yellow-400 hover:scale-105 transition-all duration-300 font-bold shadow-[0_0_15px_rgba(255,215,0,0.5)]">← Back to Games</button> */}
                <h2 className="rainbow text-2xl font-bold">🐍 Snake Game 🐍</h2>
            </div>

            <div className="bg-black/60 md:p-5 p-2 md:border-2 border border-[#00ff00] md:my-6 my-4">
                <div className="text-[#00ff00] text-center mb-4 font-bold md:text-lg text-base">GAME STATISTICS</div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center"><div className="text-green-400 font-bold">Score</div><div className="text-white text-xl">{score}</div></div>
                    <div className="text-center"><div className="text-blue-400 font-bold">Length</div><div className="text-white text-xl">{snake.length}</div></div>
                    <div className="text-center"><div className="text-[#00ff00] font-bold">Status</div><div className="text-white text-sm">{!gameStarted ? 'Ready' : gameOver ? 'Game Over' : isPaused ? 'Paused' : 'Playing'}</div></div>
                </div>
            </div>

            {gameStarted && !gameOver && (
                <div className="mb-6">
                    <button onClick={togglePause} className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-2 rounded border-2 border-yellow-400 hover:scale-105 transition-transform duration-200 mr-3">{isPaused ? 'Resume' : 'Pause'}</button>
                    <button onClick={resetGame} className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-2 rounded border-2 border-red-400 hover:scale-105 transition-transform duration-200">Reset</button>
                </div>
            )}

            <div className="flex justify-center mb-6">
                <div className="relative md:border-3 border-2 border-green-400 bg-gray-900 p-2 rounded-none">
                    {gameStarted && !gameOver && (
                        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded border border-green-400/40">
                            <div>Score: <span className="font-bold text-green-300">{score}</span></div>
                            <div>Length: <span className="font-bold text-cyan-300">{snake.length}</span></div>
                        </div>
                    )}
                    <div data-game-board className="grid gap-0" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, ${cellSize}px)` }}>
                        {Array.from({ length: BOARD_SIZE }, (_, y) => Array.from({ length: BOARD_SIZE }, (_, x) => renderCell(x, y)))}
                    </div>
                    {!gameStarted && !gameOver && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                            <div className="text-center space-y-3">
                                <div className="text-yellow-200 font-bold">Ready to Slither?</div>
                                <button onClick={startGame} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold md:text-xl text-lg md:px-8 px-6 md:py-4 py-3 rounded border-2 border-yellow-300 shadow">START GAME</button>
                            </div>
                        </div>
                    )}
                    {gameOver && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                            <div className="text-center space-y-3">
                                <div className="text-2xl font-bold text-red-300">GAME OVER!</div>
                                <div className="text-white">Score: <span className="font-bold text-yellow-300">{score}</span></div>
                                <div className="text-white">Length: <span className="font-bold text-cyan-300">{snake.length}</span></div>
                                <button onClick={resetGame} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold md:text-xl text-lg md:px-8 px-6 md:py-3 py-2 rounded border-2 border-yellow-300 shadow">PLAY AGAIN</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showMobileControls && (
                <div className="mb-6">
                    {/* <div className="text-center mb-3"><div className="text-cyan-400 text-sm font-bold">MOBILE CONTROLS</div></div> */}
                    <div className="flex justify-center">
                        <div className="grid grid-cols-3 gap-2 max-w-xs">
                            <div className="col-start-2"><button onClick={() => handleMobileDirection({ x: 0, y: -1 })} className="w-16 h-16 bg-gradient-to-b from-cyan-500 to-blue-600 border-2 border-cyan-400 rounded-t-lg hover:scale-105 transition-all duration-200 shadow-[0_0_15px_rgba(0,255,255,0.5)]"><span className="text-2xl">⬆️</span></button></div>
                            <div className="col-start-1 row-start-2"><button onClick={() => handleMobileDirection({ x: -1, y: 0 })} className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 border-2 border-cyan-400 rounded-l-lg hover:scale-105 transition-all duration-200 shadow-[0_0_15px_rgba(0,255,255,0.5)]"><span className="text-2xl">⬅️</span></button></div>
                            <div className="col-start-2 row-start-2"><button onClick={togglePause} className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 border-2 border-yellow-400 rounded-lg hover:scale-105 transition-all duration-200 shadow-[0_0_15px_rgba(255,215,0,0.5)]"><span className="text-lg font-bold text-black">{isPaused ? '▶️' : '⏸️'}</span></button></div>
                            <div className="col-start-3 row-start-2"><button onClick={() => handleMobileDirection({ x: 1, y: 0 })} className="w-16 h-16 bg-gradient-to-l from-cyan-500 to-blue-600 border-2 border-cyan-400 rounded-r-lg hover:scale-105 transition-all duration-200 shadow-[0_0_15px_rgba(0,255,255,0.5)]"><span className="text-2xl">➡️</span></button></div>
                            <div className="col-start-2 row-start-3"><button onClick={() => handleMobileDirection({ x: 0, y: 1 })} className="w-16 h-16 bg-gradient-to-t from-cyan-500 to-blue-600 border-2 border-cyan-400 rounded-b-lg hover:scale-105 transition-all duration-200 shadow-[0_0_15px_rgba(0,255,255,0.5)]"><span className="text-2xl">⬇️</span></button></div>
                        </div>
                    </div>
                </div>
            )}

            <div className="text-xs md:text-sm text-gray-400 space-y-1 md:space-y-2 text-center px-2">
                <div>Use arrow keys to control the snake</div>
                <div>Eat the red food to grow and score points</div>
                <div>Don't hit the walls or yourself!</div>
                <div>Press SPACE to pause/resume</div>
                {showMobileControls && (<><div className="text-cyan-400 font-bold mt-2">📱 MOBILE: Use the control pad above!</div></>)}
            </div>
        </div>
    );
};

export default Snake;
