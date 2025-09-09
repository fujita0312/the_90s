import React, { useState } from 'react';

interface TicTacToeProps {
    onBack: () => void;
}

const TicTacToe: React.FC<TicTacToeProps> = ({ onBack }) => {
    const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState<string | null>(null);
    const [playerScore, setPlayerScore] = useState(0);
    const [computerScore, setComputerScore] = useState(0);
    const [ties, setTies] = useState(0);
    const [difficulty, setDifficulty] = useState('medium');

    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6] // diagonals
    ];

    const checkWinner = (currentBoard: (string | null)[]): string | null => {
        for (let combination of winningCombinations) {
            const [a, b, c] = combination;
            if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
                return currentBoard[a];
            }
        }
        return currentBoard.includes(null) ? null : 'tie';
    };

    const getAvailableMoves = (currentBoard: (string | null)[]): number[] => {
        return currentBoard.map((cell, index) => cell === null ? index : -1).filter(val => val !== -1);
    };

    const minimax = (currentBoard: (string | null)[], depth: number, isMaximizing: boolean): number => {
        const result = checkWinner(currentBoard);

        if (result === 'O') return 10 - depth;
        if (result === 'X') return depth - 10;
        if (result === 'tie') return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (currentBoard[i] === null) {
                    currentBoard[i] = 'O';
                    const score = minimax(currentBoard, depth + 1, false);
                    currentBoard[i] = null;
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (currentBoard[i] === null) {
                    currentBoard[i] = 'X';
                    const score = minimax(currentBoard, depth + 1, true);
                    currentBoard[i] = null;
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    };

    const getBestMove = (currentBoard: (string | null)[]): number => {
        const availableMoves = getAvailableMoves(currentBoard);

        if (difficulty === 'easy') {
            if (Math.random() < 0.7) {
                return availableMoves[Math.floor(Math.random() * availableMoves.length)];
            }
        } else if (difficulty === 'medium') {
            if (Math.random() < 0.3) {
                return availableMoves[Math.floor(Math.random() * availableMoves.length)];
            }
        }

        let bestScore = -Infinity;
        let bestMove = availableMoves[0];

        for (let move of availableMoves) {
            currentBoard[move] = 'O';
            const score = minimax(currentBoard, 0, false);
            currentBoard[move] = null;

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    };

    const handleCellClick = (index: number) => {
        if (board[index] || !isPlayerTurn || gameOver) return;

        const newBoard = [...board];
        newBoard[index] = 'X';
        setBoard(newBoard);
        setIsPlayerTurn(false);

        const result = checkWinner(newBoard);
        if (result) {
            handleGameEnd(result);
            return;
        }

        setTimeout(() => {
            const computerMove = getBestMove(newBoard);
            const finalBoard = [...newBoard];
            finalBoard[computerMove] = 'O';
            setBoard(finalBoard);
            setIsPlayerTurn(true);

            const finalResult = checkWinner(finalBoard);
            if (finalResult) {
                handleGameEnd(finalResult);
            }
        }, 500);
    };

    const handleGameEnd = (result: string) => {
        setGameOver(true);
        if (result === 'X') {
            setWinner('Player');
            setPlayerScore(prev => prev + 1);
        } else if (result === 'O') {
            setWinner('Computer');
            setComputerScore(prev => prev + 1);
        } else {
            setWinner('Tie');
            setTies(prev => prev + 1);
        }
    };

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setIsPlayerTurn(true);
        setGameOver(false);
        setWinner(null);
    };

    const resetScores = () => {
        setPlayerScore(0);
        setComputerScore(0);
        setTies(0);
    };

    const renderCell = (index: number) => {
        const value = board[index];
        return (
            <button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={gameOver || !isPlayerTurn || value !== null}
                className={`w-20 h-20 md:w-[100px] md:h-[100px] border-2 border-cyan-400 text-2xl md:text-3xl font-bold transition-all duration-300 bg-black/40 hover:bg-cyan-900/30 ${value === 'X'
                    ? 'text-red-400 bg-red-900/30 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                    : value === 'O'
                        ? 'text-blue-400 bg-blue-900/30 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                        : 'text-white hover:scale-105 hover:shadow-[0_0_20px_rgba(34,211,238,0.5)]'
                    } ${gameOver || !isPlayerTurn || value !== null ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
                {value}
            </button>
        );
    };

    return (
        <div className="text-center">
            <div className="flex justify-center items-center mb-6">
                {/* <button
                    onClick={onBack}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-4 py-2 rounded border-2 border-yellow-400 hover:scale-105 transition-all duration-300 font-bold shadow-[0_0_15px_rgba(255,215,0,0.5)]"
                >
                    ← Back to Games
                </button> */}
                <h2 className="rainbow text-2xl font-bold">⭕ Tic Tac Toe ⭕</h2>
                {/* <div></div> */}
            </div>

            <div className="bg-black/60 md:p-5 p-2 md:border-2 border border-[#00ff00] md:my-6 my-4">
                <div className="text-[#00ff00] text-center mb-4 font-bold md:text-lg text-base">
                    GAME STATISTICS
                </div>
                <div className="grid grid-cols-3 gap-2 md:gap-4">
                    <div className="text-center">
                        <div className="text-red-400 font-bold text-sm md:text-base">Player (X)</div>
                        <div className="text-white text-lg md:text-xl">{playerScore}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-[#00ff00] font-bold text-sm md:text-base">Ties</div>
                        <div className="text-white text-lg md:text-xl">{ties}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-blue-400 font-bold text-sm md:text-base">Computer (O)</div>
                        <div className="text-white text-lg md:text-xl">{computerScore}</div>
                    </div>
                </div>
            </div>

            <div className="bg-black/60 md:p-5 p-2 md:border-2 border border-cyan-400 md:my-6 my-4">
                <div className="text-cyan-400 text-center mb-4 font-bold md:text-lg text-base">
                    GAME DIFFICULTY
                </div>
                <div className="text-center">
                    <label className="text-cyan-400 font-bold text-sm md:text-base mr-2 md:mr-3">Select Level:</label>
                    <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="bg-black border-2 border-cyan-400 text-white px-2 md:px-3 py-1 rounded ml-1 md:ml-2 text-sm md:text-base"
                    >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>
            </div>

            {!gameOver && (
                <div className="text-center my-4 md:my-6">
                    <div className="animate-blink text-lg md:text-2xl text-yellow-400">
                        {isPlayerTurn ? "⚡ YOUR TURN (X) ⚡" : "🤖 COMPUTER THINKING..."}
                    </div>
                </div>
            )}

            <div className="flex justify-center mb-6">
                <div className="relative bg-black/20 p-3 md:p-4 rounded-lg border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.3)]">
                    <div className="grid grid-cols-3 gap-2 md:gap-3">
                        {board.map((_, index) => renderCell(index))}
                    </div>
                    {gameOver && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                            <div className="text-center space-y-3">
                                <div className="text-2xl font-bold text-yellow-300">
                                    {winner === 'Tie' ? "It's a Tie! 🤝" : `${winner} Wins! 🎉`}
                                </div>
                                <div className="space-x-3">
                                    <button
                                        onClick={resetGame}
                                        className="bg-gradient-to-r from-green-500 to-blue-500 text-white md:px-6 px-3 md:py-2 py-1 rounded border-2 border-green-400 hover:scale-105 transition-all duration-300 shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                                    >
                                        Play Again
                                    </button>
                                    <button
                                        onClick={resetScores}
                                        className="bg-gradient-to-r from-orange-500 to-red-500 text-white md:px-6 px-3 md:py-2 py-1 rounded border-2 border-orange-400 hover:scale-105 transition-all duration-300 shadow-[0_0_15px_rgba(249,115,22,0.5)]"
                                    >
                                        Reset Scores
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>


            {!gameOver && (
                <div className="text-xs md:text-sm text-gray-400 text-center px-2">
                    {isPlayerTurn ? "Click any empty cell to make your move" : "Computer is thinking..."}
                </div>
            )}

            <div className="flex justify-center my-5">
                <button onClick={onBack} className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black md:px-4 px-3 md:py-2 py-1 border-2 border-yellow-400 hover:scale-105 transition-all duration-300 font-bold">← Back to Games</button>
            </div>

        </div>
    );
};

export default TicTacToe;
