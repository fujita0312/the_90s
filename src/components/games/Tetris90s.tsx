import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface Tetris90sProps {
    onBack: () => void;
}

type Cell = number | string; // 0 for empty, or a Tailwind color class string

type Piece = {
    type: string;
    shape: number[][];
    color: string;
};

const Tetris90s: React.FC<Tetris90sProps> = ({ onBack }) => {
    const BOARD_WIDTH = 10;
    const BOARD_HEIGHT = 20;
    const EMPTY_CELL: Cell = 0;

    const PIECES = useMemo(() => ({
        I: { shape: [[1, 1, 1, 1]], color: 'bg-cyan-400' },
        O: { shape: [[1, 1], [1, 1]], color: 'bg-yellow-400' },
        T: { shape: [[0, 1, 0], [1, 1, 1]], color: 'bg-purple-400' },
        S: { shape: [[0, 1, 1], [1, 1, 0]], color: 'bg-green-400' },
        Z: { shape: [[1, 1, 0], [0, 1, 1]], color: 'bg-red-400' },
        J: { shape: [[1, 0, 0], [1, 1, 1]], color: 'bg-blue-400' },
        L: { shape: [[0, 0, 1], [1, 1, 1]], color: 'bg-orange-400' }
    }), []);

    const [board, setBoard] = useState<Cell[][]>(() =>
        Array(BOARD_HEIGHT).fill(0).map(() => Array(BOARD_WIDTH).fill(EMPTY_CELL))
    );
    const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
    const [currentPosition, setCurrentPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [nextPiece, setNextPiece] = useState<Piece | null>(null);
    const [score, setScore] = useState<number>(0);
    const [level, setLevel] = useState<number>(1);
    const [lines, setLines] = useState<number>(0);
    const [gameOver, setGameOver] = useState<boolean>(false);
    const [gameStarted, setGameStarted] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [dropTime, setDropTime] = useState<number>(1000);

    const boardRef = useRef<HTMLDivElement | null>(null);
    const touchStartXRef = useRef<number>(0);
    const touchStartYRef = useRef<number>(0);
    const touchStartTimeRef = useRef<number>(0);
    const longPressTimerRef = useRef<number | null>(null);
    const movedRef = useRef<boolean>(false);
    const lastMoveAtRef = useRef<number>(0);

    const SWIPE_THRESHOLD = 24; // px
    const MOVE_COOLDOWN_MS = 120; // ms between repeated swipes
    const LONG_PRESS_MS = 450; // ms to trigger hard drop when touching lower half

    const generatePiece = useCallback((): Piece => {
        const pieceTypes = Object.keys(PIECES) as Array<keyof typeof PIECES>;
        const randomType = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
        const base = PIECES[randomType];
        return { type: String(randomType), shape: base.shape, color: base.color };
    }, [PIECES]);

    const rotatePiece = (piece: Piece): Piece => {
        const rotated = piece.shape[0].map((_, index) => piece.shape.map(row => row[index]).reverse());
        return { ...piece, shape: rotated };
    };

    const isValidPosition = useCallback((piece: Piece, position: { x: number; y: number }, testBoard: Cell[][] = board) => {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const newX = position.x + x;
                    const newY = position.y + y;

                    if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
                        return false;
                    }

                    if (newY >= 0 && testBoard[newY][newX] !== EMPTY_CELL) {
                        return false;
                    }
                }
            }
        }
        return true;
    }, [board]);

    const placePiece = useCallback((piece: Piece, position: { x: number; y: number }, targetBoard: Cell[][]) => {
        const newBoard = targetBoard.map(row => [...row]);
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const boardY = position.y + y;
                    const boardX = position.x + x;
                    if (boardY >= 0) {
                        newBoard[boardY][boardX] = piece.color;
                    }
                }
            }
        }
        return newBoard;
    }, []);

    const clearLines = useCallback((gameBoard: Cell[][]) => {
        const newBoard = gameBoard.filter(row => row.some(cell => cell === EMPTY_CELL));
        const linesCleared = BOARD_HEIGHT - newBoard.length;
        while (newBoard.length < BOARD_HEIGHT) {
            newBoard.unshift(Array(BOARD_WIDTH).fill(EMPTY_CELL));
        }
        return { board: newBoard, linesCleared };
    }, []);

    const spawnPiece = useCallback(() => {
        const piece = nextPiece || generatePiece();
        const startPosition = { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 };
        if (!isValidPosition(piece, startPosition)) {
            setGameOver(true);
            return;
        }
        setCurrentPiece(piece);
        setCurrentPosition(startPosition);
        setNextPiece(generatePiece());
    }, [nextPiece, generatePiece, isValidPosition]);

    const movePiece = useCallback((direction: 'left' | 'right' | 'down') => {
        if (!currentPiece || gameOver || isPaused) return;
        let newPosition = { ...currentPosition };
        switch (direction) {
            case 'left': newPosition.x -= 1; break;
            case 'right': newPosition.x += 1; break;
            case 'down': newPosition.y += 1; break;
        }
        if (isValidPosition(currentPiece, newPosition)) {
            setCurrentPosition(newPosition);
        } else if (direction === 'down') {
            const newBoard = placePiece(currentPiece, currentPosition, board);
            const { board: clearedBoard, linesCleared } = clearLines(newBoard);
            setBoard(clearedBoard);
            setLines(prev => prev + linesCleared);
            setScore(prev => prev + (linesCleared * 100 * level) + 10);
            if (lines + linesCleared >= level * 10) {
                setLevel(prev => prev + 1);
                setDropTime(prev => Math.max(100, prev - 100));
            }
            spawnPiece();
        }
    }, [currentPiece, currentPosition, gameOver, isPaused, isValidPosition, placePiece, board, clearLines, lines, level, spawnPiece]);

    const rotatePieceHandler = useCallback(() => {
        if (!currentPiece || gameOver || isPaused) return;
        const rotated = rotatePiece(currentPiece);
        if (isValidPosition(rotated, currentPosition)) {
            setCurrentPiece(rotated);
        }
    }, [currentPiece, currentPosition, gameOver, isPaused, isValidPosition]);

    const hardDrop = useCallback(() => {
        if (!currentPiece || gameOver || isPaused) return;
        let newPosition = { ...currentPosition };
        while (isValidPosition(currentPiece, { ...newPosition, y: newPosition.y + 1 })) {
            newPosition.y += 1;
        }
        setCurrentPosition(newPosition);
        movePiece('down');
    }, [currentPiece, currentPosition, gameOver, isPaused, isValidPosition, movePiece]);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (!gameStarted || gameOver) return;
            switch (e.key) {
                case 'ArrowLeft': e.preventDefault(); movePiece('left'); break;
                case 'ArrowRight': e.preventDefault(); movePiece('right'); break;
                case 'ArrowDown': e.preventDefault(); movePiece('down'); break;
                case 'ArrowUp': e.preventDefault(); rotatePieceHandler(); break;
                case ' ': e.preventDefault(); hardDrop(); break;
                case 'p':
                case 'P': e.preventDefault(); setIsPaused(prev => !prev); break;
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [gameStarted, gameOver, movePiece, rotatePieceHandler, hardDrop]);

    useEffect(() => {
        if (!gameStarted || gameOver || isPaused) return;
        const interval = window.setInterval(() => {
            movePiece('down');
        }, dropTime);
        return () => window.clearInterval(interval);
    }, [gameStarted, gameOver, isPaused, dropTime, movePiece]);

    // Touch gesture handlers for mobile
    const clearLongPressTimer = () => {
        if (longPressTimerRef.current) {
            window.clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (!gameStarted || gameOver) return;
        const touch = e.touches[0];
        touchStartXRef.current = touch.clientX;
        touchStartYRef.current = touch.clientY;
        touchStartTimeRef.current = Date.now();
        movedRef.current = false;

        // Schedule long press for hard drop if pressed in lower half of the board
        const boardEl = boardRef.current;
        if (boardEl) {
            const rect = boardEl.getBoundingClientRect();
            const inLowerHalf = touch.clientY > rect.top + rect.height / 2;
            clearLongPressTimer();
            longPressTimerRef.current = window.setTimeout(() => {
                if (!movedRef.current && inLowerHalf) {
                    hardDrop();
                }
            }, LONG_PRESS_MS);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!gameStarted || gameOver) return;
        const touch = e.touches[0];
        const dx = touch.clientX - touchStartXRef.current;
        const dy = touch.clientY - touchStartYRef.current;
        const now = Date.now();

        // Prevent scrolling when interacting with the board
        if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
            e.preventDefault();
        }

        // Horizontal swipe to move
        if (Math.abs(dx) > SWIPE_THRESHOLD && now - lastMoveAtRef.current > MOVE_COOLDOWN_MS) {
            if (dx > 0) {
                movePiece('right');
            } else {
                movePiece('left');
            }
            lastMoveAtRef.current = now;
            movedRef.current = true;
            touchStartXRef.current = touch.clientX; // reset origin to allow repeated swipes
        }

        // Vertical swipe to soft drop
        if (dy > SWIPE_THRESHOLD && now - lastMoveAtRef.current > MOVE_COOLDOWN_MS) {
            movePiece('down');
            lastMoveAtRef.current = now;
            movedRef.current = true;
            touchStartYRef.current = touch.clientY;
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!gameStarted || gameOver) return;
        const elapsed = Date.now() - touchStartTimeRef.current;
        clearLongPressTimer();

        const touch = e.changedTouches[0];
        const dx = Math.abs(touch.clientX - touchStartXRef.current);
        const dy = Math.abs(touch.clientY - touchStartYRef.current);

        // Tap detection: small movement and short time
        if (!movedRef.current && dx < 10 && dy < 10 && elapsed < 250) {
            const boardEl = boardRef.current;
            if (boardEl) {
                const rect = boardEl.getBoundingClientRect();
                const inUpperHalf = touch.clientY < rect.top + rect.height / 2;
                if (inUpperHalf) {
                    rotatePieceHandler();
                } else {
                    // bottom-half quick tap triggers a soft drop for responsiveness
                    movePiece('down');
                }
            }
        }
    };

    const startGame = () => {
        // Reset state synchronously and spawn the first piece against a fresh board
        const freshBoard = Array(BOARD_HEIGHT).fill(0).map(() => Array(BOARD_WIDTH).fill(EMPTY_CELL));
        const firstPiece = generatePiece();
        const startPosition = { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 };

        setGameOver(false);
        setIsPaused(false);
        setScore(0);
        setLevel(1);
        setLines(0);
        setDropTime(1000);
        setBoard(freshBoard);
        setCurrentPosition(startPosition);
        setGameStarted(true);

        if (isValidPosition(firstPiece, startPosition, freshBoard)) {
            setCurrentPiece(firstPiece);
            setNextPiece(generatePiece());
        } else {
            // Extremely unlikely with an empty board, but guard just in case
            setCurrentPiece(null);
            setNextPiece(null);
            setGameOver(true);
        }
    };

    const resetGame = () => {
        setCurrentPiece(null);
        setNextPiece(null);
        setGameOver(false);
        setGameStarted(false);
        setIsPaused(false);
    };

    const renderBoard = () => {
        const displayBoard = board.map(row => [...row]);
        if (currentPiece) {
            for (let y = 0; y < currentPiece.shape.length; y++) {
                for (let x = 0; x < currentPiece.shape[y].length; x++) {
                    if (currentPiece.shape[y][x]) {
                        const boardY = currentPosition.y + y;
                        const boardX = currentPosition.x + x;
                        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
                            displayBoard[boardY][boardX] = currentPiece.color;
                        }
                    }
                }
            }
        }
        return displayBoard.map((row, y) => (
            <div key={y} className="flex">
                {row.map((cell, x) => (
                    <div
                        key={`${y}-${x}`}
                        className={`w-6 h-6 border border-gray-600 ${cell === EMPTY_CELL ? 'bg-gray-900' : String(cell)}`}
                    />
                ))}
            </div>
        ));
    };

    const renderNextPiece = () => {
        if (!nextPiece) return (
            <div className="text-gray-300/70 text-sm">Press Start</div>
        );
        return nextPiece.shape.map((row, y) => (
            <div key={y} className="flex justify-center">
                {row.map((cell, x) => (
                    <div
                        key={`${y}-${x}`}
                        className={`w-4 h-4 border border-gray-600 ${cell ? nextPiece.color : 'bg-transparent border-transparent'}`}
                    />
                ))}
            </div>
        ));
    };


    return (
        <div className="w-full max-w-6xl mx-auto md:space-y-6 space-y-1">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white md:p-6 p-3 border-2 border-purple-400">
                <div className="text-center">
                    <div className="md:text-4xl text-2xl font-bold text-yellow-300">🧩 TETRIS 90s EDITION 🧩</div>
                    <div className="md:text-2xl text-xl font-bold text-cyan-300">✨ BLOCK STACKING MADNESS ✨</div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 md:gap-6 gap-1">
                <div className="lg:col-span-2">
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white border-2 border-gray-700">
                        <div className="md:p-6 p-1 flex justify-center">
                            <div
                                ref={boardRef}
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                                className="relative md:border-2 border-1 border-yellow-400 bg-black p-2 rounded-none touch-pan-y"
                                aria-label="Tetris game board"
                                role="application"
                            >
                                {gameStarted && !gameOver && (
                                    <div className="absolute top-2 left-2 bg-gray-900/70 text-white text-xs md:text-sm px-2 py-1 rounded border border-gray-600">
                                        <div>Score: <span className="font-bold text-yellow-300">{score}</span></div>
                                        <div>Level: <span className="font-bold text-cyan-300">{level}</span></div>
                                    </div>
                                )}
                                {renderBoard()}
                                {!gameStarted && !gameOver && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                                        <div className="text-center space-y-3">
                                            <div className="text-yellow-200 font-bold">Ready to Stack?</div>
                                            <button
                                                onClick={startGame}
                                                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold md:text-xl text-lg md:px-8 px-6 md:py-4 py-3 rounded border-2 border-yellow-300 shadow"
                                            >
                                                START GAME
                                            </button>
                                            <div className="text-xs text-gray-200">Tip: tap top to rotate, swipe to move</div>
                                        </div>
                                    </div>
                                )}
                                {gameOver && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                                        <div className="text-center space-y-3">
                                            <div className="text-2xl font-bold text-red-300">GAME OVER!</div>
                                            <div className="text-white">Score: <span className="font-bold text-yellow-300">{score.toLocaleString()}</span></div>
                                            <div className="text-white">Level: <span className="font-bold text-cyan-300">{level}</span></div>
                                            <button onClick={startGame} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold md:text-xl text-lg md:px-8 px-6 md:py-3 py-2 rounded border-2 border-yellow-300 shadow">PLAY AGAIN</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:hidden bg-gradient-to-br from-gray-900 to-black text-white border-2 border-gray-700 rounded">
                    <div className="p-3 grid grid-cols-3 gap-2 text-center">
                        <button onClick={() => movePiece('left')} disabled={!gameStarted || isPaused || gameOver} className="col-span-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 border border-gray-600 rounded py-3" aria-label="Move Left">⬅️</button>
                        <button onClick={rotatePieceHandler} disabled={!gameStarted || isPaused || gameOver} className="col-span-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 border border-gray-600 rounded py-3" aria-label="Rotate">⟳</button>
                        <button onClick={() => movePiece('right')} disabled={!gameStarted || isPaused || gameOver} className="col-span-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 border border-gray-600 rounded py-3" aria-label="Move Right">➡️</button>
                        <button onClick={() => movePiece('down')} disabled={!gameStarted || isPaused || gameOver} className="col-span-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 border border-gray-600 rounded py-3" aria-label="Soft Drop">⬇️ Drop</button>
                        <button onClick={hardDrop} disabled={!gameStarted || isPaused || gameOver} className="col-span-1 bg-yellow-500 hover:bg-yellow-600 text-black disabled:opacity-40 border border-yellow-400 rounded py-3 font-bold" aria-label="Hard Drop">⚡</button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-green-600 to-teal-600 text-white border-2 border-green-400">
                        <div className="p-4 text-center">
                            <div className="text-xl text-yellow-300 font-bold">NEXT PIECE</div>
                            <div className="flex justify-center mt-2">
                                <div className="">{renderNextPiece()}</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-2 border-orange-400">
                        <div className="p-4 text-center space-y-4">
                            {gameStarted && !gameOver ? (
                                <div className="space-y-4">
                                    <div className="text-lg font-bold">{isPaused ? '⏸️ PAUSED' : '🎮 PLAYING'}</div>
                                    <div className="flex flex-col gap-2">
                                        <button onClick={() => setIsPaused(prev => !prev)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded border-2 border-blue-300">{isPaused ? 'RESUME' : 'PAUSE'}</button>
                                        <button onClick={resetGame} className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded border-2 border-red-300">QUIT</button>
                                    </div>
                                </div>
                            ) : gameOver ? (
                                <div className="space-y-4">
                                    <div className="text-2xl font-bold text-red-300">GAME OVER!</div>
                                    <div className="text-lg">Final Score: {score.toLocaleString()}</div>
                                    <div className="text-lg">Level Reached: {level}</div>
                                    <button onClick={startGame} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-xl px-8 py-4 w-full rounded border-2 border-yellow-300">PLAY AGAIN</button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="text-sm text-white/80">Press START on the board to begin</div>
                                </div>
                            )}
                        </div>
                    </div>


                    <div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-2 border-yellow-400">
                        <div className="p-4">
                            <div className="text-lg text-center font-bold">🎯 CONTROLS</div>
                            <div className="text-sm space-y-1 mt-2">
                                <div>← → Move left/right</div>
                                <div>↓ Soft drop</div>
                                <div>↑ Rotate piece</div>
                                <div>SPACE Hard drop</div>
                                <div>P Pause game</div>
                                <div className="md:hidden text-yellow-200">Touch: Swipe to move/drop, Tap (top half) to rotate, Long press (bottom) to hard drop</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <button onClick={onBack} className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black md:px-4 px-3 md:py-2 py-1 rounded border-2 border-yellow-400 hover:scale-105 transition-all duration-300 font-bold">← Back to Games</button>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white border-2 border-indigo-400">
                <div className="p-4 text-center">
                    <div className="text-2xl text-yellow-300 font-bold">🎮 HOW TO PLAY</div>
                    <div className="text-center space-y-1 mt-2">
                        <div>• Stack falling blocks to create complete horizontal lines</div>
                        <div>• Complete lines disappear and earn you points</div>
                        <div>• Game speeds up as you advance levels</div>
                        <div>• Don't let the blocks reach the top!</div>
                        <div>• Clear multiple lines at once for bonus points</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tetris90s;
