import React, { useState } from 'react';

interface FamilyFeudProps {
    onBack: () => void;
}

interface Answer {
    text: string;
    points: number;
}

interface Question {
    question: string;
    answers: Answer[];
}

const FamilyFeud: React.FC<FamilyFeudProps> = ({ onBack }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [strikes, setStrikes] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [userAnswer, setUserAnswer] = useState('');
    const [revealedAnswers, setRevealedAnswers] = useState<string[]>([]);
    const [showResult, setShowResult] = useState('');

    const questions: Question[] = [
        {
            question: "Name something you might find in a 90s kid's bedroom",
            answers: [
                { text: "Tamagotchi", points: 45 },
                { text: "Beanie Babies", points: 38 },
                { text: "Super Nintendo", points: 32 },
                { text: "Pogs", points: 28 },
                { text: "Lava Lamp", points: 25 },
                { text: "CD Player", points: 20 },
                { text: "Posters of Boy Bands", points: 12 }
            ]
        },
        {
            question: "Name a popular 90s TV show",
            answers: [
                { text: "Friends", points: 50 },
                { text: "Seinfeld", points: 42 },
                { text: "The Fresh Prince of Bel-Air", points: 35 },
                { text: "Full House", points: 30 },
                { text: "Home Improvement", points: 25 },
                { text: "Saved by the Bell", points: 18 },
                { text: "Beverly Hills 90210", points: 15 }
            ]
        }
    ];

    const currentQ = questions[currentQuestion];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userAnswer.trim()) return;

        const normalizedAnswer = userAnswer.toLowerCase().trim();
        const foundAnswer = currentQ.answers.find(answer =>
            answer.text.toLowerCase().includes(normalizedAnswer) ||
            normalizedAnswer.includes(answer.text.toLowerCase())
        );

        if (foundAnswer && !revealedAnswers.includes(foundAnswer.text)) {
            setRevealedAnswers([...revealedAnswers, foundAnswer.text]);
            setScore(score + foundAnswer.points);
            setShowResult(`✓ CORRECT! "${foundAnswer.text}" - ${foundAnswer.points} points!`);
        } else {
            setStrikes(strikes + 1);
            setShowResult(`✗ STRIKE! "${userAnswer}" not on the board!`);
        }

        setUserAnswer('');

        setTimeout(() => {
            setShowResult('');
        }, 2000);
    };

    const nextQuestion = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setRevealedAnswers([]);
            setStrikes(0);
        } else {
            setGameOver(true);
        }
    };

    const resetGame = () => {
        setCurrentQuestion(0);
        setScore(0);
        setStrikes(0);
        setGameOver(false);
        setRevealedAnswers([]);
        setShowResult('');
        setUserAnswer('');
    };

    return (
        <div className="text-center">
            <div className="flex justify-center items-center mb-6">
                {/* <button
                    onClick={onBack}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black md:px-4 px-2 md:py-2 py-1 rounded border-2 border-yellow-400 hover:scale-105 transition-all duration-300 font-bold shadow-[0_0_15px_rgba(255,215,0,0.5)]"
                >
                    ← Back to Games
                </button> */}
                <h2 className="rainbow text-2xl font-bold">👨‍👩‍👧‍👦 Family Feud 👨‍👩‍👧‍👦</h2>
                {/* <div></div> */}
            </div>

            <div className="bg-black/60 md:p-5 p-2 md:border-2 border border-[#00ff00] md:my-6 my-4">
                <div className="text-[#00ff00] text-center mb-4 font-bold md:text-lg text-base">
                    GAME STATISTICS
                </div>
                <div className="grid grid-cols-3 gap-2 md:gap-4">
                    <div className="text-center">
                        <div className="text-green-400 font-bold text-sm md:text-base">Score</div>
                        <div className="text-white text-lg md:text-xl">{score}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-red-400 font-bold text-sm md:text-base">Strikes</div>
                        <div className="text-white text-lg md:text-xl">{strikes}/3</div>
                    </div>
                    <div className="text-center">
                        <div className="text-[#00ff00] font-bold text-sm md:text-base">Question</div>
                        <div className="text-white text-xs md:text-sm">{currentQuestion + 1}/{questions.length}</div>
                    </div>
                </div>
            </div>

            {!gameOver && (
                <>
                    <div className="md:p-4 p-2 md:border-4 border-2 border-cyan-400 border-ridge mb-8 text-white shadow-[0_0_30px_rgba(0,255,255,0.3)]" style={{ background: "linear-gradient(135deg,rgba(0, 0, 139, 0.9),rgba(25, 25, 112, 0.8))" }}>
                        <h3 className="text-cyan-400 text-center mb-5 md:text-2xl text-xl font-bold">
                            Question {currentQuestion + 1}
                        </h3>
                        <p className="text-center md:text-lg text-base">{currentQ.question}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="mb-6 px-1 w-full">
                        <div className="flex gap-3 justify-center items-center w-full">
                            <input
                                type="text"
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                placeholder="Type your answer..."
                                className="bg-black border-2 border-orange-400 text-white md:px-4 px-2 md:py-2 py-1 rounded flex-1 max-w-md"
                            />
                            <button
                                type="submit"
                                disabled={!userAnswer.trim()}
                                className="bg-gradient-to-r from-orange-500 to-red-500 text-white md:px-6 px-3 md:py-2 py-1 rounded border-2 border-orange-400 hover:scale-105 transition-transform duration-200 disabled:opacity-50"
                            >
                                Submit
                            </button>
                        </div>
                    </form>

                    {showResult && (
                        <div className={`mb-6 p-3 rounded border-2 ${showResult.includes('CORRECT')
                            ? 'bg-green-900/50 border-green-400 text-green-100'
                            : 'bg-red-900/50 border-red-400 text-red-100'
                            }`}>
                            {showResult}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-2 mb-6">
                        {currentQ.answers.map((answer, index) => {
                            const isRevealed = revealedAnswers.includes(answer.text);
                            return (
                                <div
                                    key={answer.text}
                                    className={`p-3 border-2 rounded ${isRevealed
                                        ? 'bg-green-900/80 border-green-400 text-green-100'
                                        : 'bg-gray-900/80 border-gray-600 text-gray-400'
                                        }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold">
                                            {isRevealed ? answer.text : `Answer ${index + 1}`}
                                        </span>
                                        <span className="text-lg font-bold">
                                            {isRevealed ? answer.points : '???'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={nextQuestion}
                            disabled={currentQuestion >= questions.length - 1}
                            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded border-2 border-blue-400 hover:scale-105 transition-transform duration-200 disabled:opacity-50"
                        >
                            Next Question
                        </button>
                        <button
                            onClick={resetGame}
                            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-2 rounded border-2 border-red-400 hover:scale-105 transition-transform duration-200"
                        >
                            Reset Game
                        </button>
                    </div>
                </>
            )}

            {gameOver && (
                <div className="animate-bounce text-center bg-gradient-to-r from-yellow-400 to-orange-500 text-black md:p-5 p-2 md:my-8 my-4 border-4 border-red-600 border-ridge font-bold shadow-[0_0_20px_rgba(255,215,0,0.5)] md:text-xl text-lg">
                    <div className="mb-3">
                        Game Complete! 🎉
                    </div>
                    <div className="mb-3">
                        Final Score: {score} points
                    </div>
                    <button
                        onClick={resetGame}
                        className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded border-2 border-green-400 hover:scale-105 transition-all duration-300 shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                    >
                        Play Again
                    </button>
                </div>
            )}

            <div className="text-sm text-gray-400 mt-6">
                <div>Type answers that might be on the board</div>
                <div>Get 3 strikes and you can move to the next question</div>
            </div>
        </div>
    );
};

export default FamilyFeud;
