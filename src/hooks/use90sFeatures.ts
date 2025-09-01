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

    // Enhanced Mouse Trails with Multiple Types
    let mouseTrail: Array<{ x: number; y: number; time: number; type: string }> = [];
    let cursorGlow: HTMLElement | null = null;
    let lastMouseX = 0;
    let lastMouseY = 0;
    
    // Create cursor glow effect
    const createCursorGlow = () => {
      cursorGlow = document.createElement('div');
      cursorGlow.className = 'cursor-glow';
      document.body.appendChild(cursorGlow);
    };

    // Trail types for variety
    const trailTypes = [
      { class: 'mouse-trail-dot', chance: 0.4, animation: '' },
      { class: 'mouse-trail-star', chance: 0.2, animation: 'trail-float' },
      { class: 'mouse-trail-heart', chance: 0.15, animation: 'trail-bounce' },
      { class: 'mouse-trail-floppy', chance: 0.1, animation: 'trail-spin' },
      { class: 'mouse-trail-cd', chance: 0.1, animation: 'trail-float' },
      { class: 'mouse-trail-rainbow', chance: 0.05, animation: 'trail-spin' }
    ];

    // Create trail element with random type and animation
    const createTrailElement = (x: number, y: number) => {
      const random = Math.random();
      let selectedType = trailTypes[0];
      let cumulativeChance = 0;
      
      for (const type of trailTypes) {
        cumulativeChance += type.chance;
        if (random <= cumulativeChance) {
          selectedType = type;
          break;
        }
      }

      const trail = document.createElement('div');
      trail.className = `mouse-trail ${selectedType.class}`;
      if (selectedType.animation) {
        trail.classList.add(selectedType.animation);
      }
      
      trail.setAttribute('data-time', Date.now().toString());
      trail.style.left = `${x}px`;
      trail.style.top = `${y}px`;
      
      // Add some randomness to position
      const offsetX = (Math.random() - 0.5) * 10;
      const offsetY = (Math.random() - 0.5) * 10;
      trail.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      
      document.body.appendChild(trail);
      
      // Remove after animation
      setTimeout(() => {
        if (trail.parentNode) {
          trail.remove();
        }
      }, 2000);
    };

    // Create line trail between mouse positions
    const createLineTrail = (x1: number, y1: number, x2: number, y2: number) => {
      if (Math.abs(x2 - x1) < 5 && Math.abs(y2 - y1) < 5) return; // Skip if too close
      
      const line = document.createElement('div');
      line.className = 'cursor-trail-line';
      
      const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
      
      line.style.width = `${length}px`;
      line.style.left = `${x1}px`;
      line.style.top = `${y1}px`;
      line.style.transform = `rotate(${angle}deg)`;
      line.style.transformOrigin = '0 0';
      
      document.body.appendChild(line);
      
      setTimeout(() => {
        if (line.parentNode) {
          line.remove();
        }
      }, 800);
    };

    const handleMousemove = (e: MouseEvent) => {
      const currentTime = Date.now();
      
      // Update cursor glow position
      if (cursorGlow) {
        cursorGlow.style.left = `${e.clientX - 10}px`;
        cursorGlow.style.top = `${e.clientY - 10}px`;
      }

      // Add to trail history
      mouseTrail.push({ 
        x: e.clientX, 
        y: e.clientY, 
        time: currentTime,
        type: 'move'
      });

      // Limit trail length
      if (mouseTrail.length > 15) {
        mouseTrail.shift();
      }

      // Remove old trail elements
      const oldTrails = document.querySelectorAll('.mouse-trail');
      oldTrails.forEach((trail) => {
        if (currentTime - parseInt(trail.getAttribute('data-time') || '0') > 2000) {
          trail.remove();
        }
      });

      // Create trail elements with varying frequency based on mouse speed
      const mouseSpeed = Math.sqrt(
        Math.pow(e.clientX - lastMouseX, 2) + Math.pow(e.clientY - lastMouseY, 2)
      );
      
      // Higher speed = more trails
      const trailChance = Math.min(mouseSpeed / 50, 0.8);
      
      if (Math.random() < trailChance) {
        createTrailElement(e.clientX, e.clientY);
      }

      // Create line trails occasionally
      if (Math.random() < 0.1 && mouseTrail.length > 1) {
        const prevPoint = mouseTrail[mouseTrail.length - 2];
        createLineTrail(prevPoint.x, prevPoint.y, e.clientX, e.clientY);
      }

      // Special effects on rapid movement
      if (mouseSpeed > 100) {
        // Create multiple trails for fast movement
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            createTrailElement(
              e.clientX + (Math.random() - 0.5) * 20,
              e.clientY + (Math.random() - 0.5) * 20
            );
          }, i * 50);
        }
      }

      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    // Mouse click effects
    const handleMouseClick = (e: MouseEvent) => {
      // Create explosion effect on click
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          const angle = (i * Math.PI * 2) / 8;
          const distance = 30;
          const x = e.clientX + Math.cos(angle) * distance;
          const y = e.clientY + Math.sin(angle) * distance;
          
          const clickTrail = document.createElement('div');
          clickTrail.className = 'mouse-trail mouse-trail-star';
          clickTrail.style.left = `${x}px`;
          clickTrail.style.top = `${y}px`;
          clickTrail.style.animation = 'trailBounce 1s ease-out forwards';
          
          document.body.appendChild(clickTrail);
          
          setTimeout(() => {
            if (clickTrail.parentNode) {
              clickTrail.remove();
            }
          }, 1000);
        }, i * 30);
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
    document.addEventListener('mousedown', handleMouseClick);
    
    // Initialize cursor glow
    createCursorGlow();
    
    // Show random popup every 30 seconds
    const popupInterval = setInterval(showRandomPopup, 30000);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('mousemove', handleMousemove);
      document.removeEventListener('mousedown', handleMouseClick);
      clearInterval(popupInterval);
      style.remove();
      if (cursorGlow) {
        cursorGlow.remove();
      }
    };
  }, []);
};
