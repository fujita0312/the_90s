import React, { useEffect, useRef, useState } from 'react';

interface JackalProps {
    onBack: () => void;
}

const Jackal: React.FC<JackalProps> = ({ onBack }) => {
    const gameSrc = 'https://www.retrogames.cc/embed/20756-jackal-usa.html';
    const [isLoading, setIsLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const requestFullscreen = (element: any) => {
        if (!element) return;
        (element.requestFullscreen || element.webkitRequestFullscreen || element.mozRequestFullScreen || element.msRequestFullscreen)?.call(element);
    };

    const exitFullscreen = () => {
        const doc: any = document;
        (document.exitFullscreen || doc.webkitExitFullscreen || doc.mozCancelFullScreen || doc.msExitFullscreen)?.call(document);
    };

    const toggleFullscreen = () => {
        if (document.fullscreenElement) {
            exitFullscreen();
        } else {
            requestFullscreen(containerRef.current);
        }
    };

    useEffect(() => {
        const handleChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleChange);
        // Safari/older vendor-prefixed fallbacks
        document.addEventListener('webkitfullscreenchange', handleChange as any);
        document.addEventListener('mozfullscreenchange', handleChange as any);
        document.addEventListener('MSFullscreenChange', handleChange as any);
        return () => {
            document.removeEventListener('fullscreenchange', handleChange);
            document.removeEventListener('webkitfullscreenchange', handleChange as any);
            document.removeEventListener('mozfullscreenchange', handleChange as any);
            document.removeEventListener('MSFullscreenChange', handleChange as any);
        };
    }, []);

    return (
        <div className="w-full max-w-6xl mx-auto space-y-4">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white md:p-6 p-3 border-2 border-green-400">
                <div className="text-center">
                    <div className="md:text-4xl text-2xl font-bold text-yellow-300">🚗 JACKAL 🚗</div>
                    <div className="md:text-2xl text-xl font-bold text-white/90">Top-down military action!</div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700">
                <div ref={containerRef} className="relative w-full" style={{ paddingTop: '56.25%' }}>
                    <button
                        type="button"
                        onClick={toggleFullscreen}
                        aria-pressed={isFullscreen}
                        title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                        className="absolute z-20 top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black md:px-3 px-2 md:py-1.5 py-1 border-2 border-yellow-300 shadow hover:scale-105 transition-transform text-sm font-bold"
                    >
                        {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                    </button>
                    {isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-10" role="status" aria-live="polite">
                            <div className="mx-auto mb-3 h-16 w-16 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin" aria-hidden="true"></div>
                            <div className="text-cyan-300 font-semibold">Loading Jackal…</div>
                        </div>
                    )}
                    <iframe
                        title="Jackal"
                        src={gameSrc}
                        className="absolute inset-0 w-full h-full border-2 border-green-400"
                        allow="fullscreen; autoplay; gamepad; cross-origin-isolated"
                        allowFullScreen
                        loading="lazy"
                        onLoad={() => setIsLoading(false)}
                    />
                </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-teal-500 text-white border-2 border-green-400">
                <div className="p-4">
                    <div className="text-lg text-center font-bold">🎯 TIPS</div>
                    <div className="text-sm space-y-1 mt-2 text-center">
                        <div>• Use arrow keys to move your jeep</div>
                        <div>• Press spacebar to shoot in all directions</div>
                        <div>• Rescue POWs and destroy enemy bases</div>
                        <div>• Use fullscreen for the best experience</div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center">
                <button
                    onClick={onBack}
                    className="bg-gradient-to-r from-green-500 to-teal-500 text-black md:px-4 px-3 md:py-2 py-1 border-2 border-green-400 hover:scale-105 transition-all duration-300 font-bold"
                >
                    ← Back to Games
                </button>
            </div>
        </div>
    );
};

export default Jackal;
