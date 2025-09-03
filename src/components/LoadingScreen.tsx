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
                        background: 'radial-gradient(circle, #00000000 30%, rgb(0 0 0) 80%, rgb(0 0 0) 100%)'
                    }}>
                </div>
            </div>

            {!showProgress && (
                <div className="text-center">
                    <button
                        onClick={handleConnect}
                        className="px-5 py-2.5 text-xl cursor-pointer bg-[#00ff00] text-black hover:bg-green-400 transition-colors"
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
                        🎵 *Authentic 90s dial-up sounds playing* 🎵<br />
                        Please wait for connection to complete...
                    </div>
                </div>
            )}

            <audio ref={dialupAudioRef} src="/dialup-sound.mp3" />
        </div>
    );
};

export default LoadingScreen;
