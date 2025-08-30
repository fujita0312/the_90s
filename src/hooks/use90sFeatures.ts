import { useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';

export const use90sFeatures = () => {
  const { showToast } = useToast();
  
  useEffect(() => {
    // Konami code
    let konamiCode: string[] = [];
    const konamiSequence = [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
      'KeyB', 'KeyA'
    ];

    const handleKeydown = (e: KeyboardEvent) => {
      konamiCode.push(e.code);
      if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
      }

      if (konamiCode.join(',') === konamiSequence.join(',')) {
        showToast(
          "🎮 KONAMI CODE ACTIVATED! 🎮\n\n30 EXTRA LIVES GRANTED!\n(In the 90s, this would have been amazing!)",
          'info',
          6000
        );
        document.body.style.animation = "spin 2s linear";
        setTimeout(() => {
          document.body.style.animation = "";
        }, 2000);
        konamiCode = [];
      }
    };

    // Mouse trails
    let mouseTrail: Array<{ x: number; y: number; time: number }> = [];
    
    const handleMousemove = (e: MouseEvent) => {
      mouseTrail.push({ x: e.clientX, y: e.clientY, time: Date.now() });

      // Limit trail length
      if (mouseTrail.length > 10) {
        mouseTrail.shift();
      }

      // Remove old trail elements
      const oldTrails = document.querySelectorAll('.mouse-trail');
      oldTrails.forEach((trail) => {
        if (Date.now() - parseInt(trail.getAttribute('data-time') || '0') > 1000) {
          trail.remove();
        }
      });

      // Add new trail element occasionally
      if (Math.random() < 0.1) {
        const trail = document.createElement('div');
        trail.className = 'mouse-trail';
        trail.setAttribute('data-time', Date.now().toString());
        trail.style.cssText = `
          position: fixed;
          left: ${e.clientX}px;
          top: ${e.clientY}px;
          width: 4px;
          height: 4px;
          background: #00FF00;
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          animation: fadeOut 1s ease-out forwards;
        `;
        document.body.appendChild(trail);
      }
    };

    // Random 90s popup messages
    const popup90sMessages = [
      "🎉 Congratulations! You're the 1000th visitor! (Just kidding, but wouldn't that be rad?)",
      "💿 Don't forget to eject your CD-ROM when you're done!",
      "📺 This website is best viewed on a 15-inch CRT monitor!",
      "🔊 Make sure your SoundBlaster is working for the full experience!",
      "💾 Remember to save your work to floppy disk!",
      "📞 Your mom wants you to get off the internet so she can use the phone!",
    ];

    const showRandomPopup = () => {
      if (Math.random() < 0.3) { // 30% chance
        const message = popup90sMessages[Math.floor(Math.random() * popup90sMessages.length)];
        setTimeout(() => showToast(message, 'info', 5000), 1000);
      }
    };

    // Add fadeOut animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeOut {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0); }
      }
    `;
    document.head.appendChild(style);

    // Event listeners
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('mousemove', handleMousemove);
    
    // Show random popup every 30 seconds
    const popupInterval = setInterval(showRandomPopup, 30000);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('mousemove', handleMousemove);
      clearInterval(popupInterval);
      style.remove();
    };
  }, []);
};
