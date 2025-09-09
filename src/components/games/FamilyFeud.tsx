import React, { useEffect, useState, useCallback, useMemo } from 'react';

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

interface FastMoneyQuestion {
    question: string;
    topAnswer: string;
    points: number;
}

type GameMode = 'single' | 'double' | null;

type GamePhase = 'setup' | 'main' | 'fastmoney' | 'complete';

const FamilyFeud: React.FC<FamilyFeudProps> = ({ onBack }) => {
    const [gameMode, setGameMode] = useState<GameMode>(null);
    const [currentPlayer, setCurrentPlayer] = useState<number>(1);
    const [player1Score, setPlayer1Score] = useState<number>(0);
    const [player2Score, setPlayer2Score] = useState<number>(0);

    const [currentQuestion, setCurrentQuestion] = useState<number>(0);
    const [strikes, setStrikes] = useState<number>(0);
    const [gameOver, setGameOver] = useState<boolean>(false);
    const [userAnswer, setUserAnswer] = useState<string>('');
    const [revealedAnswers, setRevealedAnswers] = useState<string[]>([]);
    const [showResult, setShowResult] = useState<string>('');

    const [gamePhase, setGamePhase] = useState<GamePhase>('setup');

    const [fastMoneyAnswers, setFastMoneyAnswers] = useState<Array<{ question: string; answer: string; points: number; correct: boolean }>>([]);
    const [fastMoneyCurrentQ, setFastMoneyCurrentQ] = useState<number>(0);
    const [fastMoneyPlayer, setFastMoneyPlayer] = useState<number>(1);
    const [fastMoneyTimer, setFastMoneyTimer] = useState<number>(20);
    const [fastMoneyActive, setFastMoneyActive] = useState<boolean>(false);

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
        },
        {
            question: "Name something people did for fun in the 90s without the internet",
            answers: [
                { text: "Rent movies from Blockbuster", points: 48 },
                { text: "Play board games", points: 40 },
                { text: "Listen to CDs", points: 35 },
                { text: "Go to the mall", points: 30 },
                { text: "Play video games", points: 25 },
                { text: "Talk on the phone", points: 20 },
                { text: "Read magazines", points: 15 }
            ]
        },
        {
            question: "Name a popular 90s snack food",
            answers: [
                { text: "Dunkaroos", points: 42 },
                { text: "Bagel Bites", points: 38 },
                { text: "Hot Pockets", points: 34 },
                { text: "Gushers", points: 30 },
                { text: "Fruit Roll-Ups", points: 26 },
                { text: "Pop Rocks", points: 22 },
                { text: "Surge Soda", points: 18 }
            ]
        },
        {
            question: "Name a 90s dance move",
            answers: [
                { text: "Macarena", points: 50 },
                { text: "Electric Slide", points: 40 },
                { text: "Running Man", points: 35 },
                { text: "Cabbage Patch", points: 28 },
                { text: "Hammer Time", points: 24 },
                { text: "Tootsie Roll", points: 20 },
                { text: "Butterfly", points: 15 }
            ]
        },
        {
            question: "Name a popular 90s movie",
            answers: [
                { text: "Titanic", points: 48 },
                { text: "Jurassic Park", points: 42 },
                { text: "The Lion King", points: 38 },
                { text: "Forrest Gump", points: 34 },
                { text: "Home Alone", points: 30 },
                { text: "Toy Story", points: 26 },
                { text: "Clueless", points: 22 }
            ]
        },
        {
            question: "Name something you'd find in a 90s car",
            answers: [
                { text: "Cassette Player", points: 45 },
                { text: "CD Player", points: 40 },
                { text: "Fuzzy Dice", points: 35 },
                { text: "Car Phone", points: 30 },
                { text: "Beaded Seat Cover", points: 25 },
                { text: "Air Freshener Tree", points: 20 },
                { text: "Steering Wheel Cover", points: 15 }
            ]
        },
        {
            question: "Name a 90s fashion trend",
            answers: [
                { text: "Flannel Shirts", points: 46 },
                { text: "Baggy Jeans", points: 40 },
                { text: "Platform Shoes", points: 36 },
                { text: "Chokers", points: 32 },
                { text: "Overalls", points: 28 },
                { text: "Windbreakers", points: 24 },
                { text: "Bucket Hats", points: 18 }
            ]
        },
        {
            question: "Name a 90s video game",
            answers: [
                { text: "Super Mario World", points: 44 },
                { text: "Sonic the Hedgehog", points: 38 },
                { text: "Street Fighter II", points: 34 },
                { text: "Mortal Kombat", points: 30 },
                { text: "Doom", points: 26 },
                { text: "Tetris", points: 22 },
                { text: "Pac-Man", points: 18 }
            ]
        },
        {
            question: "Name a 90s music genre",
            answers: [
                { text: "Grunge", points: 42 },
                { text: "Hip Hop", points: 38 },
                { text: "Alternative Rock", points: 34 },
                { text: "Pop", points: 30 },
                { text: "R&B", points: 26 },
                { text: "Techno", points: 22 },
                { text: "Country", points: 18 }
            ]
        },
        {
            question: "Name something you'd do at a 90s sleepover",
            answers: [
                { text: "Watch movies", points: 46 },
                { text: "Play truth or dare", points: 40 },
                { text: "Do makeovers", points: 36 },
                { text: "Prank call people", points: 32 },
                { text: "Tell ghost stories", points: 28 },
                { text: "Play video games", points: 24 },
                { text: "Listen to music", points: 20 }
            ]
        },
        {
            question: "Name a 90s cartoon character",
            answers: [
                { text: "Bart Simpson", points: 48 },
                { text: "Beavis and Butt-Head", points: 42 },
                { text: "Teenage Mutant Ninja Turtles", points: 38 },
                { text: "Ren and Stimpy", points: 34 },
                { text: "Doug Funnie", points: 30 },
                { text: "Rocko", points: 26 },
                { text: "Animaniacs", points: 22 }
            ]
        },
        {
            question: "Name a 90s technology that's now obsolete",
            answers: [
                { text: "Pager/Beeper", points: 44 },
                { text: "Floppy Disk", points: 40 },
                { text: "VHS Tapes", points: 36 },
                { text: "Dial-up Internet", points: 32 },
                { text: "Walkman", points: 28 },
                { text: "Fax Machine", points: 24 },
                { text: "Answering Machine", points: 20 }
            ]
        },
        {
            question: "Name a 90s boy band or girl group",
            answers: [
                { text: "Backstreet Boys", points: 46 },
                { text: "NSYNC", points: 42 },
                { text: "Spice Girls", points: 38 },
                { text: "Boyz II Men", points: 34 },
                { text: "TLC", points: 30 },
                { text: "98 Degrees", points: 26 },
                { text: "All-4-One", points: 22 }
            ]
        },
        {
            question: "Name something you'd find at a 90s arcade",
            answers: [
                { text: "Street Fighter", points: 44 },
                { text: "Mortal Kombat", points: 40 },
                { text: "Pac-Man", points: 36 },
                { text: "Pinball Machine", points: 32 },
                { text: "Skee-Ball", points: 28 },
                { text: "Dance Dance Revolution", points: 24 },
                { text: "Air Hockey", points: 20 }
            ]
        }
    ];

    const fastMoneyQuestions: FastMoneyQuestion[] = useMemo(() => ([
        { question: "Name a 90s TV show", topAnswer: "Friends", points: 25 },
        { question: "Name a 90s movie", topAnswer: "Titanic", points: 30 },
        { question: "Name a 90s song", topAnswer: "Smells Like Teen Spirit", points: 28 },
        { question: "Name a 90s toy", topAnswer: "Tamagotchi", points: 32 },
        { question: "Name a 90s video game", topAnswer: "Super Mario World", points: 27 }
    ]), []);

    const currentQ = questions[currentQuestion];

    const startGame = (mode: Exclude<GameMode, null>) => {
        setGameMode(mode);
        setGamePhase('main');
        setCurrentPlayer(1);
        setPlayer1Score(0);
        setPlayer2Score(0);
        setCurrentQuestion(0);
        setStrikes(0);
        setGameOver(false);
        setRevealedAnswers([]);
        setShowResult('');
        setUserAnswer('');
    };

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

            if (gameMode === 'single') {
                setPlayer1Score(player1Score + foundAnswer.points);
            } else if (gameMode === 'double') {
                if (currentPlayer === 1) {
                    setPlayer1Score(player1Score + foundAnswer.points);
                } else {
                    setPlayer2Score(player2Score + foundAnswer.points);
                }
            }

            setShowResult(`✓ CORRECT! "${foundAnswer.text}" - ${foundAnswer.points} points!`);
        } else {
            const newStrikes = strikes + 1;
            setStrikes(newStrikes);
            setShowResult(`✗ STRIKE! "${userAnswer}" not on the board!`);

            if (gameMode === 'double' && newStrikes < 3) {
                setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
            }
        }

        setUserAnswer('');

        window.setTimeout(() => {
            setShowResult('');
        }, 2000);
    };

    const nextQuestion = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setRevealedAnswers([]);
            setStrikes(0);
            setCurrentPlayer(1);
            setShowResult('');
        } else {
            if (gameMode === 'double') {
                setGamePhase('fastmoney');
                setFastMoneyPlayer(1);
                setFastMoneyCurrentQ(0);
                setFastMoneyAnswers([]);
                setFastMoneyActive(false);
                setFastMoneyTimer(20);
                setUserAnswer('');
            } else {
                setGameOver(true);
                setGamePhase('complete');
            }
        }
    };

    const startFastMoney = () => {
        setFastMoneyActive(true);
        setFastMoneyTimer(20);
        setUserAnswer('');
    };

    const handleFastMoneySubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!userAnswer.trim()) return;

        const currentFMQ = fastMoneyQuestions[fastMoneyCurrentQ];
        const normalizedAnswer = userAnswer.toLowerCase().trim();
        const isCorrect = currentFMQ.topAnswer.toLowerCase().includes(normalizedAnswer) ||
            normalizedAnswer.includes(currentFMQ.topAnswer.toLowerCase());

        const points = isCorrect ? currentFMQ.points : Math.floor(Math.random() * 15) + 5;

        setFastMoneyAnswers(prev => ([
            ...prev,
            {
                question: currentFMQ.question,
                answer: userAnswer,
                points: points,
                correct: isCorrect
            }
        ]));

        setUserAnswer('');

        if (fastMoneyCurrentQ < 4) {
            setFastMoneyCurrentQ(fastMoneyCurrentQ + 1);
            setFastMoneyTimer(20);
        } else {
            setFastMoneyActive(false);
            if (fastMoneyPlayer === 1) {
                setFastMoneyPlayer(2);
                setFastMoneyCurrentQ(0);
                setFastMoneyAnswers([]);
            } else {
                setGamePhase('complete');
                setGameOver(true);
            }
        }
    }, [userAnswer, fastMoneyQuestions, fastMoneyCurrentQ, fastMoneyPlayer]);

    const resetGame = () => {
        setGameMode(null);
        setGamePhase('setup');
        setCurrentPlayer(1);
        setPlayer1Score(0);
        setPlayer2Score(0);
        setCurrentQuestion(0);
        setStrikes(0);
        setGameOver(false);
        setRevealedAnswers([]);
        setShowResult('');
        setFastMoneyAnswers([]);
        setFastMoneyCurrentQ(0);
        setFastMoneyPlayer(1);
        setFastMoneyActive(false);
        setFastMoneyTimer(20);
        setUserAnswer('');
    };

    useEffect(() => {
        let interval: number | undefined;
        if (fastMoneyActive && fastMoneyTimer > 0) {
            interval = window.setInterval(() => {
                setFastMoneyTimer(prev => prev - 1);
            }, 1000);
        } else if (fastMoneyActive && fastMoneyTimer === 0) {
            // Auto-submit when timer hits 0
            handleFastMoneySubmit({ preventDefault: () => { /* noop */ } } as unknown as React.FormEvent);
        }
        return () => {
            if (interval) window.clearInterval(interval);
        };
    }, [fastMoneyActive, fastMoneyTimer, handleFastMoneySubmit]);

    useEffect(() => {
        if (strikes >= 3) {
            if (gameMode === 'double') {
                setGamePhase('fastmoney');
                setFastMoneyPlayer(1);
                setFastMoneyCurrentQ(0);
                setFastMoneyAnswers([]);
                setFastMoneyActive(false);
                setFastMoneyTimer(20);
                setUserAnswer('');
            } else if (gameMode === 'single') {
                setGameOver(true);
                setGamePhase('complete');
            }
        }
    }, [strikes, gameMode]);

    // Setup Phase UI
    if (gamePhase === 'setup') {
        return (
            <div className="text-center">
                <div className="flex justify-between items-center mb-6">
                    {/* <button
                        onClick={onBack}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black md:px-4 px-2 md:py-2 py-1 rounded border-2 border-yellow-400 hover:scale-105 transition-all duration-300 font-bold shadow-[0_0_15px_rgba(255,215,0,0.5)]"
                    >
                        ← Back to Games
                    </button> */}
                    <h2 className="rainbow text-2xl font-bold mx-auto">👨‍👩‍👧‍👦 Family Feud - 90s Edition 👨‍👩‍👧‍👦</h2>
                    {/* <div className="w-[120px]" /> */}
                </div>

                <div className="flex justify-center my-5">
                    <button onClick={onBack} className="bg-gradient-to-r from-yellow-500 rounded to-orange-500 text-black md:px-4 px-3 md:py-2 py-1 border-2 border-yellow-400 hover:scale-105 transition-all duration-300 font-bold">← Back to Games</button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-green-600 to-teal-600 text-white cursor-pointer hover:scale-105 transition-all duration-300 p-6 border-2 border-green-400">
                        <div className="text-2xl text-yellow-300 font-bold">👤 Single Player</div>
                        <div className="mt-2">Play solo and test your 90s knowledge!</div>
                        <button
                            onClick={() => startGame('single')}
                            className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-lg px-6 py-3 rounded border-2 border-yellow-300"
                        >
                            START SOLO GAME
                        </button>
                    </div>

                    <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white cursor-pointer hover:scale-105 transition-all duration-300 p-6 border-2 border-pink-400">
                        <div className="text-2xl text-yellow-300 font-bold">👥 Two Player</div>
                        <div className="mt-2">Compete with a friend + Fast Money round!</div>
                        <button
                            onClick={() => startGame('double')}
                            className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-lg px-6 py-3 rounded border-2 border-yellow-300"
                        >
                            START VS GAME
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Fast Money Phase UI
    if (gamePhase === 'fastmoney') {
        const totalFastMoneyPoints = fastMoneyAnswers.reduce((sum, ans) => sum + ans.points, 0);
        return (
            <div className="w-full max-w-4xl mx-auto space-y-6">
                <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white p-4 border-2 border-yellow-400">
                    <div className="text-3xl font-bold text-center text-black">⚡ FAST MONEY ROUND ⚡</div>
                    <div className="text-xl font-bold text-center mt-2">
                        Player {fastMoneyPlayer} - {fastMoneyActive ? `Time: ${fastMoneyTimer}s` : 'Get Ready!'}
                    </div>
                </div>

                {!fastMoneyActive ? (
                    <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white p-6 border-2 border-pink-400 text-center">
                        <div className="text-2xl font-bold mb-4">
                            Player {fastMoneyPlayer}, you have 20 seconds to answer 5 questions!
                        </div>
                        <div className="mb-6">Give the most popular answers to score big points!</div>
                        <button
                            onClick={startFastMoney}
                            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-2xl px-8 py-4 rounded border-2 border-yellow-300"
                        >
                            START FAST MONEY!
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-6 border-2 border-blue-400">
                            <div className="text-2xl text-center text-yellow-300 font-bold">
                                Question {fastMoneyCurrentQ + 1} of 5
                            </div>
                            <div className="text-3xl font-bold text-center mt-4">
                                {fastMoneyQuestions[fastMoneyCurrentQ].question}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-6 border-2 border-orange-400">
                            <form onSubmit={handleFastMoneySubmit} className="space-y-4">
                                <input
                                    type="text"
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    placeholder="Quick! Enter your answer..."
                                    className="text-xl p-4 text-black w-full rounded"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-xl py-3 rounded border-2 border-yellow-300"
                                >
                                    SUBMIT ({fastMoneyTimer}s)
                                </button>
                            </form>
                        </div>
                    </>
                )}

                {fastMoneyAnswers.length > 0 && (
                    <div className="bg-gradient-to-br from-green-600 to-teal-600 text-white p-4 border-2 border-green-400">
                        <div className="text-2xl text-center text-yellow-300 font-bold mb-2">Player {fastMoneyPlayer} Results</div>
                        {fastMoneyAnswers.map((answer, index) => (
                            <div key={`${answer.question}-${index}`} className="flex justify-between items-center p-2 border-b border-white/20">
                                <span>{answer.question}</span>
                                <span className="font-bold">{answer.answer} - {answer.points} pts</span>
                            </div>
                        ))}
                        <div className="text-2xl font-bold text-center mt-4 text-yellow-300">
                            Total: {totalFastMoneyPoints} points
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Game Complete Phase UI
    if (gamePhase === 'complete' || gameOver) {
        const finalScore1 = player1Score;
        const finalScore2 = player2Score;
        const winner: 1 | 2 | 'tie' = finalScore1 > finalScore2 ? 1 : finalScore2 > finalScore1 ? 2 : 'tie';

        return (
            <div className="w-full max-w-4xl mx-auto space-y-6 text-white">
                <div className="text-center bg-gradient-to-r from-yellow-400 to-orange-500 text-black md:p-5 p-3 md:my-4 my-3 border-4 border-red-600 border-ridge font-bold shadow-[0_0_20px_rgba(255,215,0,0.5)]">
                    <div className="text-3xl mb-2">🎉 GAME COMPLETE! 🎉</div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="text-center bg-black/60 p-4 border-2 border-cyan-400">
                        <div className="text-xl font-bold text-cyan-300">Player 1</div>
                        <div className="text-4xl font-bold text-yellow-300">{finalScore1}</div>
                    </div>
                    {gameMode === 'double' && (
                        <div className="text-center bg-black/60 p-4 border-2 border-cyan-400">
                            <div className="text-xl font-bold text-cyan-300">Player 2</div>
                            <div className="text-4xl font-bold text-yellow-300">{finalScore2}</div>
                        </div>
                    )}
                </div>
                <div className="text-2xl font-bold text-center">
                    {gameMode === 'single' ? (
                        finalScore1 >= 300 ? "🏆 EXCELLENT! You're a 90s expert!" :
                            finalScore1 >= 200 ? "👏 GOOD JOB! You know your 90s!" :
                                "📚 Not bad! Time to brush up on your 90s knowledge!"
                    ) : (
                        winner === 'tie' ? '🤝 IT\'S A TIE!' : `🏆 PLAYER ${winner} WINS!`
                    )}
                </div>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={resetGame}
                        className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded border-2 border-green-400 hover:scale-105 transition-all duration-300 shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                    >
                        Play Again
                    </button>
                    <button
                        onClick={onBack}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-6 py-2 border-2 border-yellow-400 hover:scale-105 transition-all duration-300"
                    >
                        Back to Games
                    </button>
                </div>
            </div>
        );
    }

    // Main Game Phase UI
    return (
        <div className="text-center">
            <div className="flex justify-center items-center mb-6">
                {/* <button
                    onClick={onBack}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black md:px-4 px-2 md:py-2 py-1 rounded border-2 border-yellow-400 hover:scale-105 transition-all duration-300 font-bold shadow-[0_0_15px_rgba(255,215,0,0.5)]"
                >
                    ← Back to Games
                </button> */}
                <h2 className="rainbow text-2xl font-bold mx-4">👨‍👩‍👧‍👦 Family Feud 👨‍👩‍👧‍👦</h2>
            </div>

            <div className="bg-black/60 md:p-5 p-2 md:border-2 border border-[#00ff00] md:my-6 my-4">
                <div className="text-[#00ff00] text-center mb-4 font-bold md:text-lg text-base">
                    GAME STATISTICS
                </div>
                <div className="grid grid-cols-3 gap-2 md:gap-4">
                    <div className="text-center">
                        <div className="text-green-400 font-bold text-sm md:text-base">{gameMode === 'single' ? 'Score' : 'P1 Score'}</div>
                        <div className="text-white text-lg md:text-xl">{player1Score}</div>
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
                {gameMode === 'double' && (
                    <div className="mt-2 text-center text-white">
                        <div className="text-sm">Player 2 Score: <span className="font-bold">{player2Score}</span></div>
                        <div className="text-sm">Current Turn: <span className="font-bold">Player {currentPlayer}</span></div>
                    </div>
                )}
            </div>

            <div className="md:p-4 p-2 md:border-4 border-2 border-cyan-400 border-ridge mb-8 text-white shadow-[0_0_30px_rgba(0,255,255,0.3)]" style={{ background: 'linear-gradient(135deg,rgba(0, 0, 139, 0.9),rgba(25, 25, 112, 0.8))' }}>
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
                        disabled={strikes >= 3}
                    />
                    <button
                        type="submit"
                        disabled={!userAnswer.trim() || strikes >= 3}
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
                                    {isRevealed ? `${index + 1}. ${answer.text}` : `Answer ${index + 1}`}
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
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white md:px-6 px-3 md:py-2 py-1 rounded  border-2 border-blue-400 hover:scale-105 transition-transform duration-200 disabled:opacity-50"
                >
                    Next Question
                </button>
                <button
                    onClick={resetGame}
                    className="bg-gradient-to-r from-red-500 to-pink-500 text-white md:px-6 px-3 md:py-2 py-1 rounded  border-2 border-red-400 hover:scale-105 transition-transform duration-200"
                >
                    Reset Game
                </button>
                {gameMode === 'double' && (
                    <button
                        onClick={() => setGamePhase('fastmoney')}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black md:px-6 px-3 md:py-2 py-1 rounded border-2 border-yellow-400 hover:scale-105 transition-transform duration-200"
                    >
                        Fast Money
                    </button>
                )}
            </div>

            <div className="flex justify-center my-5">
                <button onClick={() => setGamePhase('setup')} className="bg-gradient-to-r rounded from-yellow-500 to-orange-500 text-black md:px-4 px-3 md:py-2 py-1 border-2 border-yellow-400 hover:scale-105 transition-all duration-300 font-bold">← Back</button>
            </div>
        </div>
    );
};

export default FamilyFeud;
