import { useState, useRef } from 'react';
import { useToast } from '../contexts/ToastContext';
import { use90sFeatures } from '../hooks/use90sFeatures';
import { useNavigate } from 'react-router-dom';

const LoadingScreen = () => {
    const { showToast } = useToast();
    const [showProgress, setShowProgress] = useState(false);
    const [progress, setProgress] = useState(0);
    const dialupAudioRef = useRef<HTMLAudioElement>(null);
    const navigate = useNavigate();
    use90sFeatures();
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
                let pr = prev + Math.random() * 15;
                if (pr >= 100) {
                    clearInterval(interval);
                    // setTimeout(() => {

                    // }, 1500);
                    return 100;
                }
                return pr;
            });
        }, 1000);

        // Listen for audio end
        if (dialupAudioRef.current) {
            dialupAudioRef.current.addEventListener('ended', () => {
                setTimeout(() => {
                    showToast(
                        "📞 CONNECTION ESTABLISHED! 📞\n\nWelcome to the World Wide Web!\nBaud Rate: 56k\nStatus: ONLINE\n\nWASSSSUPPP! 🕺",
                        'success',
                        6000
                    );
                }, 500);
                navigate('/main');
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black text-[#00ff00] flex flex-col justify-center items-center z-50 font-courier">
            <div
                className="mb-8 relative max-w-md h-auto flex justify-center items-center overflow-hidden"
                style={{
                    aspectRatio: '5/3.7'
                }}>
                <video
                    className=""
                    autoPlay
                    loop
                    muted
                >
                    <source src="/video_2025-09-03_20-14-01.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                <div className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle, #00000000 30%, rgb(0 0 0) 90%, rgb(0 0 0) 100%)'
                    }}>
                </div>
            </div>

            {!showProgress && (
                <div className="text-center">
                    <button
                        onClick={handleConnect}
                        className="px-5 py-2.5 text-xl cursor-pointer bg-[#00ff00] text-black hover:bg-green-400 transition-colors"
                    >
                        🔌 CONNECT TO THE 90s 🔌
                    </button>
                    <div className="mt-4 text-90s-neon-cyan text-sm animate-blink">
                        Click to establish dial-up connection
                    </div>
                </div>
            )}

            {showProgress && (
                <div className="flex flex-col justify-center items-center px-2">
                    <div className="md:text-2xl text-xl mb-5 animate-blink text-center">
                        Connecting to the 90s...
                    </div>
                    
                    {/* Enhanced progress bar */}
                    <div className="w-full max-w-md h-8 border-4 border-90s-neon-green bg-black mb-6 retro-border-glow">
                        <div
                            className="h-full bg-gradient-to-r from-90s-neon-green to-90s-neon-cyan transition-all duration-1000 relative overflow-hidden"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-cyber-scan"></div>
                        </div>
                    </div>
                    
                    {/* Enhanced status messages */}
                    <div className="md:text-lg text-sm mt-6 space-y-2 font-courier">
                        <div className="flex items-center gap-2 text-90s-neon-green">
                            <span className="animate-pulse">🔊</span> Playing dial-up sounds... 
                            <span className="text-90s-neon-cyan">████████░░</span>
                        </div>
                        <div className="flex items-center gap-2 text-90s-neon-cyan">
                            <span className="animate-pulse">📞</span> Establishing connection... 
                            <span className="text-90s-neon-green">██████████</span>
                        </div>
                        <div className="flex items-center gap-2 text-90s-neon-pink">
                            <span className="animate-pulse">💻</span> Loading GeoCities assets... 
                            <span className="text-90s-neon-yellow">████████░░</span>
                        </div>
                        <div className="flex items-center gap-2 text-90s-neon-yellow">
                            <span className="animate-pulse">🕰️</span> Preparing time machine... 
                            <span className="text-90s-neon-pink">██████████</span>
                        </div>
                    </div>
                    
                    <div className="md:text-base text-sm mt-8 text-90s-neon-cyan max-w-md text-center retro-text-glow">
                        🎵 *Authentic 90s dial-up sounds playing* 🎵<br />
                        Please wait for connection to complete...<br />
                        <span className="text-90s-neon-pink animate-blink">Baud Rate: 56k | Status: CONNECTING</span>
                    </div>
                </div>
            )}

            <audio ref={dialupAudioRef} src="/dialup-sound.mp3" />
        </div>
    );
};

export default LoadingScreen;
