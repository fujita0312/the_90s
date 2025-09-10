import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCreative, Autoplay, Pagination } from 'swiper/modules';
import Navigation from './Navigation';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-creative';
import 'swiper/css/pagination';

interface HeaderProps {
}

const Header: React.FC<HeaderProps> = () => {
  return (
    <div className="md:m-3 m-1.5 md:h-[400px] h-[250px] relative">
      {/* Swiper Carousel */}
      <Swiper
        grabCursor={true}
        effect={'creative'}
        creativeEffect={{
          prev: {
            shadow: true,
            translate: ['-20%', 0, -1],
          },
          next: {
            translate: ['100%', 0, 0],
          },
        }}
        modules={[EffectCreative, Autoplay]}
        className="header-swiper w-full h-full"
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        // pagination={{
        //   clickable: true,
        //   bulletClass: 'swiper-pagination-bullet header-bullet',
        //   bulletActiveClass: 'swiper-pagination-bullet-active header-bullet-active',
        // }}
        loop={true}
        speed={1000}
      >
        {/* 90s Fresh Background */}
        <SwiperSlide>
          <div className="relative w-full h-full">
            <img
              src="/assets/img/90s-fresh-bg.jpg"
              alt="90s Fresh Background"
              className="w-full h-full"
              style={{ imageRendering: 'pixelated' }}
            />
            {/* <div className="absolute inset-0 bg-gradient-to-r from-[#ff1493]/20 via-[#00ced1]/20 to-[#ff1493]/20"></div> */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              {/* <h1 className="rainbow bounce animate-pulse text-2xl md:text-5xl font-impact retro-text-glow mb-2">
                ☆ 90's FRESH TIL INFINITY ☆
              </h1>
              <div className="animate-blink text-lg md:text-4xl md:mt-6 mt-3 md:mb-6 mb-3 font-bold text-90s-neon-yellow retro-text-glow">
                🚀 TRANSMISSION FROM 2025! THE 90s CONQUERED THE FUTURE! 🚀
              </div> */}
            </div>
          </div>
        </SwiperSlide>

        {/* Arcade Banner */}
        {/* <SwiperSlide>
          <div className="relative w-full h-full">
            <img
              src="/assets/img/games-banner.jpg"
              alt="90s Games Arcade"
              className="w-full h-full object-cover"
              style={{ imageRendering: 'pixelated' }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-purple-900/30"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <h1 className="text-2xl md:text-5xl font-impact retro-text-glow mb-2 text-white">
                🎮 90s GAMES ARCADE 🎮
              </h1>
              <div className="text-lg md:text-3xl md:mt-6 mt-3 font-bold text-90s-neon-cyan retro-text-glow">
                🕹️ CLASSIC GAMING EXPERIENCE 🕹️
              </div>
            </div>
          </div>
        </SwiperSlide> */}

        {/* Memes Banner */}
        {/* <SwiperSlide>
          <div className="relative w-full h-full">
            <img
              src="/assets/img/memes-banner.jpg"
              alt="90s Memes Gallery"
              className="w-full h-full object-cover"
              style={{ imageRendering: 'pixelated' }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/30 via-teal-900/30 to-cyan-900/30"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <h1 className="text-2xl md:text-5xl font-impact retro-text-glow mb-2 text-white">
                😂 90s MEMES GALLERY 😂
              </h1>
              <div className="text-lg md:text-3xl md:mt-6 mt-3 font-bold text-90s-neon-green retro-text-glow">
                🎭 VINTAGE HUMOR COLLECTION 🎭
              </div>
            </div>
          </div>
        </SwiperSlide> */}
      </Swiper>

      {/* Navigation Overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-50">
        <Navigation />
      </div>
    </div>
  );
};

export default Header;
