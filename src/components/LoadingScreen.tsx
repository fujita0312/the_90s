import React, { useState, useRef } from 'react';
import { useToast } from '../contexts/ToastContext';

interface LoadingScreenProps {
    onComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
    const { showToast } = useToast();
    const [showProgress, setShowProgress] = useState(false);
    const [progress, setProgress] = useState(0);
    const dialupAudioRef = useRef<HTMLAudioElement>(null);
    const budweiserAudioRef = useRef<HTMLAudioElement>(null);

    const handleConnect = async () => {
        setShowProgress(true);

        try {
            if (dialupAudioRef.current) {
                await dialupAudioRef.current.play();
            }
        } catch (err) {
            console.log('Audio play failed:', err);
        }

        // Simulate loading progress
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        onComplete();
                    }, 1500);
                    return 100;
                }
                return prev + Math.random() * 15;
            });
        }, 1000);

        // Listen for audio end
        if (dialupAudioRef.current) {
            dialupAudioRef.current.addEventListener('ended', () => {
                setTimeout(() => {
                    try {
                        if (budweiserAudioRef.current) {
                            budweiserAudioRef.current.play();
                        }
                    } catch (err) {
                        console.log('Budweiser audio play failed:', err);
                    }

                    showToast(
                        "📞 CONNECTION ESTABLISHED! 📞\n\nWelcome to the World Wide Web!\nBaud Rate: 56k\nStatus: ONLINE\n\nWASSSSUPPP! 🕺",
                        'success',
                        6000
                    );
                }, 500);
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black text-[#00ff00] flex flex-col justify-center items-center z-50 font-courier">
            <div className="md:text-6xl text-3xl text-[#00ff00] mb-8">
                📞 DIALING UP 📞
            </div>

            {!showProgress && (
                <div className="mt-8 text-center">
                    <button
                        onClick={handleConnect}
                        className="px-5 py-2.5 text-xl cursor-pointer bg-[#00ff00] text-black rounded hover:bg-green-400 transition-colors"
                    >
                        🔌 Connect
                    </button>
                </div>
            )}

            {showProgress && (
                <div className="flex flex-col justify-center items-center">
                    <div className="md:text-3xl text-2xl mb-5 animate-blink">
                        Connecting to the 90s...
                    </div>
                    <div className="w-80 h-5 border-2 border-[#00ff00] bg-black mb-5">
                        <div
                            className="h-full bg-[#00ff00] transition-all duration-1000"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <div className="md:text-lg text-sm mt-5">
                        <div>🔊 Playing dial-up sounds... ████████░░</div>
                        <div>📞 Establishing connection... ██████████</div>
                        <div>💻 Loading GeoCities assets... ████████░░</div>
                        <div>🕰️ Preparing time machine... ██████████</div>
                    </div>
                    <div className="md:text-sm text-xs mt-8 text-yellow-400 max-w-sm text-center">
                        WERE DIALING UP SO PLEASE GET OURSELF DIALED IN AND PREPARE OURSELF FOR THIS STORY ALL ABOUT HOW OUR LIFE GOT FLIPPED TURNED UPSIDE DOWN.
                    </div>
                </div>
            )}

            <audio ref={dialupAudioRef} src="/dialup-sound.mp3" />
            <audio ref={budweiserAudioRef} src="/budweiser_wassup.mp3" />
        </div>
    );
};

export default LoadingScreen;
