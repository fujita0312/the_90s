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

    // Check if device is mobile
    useEffect(() => {
        const checkMobile = () => {
            setShowMobileControls(window.innerWidth <= 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const generateFood = useCallback((currentSnake: Position[]): Position => {
        let newFood: Position;
        do {
            newFood = {
                x: Math.floor(Math.random() * BOARD_SIZE),
                y: Math.floor(Math.random() * BOARD_SIZE)
            };
        } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        return newFood;
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
    };

    const togglePause = () => {
        setIsPaused(!isPaused);
    };

    // Mobile control functions
    const handleMobileDirection = (newDirection: Position) => {
        if (!gameStarted || gameOver) return;

        // Prevent reverse direction (same logic as keyboard)
        if (newDirection.x !== 0 && direction.x !== 0) return; // Horizontal movement
        if (newDirection.y !== 0 && direction.y !== 0) return; // Vertical movement

        setDirection(newDirection);
    };

    const moveSnake = useCallback(() => {
        if (gameOver || !gameStarted || isPaused) return;

        setSnake(currentSnake => {
            const newSnake = [...currentSnake];
            const head = { ...newSnake[0] };

            head.x += direction.x;
            head.y += direction.y;

            // Check wall collision
            if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
                setGameOver(true);
                return currentSnake;
            }

            // Check self collision
            if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
                setGameOver(true);
                return currentSnake;
            }

            newSnake.unshift(head);

            // Check food collision
            if (head.x === food.x && head.y === food.y) {
                setScore(prevScore => prevScore + 10);
                setFood(generateFood(newSnake));
            } else {
                newSnake.pop();
            }

            return newSnake;
        });
    }, [direction, food, gameOver, gameStarted, isPaused, generateFood]);

    // Handle keyboard input
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (!gameStarted || gameOver) return;

            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    setDirection(prev => prev.y !== 1 ? { x: 0, y: -1 } : prev);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    setDirection(prev => prev.y !== -1 ? { x: 0, y: 1 } : prev);
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    setDirection(prev => prev.x !== 1 ? { x: -1, y: 0 } : prev);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    setDirection(prev => prev.x !== -1 ? { x: 1, y: 0 } : prev);
                    break;
                case ' ':
                    e.preventDefault();
                    togglePause();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [gameStarted, gameOver]);

    // Handle touch/swipe gestures for mobile
    useEffect(() => {
        if (!showMobileControls || !gameStarted || gameOver) return;

        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;

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
            const minSwipeDistance = 30; // Minimum distance for a swipe

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (Math.abs(deltaX) > minSwipeDistance) {
                    if (deltaX > 0) {
                        handleMobileDirection({ x: 1, y: 0 }); // Right
                    } else {
                        handleMobileDirection({ x: -1, y: 0 }); // Left
                    }
                }
            } else {
                // Vertical swipe
                if (Math.abs(deltaY) > minSwipeDistance) {
                    if (deltaY > 0) {
                        handleMobileDirection({ x: 0, y: 1 }); // Down
                    } else {
                        handleMobileDirection({ x: 0, y: -1 }); // Up
                    }
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

    // Game loop
    useEffect(() => {
        if (!gameStarted || gameOver || isPaused) return;

        const interval = setInterval(moveSnake, 300);
        return () => clearInterval(interval);
    }, [gameStarted, gameOver, isPaused, moveSnake]);

    const renderCell = (x: number, y: number) => {
        const isSnakeHead = snake[0]?.x === x && snake[0]?.y === y;
        const isSnakeBody = snake.slice(1).some(segment => segment.x === x && segment.y === y);
        const isFood = food.x === x && food.y === y;

        let cellClass = 'w-4 h-4 border border-gray-700';

        if (isSnakeHead) {
            cellClass += ' bg-green-400 rounded-full';
        } else if (isSnakeBody) {
            cellClass += ' bg-green-600';
        } else if (isFood) {
            cellClass += ' bg-red-500 rounded-full animate-pulse';
        } else {
            cellClass += ' bg-gray-800';
        }

        return <div key={`${x}-${y}`} className={cellClass} />;
    };

    return (
        <div className="text-center">
            <div className="flex justify-center items-center mb-6">
                {/* <button
                    onClick={onBack}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black md:px-4 md:py-2 px-2 py-1 rounded border-2 border-yellow-400 hover:scale-105 transition-all duration-300 font-bold shadow-[0_0_15px_rgba(255,215,0,0.5)]"
                >
                    ← Back to Games
                </button> */}
                <h2 className="rainbow text-2xl font-bold">🐍 Snake Game 🐍</h2>
                {/* <div></div> */}
            </div>

            {/* Score and Controls */}
            <div className="bg-black/60 md:p-5 p-2 md:border-2 border border-[#00ff00] md:my-6 my-4">
                <div className="text-[#00ff00] text-center mb-4 font-bold md:text-lg text-base">
                    GAME STATISTICS
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-green-400 font-bold">Score</div>
                        <div className="text-white text-xl">{score}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-blue-400 font-bold">Length</div>
                        <div className="text-white text-xl">{snake.length}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-[#00ff00] font-bold">Status</div>
                        <div className="text-white text-sm">
                            {!gameStarted ? 'Ready' : gameOver ? 'Game Over' : isPaused ? 'Paused' : 'Playing'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Game Controls */}
            {!gameStarted && (
                <div className="mb-6">
                    <button
                        onClick={startGame}
                        className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-3 rounded border-2 border-green-400 hover:scale-105 transition-all duration-300 text-lg font-bold shadow-[0_0_20px_rgba(34,197,94,0.5)] hover:shadow-[0_0_30px_rgba(34,197,94,0.7)]"
                    >
                        Start Game
                    </button>
                </div>
            )}

            {gameStarted && !gameOver && (
                <div className="mb-6">
                    <button
                        onClick={togglePause}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-2 rounded border-2 border-yellow-400 hover:scale-105 transition-transform duration-200 mr-3"
                    >
                        {isPaused ? 'Resume' : 'Pause'}
                    </button>
                    <button
                        onClick={resetGame}
                        className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-2 rounded border-2 border-red-400 hover:scale-105 transition-transform duration-200"
                    >
                        Reset
                    </button>
                </div>
            )}

            {/* Game Over Screen */}
            {gameOver && (
                <div className="animate-bounce text-center bg-gradient-to-r from-yellow-400 to-orange-500 text-black md:p-5 p-2 md:my-8 my-4 border-4 border-red-600 border-ridge font-bold shadow-[0_0_20px_rgba(255,215,0,0.5)] md:text-xl text-lg">
                    <div className="mb-3">
                        Game Over! 💀
                    </div>
                    <div className="mb-3">
                        Final Score: {score} | Snake Length: {snake.length}
                    </div>
                    <button
                        onClick={resetGame}
                        className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded border-2 border-green-400 hover:scale-105 transition-all duration-300 shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                    >
                        Play Again
                    </button>
                </div>
            )}

            {/* Game Board */}
            <div className="flex justify-center mb-6">
                <div
                    data-game-board
                    className="grid gap-0 border-4 border-green-400 bg-gray-900 p-2 rounded"
                    style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1rem)` }}
                >
                    {Array.from({ length: BOARD_SIZE }, (_, y) =>
                        Array.from({ length: BOARD_SIZE }, (_, x) => renderCell(x, y))
                    )}
                </div>
            </div>

            {/* Mobile Controls */}
            {showMobileControls && gameStarted && !gameOver && (
                <div className="mb-6">
                    <div className="text-center mb-3">
                        <div className="text-cyan-400 text-sm font-bold">MOBILE CONTROLS</div>
                    </div>

                    {/* Direction Pad */}
                    <div className="flex justify-center">
                        <div className="grid grid-cols-3 gap-2 max-w-xs">
                            {/* Up Button */}
                            <div className="col-start-2">
                                <button
                                    onClick={() => handleMobileDirection({ x: 0, y: -1 })}
                                    className="w-16 h-16 bg-gradient-to-b from-cyan-500 to-blue-600 border-2 border-cyan-400 rounded-t-lg hover:scale-105 transition-all duration-200 shadow-[0_0_15px_rgba(0,255,255,0.5)]"
                                >
                                    <span className="text-2xl">⬆️</span>
                                </button>
                            </div>

                            {/* Left Button */}
                            <div className="col-start-1 row-start-2">
                                <button
                                    onClick={() => handleMobileDirection({ x: -1, y: 0 })}
                                    className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 border-2 border-cyan-400 rounded-l-lg hover:scale-105 transition-all duration-200 shadow-[0_0_15px_rgba(0,255,255,0.5)]"
                                >
                                    <span className="text-2xl">⬅️</span>
                                </button>
                            </div>

                            {/* Center (Pause) Button */}
                            <div className="col-start-2 row-start-2">
                                <button
                                    onClick={togglePause}
                                    className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 border-2 border-yellow-400 rounded-lg hover:scale-105 transition-all duration-200 shadow-[0_0_15px_rgba(255,215,0,0.5)]"
                                >
                                    <span className="text-lg font-bold text-black">
                                        {isPaused ? '▶️' : '⏸️'}
                                    </span>
                                </button>
                            </div>

                            {/* Right Button */}
                            <div className="col-start-3 row-start-2">
                                <button
                                    onClick={() => handleMobileDirection({ x: 1, y: 0 })}
                                    className="w-16 h-16 bg-gradient-to-l from-cyan-500 to-blue-600 border-2 border-cyan-400 rounded-r-lg hover:scale-105 transition-all duration-200 shadow-[0_0_15px_rgba(0,255,255,0.5)]"
                                >
                                    <span className="text-2xl">➡️</span>
                                </button>
                            </div>

                            {/* Down Button */}
                            <div className="col-start-2 row-start-3">
                                <button
                                    onClick={() => handleMobileDirection({ x: 0, y: 1 })}
                                    className="w-16 h-16 bg-gradient-to-t from-cyan-500 to-blue-600 border-2 border-cyan-400 rounded-b-lg hover:scale-105 transition-all duration-200 shadow-[0_0_15px_rgba(0,255,255,0.5)]"
                                >
                                    <span className="text-2xl">⬇️</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="text-xs md:text-sm text-gray-400 space-y-1 md:space-y-2 text-center px-2">
                <div>Use arrow keys to control the snake</div>
                <div>Eat the red food to grow and score points</div>
                <div>Don't hit the walls or yourself!</div>
                <div>Press SPACE to pause/resume</div>
                {showMobileControls && (
                    <>
                        <div className="text-cyan-400 font-bold mt-2">📱 MOBILE: Use the control pad above!</div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Snake;
