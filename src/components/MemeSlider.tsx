import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode, EffectCoverflow } from 'swiper/modules';
import { Meme } from '../types/meme';
import memeApi from '../services/memeApi';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const MemeSlider: React.FC = () => {
    const [memes, setMemes] = useState<Meme[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    // const [memesPerView, setMemesPerView] = useState(3);
    const navigate = useNavigate();

    // Load memes on component mount
    useEffect(() => {
        const loadMemes = async () => {
            try {
                setIsLoading(true);
                const response = await memeApi.getAllMemes();
                if (response.success && response.data) {
                    const validMemes = Array.isArray(response.data) ? response.data.filter(meme => meme && meme.id) : [];
                    setMemes(validMemes);
                } else {
                    console.error('Failed to load memes:', response.error);
                    setMemes([]);
                }
            } catch (error) {
                console.error('Error loading memes:', error);
                setMemes([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadMemes();
    }, []);

    // // Set responsive memes per view
    // useEffect(() => {
    //     const updateMemesPerView = () => {
    //         const width = window.innerWidth;
    //         if (width < 640) { // sm
    //             setMemesPerView(1);
    //         } else if (width < 1024) { // md
    //             setMemesPerView(2);
    //         } else { // lg and up
    //             setMemesPerView(3);
    //         }
    //     };

    //     updateMemesPerView();
    //     window.addEventListener('resize', updateMemesPerView);
    //     return () => window.removeEventListener('resize', updateMemesPerView);
    // }, []);

    const handleViewAll = () => {
        navigate('/memes');
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
    };

    if (isLoading) {
        return (
            <div className="bg-gradient-to-r from-black via-gray-800 to-black border-2 sm:border-3 lg:border-4 border-pink-500 border-ridge p-3 sm:p-4 lg:p-6 shadow-[0_0_20px_rgba(255,0,255,0.3)] mb-4 sm:mb-6 max-w-5xl mx-auto">
                <h4 className="text-pink-500 text-center mb-3 sm:mb-4 lg:mb-5 text-lg sm:text-xl lg:text-2xl font-bold">
                    😂 90s MEME GALLERY 😂
                </h4>
                <div className="text-center text-white">
                    <div className="animate-spin text-3xl sm:text-4xl lg:text-5xl mb-3 sm:mb-4">🔄</div>
                    <p className="text-sm sm:text-base lg:text-lg">Loading the raddest memes...</p>
                </div>
            </div>
        );
    }

    if (memes.length === 0) {
        return (
            <div className="bg-gradient-to-r from-black via-gray-800 to-black border-2 sm:border-3 lg:border-4 border-pink-500 border-ridge p-3 sm:p-4 lg:p-6 shadow-[0_0_20px_rgba(255,0,255,0.3)] mb-4 sm:mb-6 max-w-5xl mx-auto">
                <h4 className="text-pink-500 text-center mb-3 sm:mb-4 lg:mb-5 text-lg sm:text-xl lg:text-2xl font-bold">
                    😂 90s MEME GALLERY 😂
                </h4>
                <div className="text-center text-white">
                    <div className="text-3xl sm:text-4xl lg:text-5xl mb-3 sm:mb-4">📭</div>
                    <p className="mb-3 sm:mb-4 text-sm sm:text-base lg:text-lg">No memes yet! Be the first to submit one!</p>
                    <p className="text-xs sm:text-sm text-gray-400">Click the MEMES button in the footer to submit your first meme!</p>
                </div>
            </div>
        );
    }

    // Safety check to ensure we have valid memes
    if (!memes || memes.length === 0) {
        return (
            <div className="bg-gradient-to-r from-black via-gray-800 to-black border-2 sm:border-3 lg:border-4 border-pink-500 border-ridge p-3 sm:p-4 lg:p-6 shadow-[0_0_20px_rgba(255,0,255,0.3)] mb-4 sm:mb-6 max-w-5xl mx-auto">
                <h4 className="text-pink-500 text-center mb-3 sm:mb-4 lg:mb-5 text-lg sm:text-xl lg:text-2xl font-bold">
                    😂 90s MEME GALLERY 😂
                </h4>
                <div className="text-center text-white">
                    <div className="text-3xl sm:text-4xl lg:text-5xl mb-3 sm:mb-4">📭</div>
                    <p className="mb-3 sm:mb-4 text-sm sm:text-base lg:text-lg">No memes available right now!</p>
                    <p className="text-xs sm:text-sm text-gray-400">Try refreshing the page or check back later.</p>
                </div>
            </div>
        );
    }


    return (
        <div className="bg-gradient-to-r from-black via-gray-800 to-black border-3 border-pink-500 border-ridge p-3 sm:p-4 lg:p-6 shadow-[0_0_20px_rgba(255,0,255,0.3)] mb-4 sm:mb-6 max-w-5xl mx-auto">
            {/* <h4 className="text-pink-500 text-center mb-3 sm:mb-4 lg:mb-5 text-lg sm:text-xl lg:text-2xl font-bold">
                😂 90s MEME GALLERY 😂
            </h4> */}

            <div className="mb-4 flex justify-center md:px-6 px-0">
                <img
                    src="/assets/img/memes-banner.png"
                    alt="Guest Book - Retro pixel art banner with neon colors and classic computer elements"
                    className="max-w-full h-auto w-full rounded-lg transition-all duration-500"
                    style={{ imageRendering: 'pixelated' }}
                />
            </div>
            {/* Swiper Container */}
            <div className="mb-4 md:mb-6">
                <Swiper
                    modules={[Autoplay, FreeMode, EffectCoverflow]}
                    spaceBetween={3}
                    // slidesPerView={1}
                    slidesPerView="auto"
                    autoplay={{
                        delay: 3000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                    }}
                    effect={'coverflow'}
                    grabCursor={true}
                    centeredSlides={true}
                    coverflowEffect={{
                        rotate: 30,
                        stretch: 0,
                        depth: 100,
                        modifier: 1,
                        slideShadows: true,
                    }}
                    freeMode={true}
                    loop={memes.length > 3}
                    speed={800}
                    className="meme-swiper"
                >
                    {memes.map((meme, index) => (
                        <SwiperSlide key={meme.id} className='text-center md:!h-[160px] md:!w-[180px] !h-[120px] !w-[150px] bg-black'>
                            {/* <div className=""> */}
                            <img
                                src={meme.imageUrl}
                                alt="90s Meme"
                                className="h-full mx-auto bg-black transition-transform duration-300 hover:scale-105"
                            />
                            {/* </div> */}
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Custom Pagination */}
                {/* <div className="swiper-pagination-custom flex justify-center mt-4 gap-1.5 sm:gap-2"></div> */}
            </div>

            {/* View All Button */}
            <div className="text-center">
                <button
                    onClick={handleViewAll}
                    className="bg-gradient-to-r from-pink-500 to-purple-500 text-black px-4 py-2 sm:px-6 sm:py-2.5 lg:px-8 lg:py-3 border-2 border-pink-400 hover:scale-105 transition-all duration-300 text-xs sm:text-sm lg:text-base font-bold shadow-[0_0_15px_rgba(255,0,255,0.3)] hover:shadow-[0_0_25px_rgba(255,0,255,0.5)] hover:border-pink-300"
                >
                    <span className="animate-pulse">🎭 View All Memes 🎭</span>
                </button>
                <p className="text-gray-400 text-xs sm:text-sm mt-2">
                    {memes.length} memes available
                </p>
            </div>
        </div>
    );
};

export default MemeSlider;
