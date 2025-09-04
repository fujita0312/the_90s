/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        'comic': ['"Comic Neue"', '"Comic Sans MS"', 'cursive'],
        'orbitron': ['Orbitron', 'monospace'],
        'courier': ['"Courier New"', 'monospace'],
        'impact': ['Impact', 'Arial Black', 'sans-serif'],
        'arial': ['Arial', 'Helvetica', 'sans-serif']
      },
      colors: {
        '90s': {
          'neon-green': '#00FF00',
          'neon-pink': '#FF00FF',
          'neon-cyan': '#00FFFF',
          'neon-yellow': '#FFFF00',
          'neon-orange': '#FF4500',
          'neon-blue': '#0080FF',
          'neon-purple': '#8000FF',
          'dark-blue': '#000080',
          'dark-purple': '#800080',
          'dark-cyan': '#008080',
          'bright-red': '#FF0000',
          'lime': '#00FF80',
          'magenta': '#FF0080'
        },
        'retro': {
          'bg-dark': '#0a0a0a',
          'bg-darker': '#000000',
          'text-glow': '#00ff00',
          'border-glow': '#ff00ff'
        }
      },
      animation: {
        'gradient-shift': 'gradientShift 4s ease infinite',
        'sparkle': 'sparkle 3s linear infinite',
        'blink': 'blink 1s infinite',
        'blink2': 'blink 2s infinite',
        'bounce': 'bounce 2s infinite',
        'spin': 'spin 2s linear infinite',
        'rainbow-move': 'rainbowMove 3s linear infinite',
        'marquee': 'marquee 20s linear infinite',
        'flicker': 'flicker 0.5s infinite alternate',
        'pulse': 'pulse 2s infinite',
        'matrix-fall': 'matrixFall linear infinite',
        'loading': 'loading 20s ease-in-out forwards',
        'dance': 'dance 1s infinite',
        'clippy-bounce': 'clippyBounce 3s infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
        'neon-flicker': 'neonFlicker 1.5s infinite alternate',
        'retro-bounce': 'retroBounce 1s ease-in-out infinite',
        'cyber-scan': 'cyberScan 3s linear infinite',
        'data-stream': 'dataStream 2s linear infinite',
        'screen-flicker': 'screenFlicker 0.1s infinite alternate'
      },
      keyframes: {
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '25%': { backgroundPosition: '100% 50%' },
          '50%': { backgroundPosition: '100% 100%' },
          '75%': { backgroundPosition: '0% 100%' },
          '100%': { backgroundPosition: '0% 50%' }
        },
        sparkle: {
          'from': { transform: 'translateX(0)' },
          'to': { transform: 'translateX(200px)' }
        },
        blink: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' }
        },
        bounce: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-30px)' },
          '60%': { transform: 'translateY(-15px)' }
        },
        spin: {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' }
        },
        rainbowMove: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' }
        },
        marquee: {
          '0%': { transform: 'translate3d(100%, 0, 0)' },
          '100%': { transform: 'translate3d(-100%, 0, 0)' }
        },
        flicker: {
          '0%': { textShadow: '0 0 5px #ff4500, 0 0 10px #ff4500' },
          '100%': { textShadow: '0 0 10px #ff4500, 0 0 20px #ff4500, 0 0 30px #ff4500' }
        },
        pulse: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' }
        },
        matrixFall: {
          'from': { transform: 'translateY(-100vh)' },
          'to': { transform: 'translateY(100vh)' }
        },
        loading: {
          '0%': { width: '0%' },
          '20%': { width: '15%' },
          '40%': { width: '35%' },
          '60%': { width: '60%' },
          '80%': { width: '85%' },
          '100%': { width: '100%' }
        },
        dance: {
          '0%, 100%': { transform: 'translateY(0) rotate(-5deg)' },
          '25%': { transform: 'translateY(-10px) rotate(5deg)' },
          '50%': { transform: 'translateY(-5px) rotate(-3deg)' },
          '75%': { transform: 'translateY(-15px) rotate(3deg)' }
        },
        clippyBounce: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '25%': { transform: 'translateY(-20px) rotate(10deg)' },
          '50%': { transform: 'translateY(-10px) rotate(-5deg)' },
          '75%': { transform: 'translateY(-30px) rotate(5deg)' }
        },
        glowPulse: {
          '0%': { 
            textShadow: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor',
            boxShadow: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor'
          },
          '100%': { 
            textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor',
            boxShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor'
          }
        },
        neonFlicker: {
          '0%, 100%': { 
            opacity: '1',
            textShadow: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor'
          },
          '50%': { 
            opacity: '0.8',
            textShadow: '0 0 2px currentColor, 0 0 5px currentColor, 0 0 8px currentColor'
          }
        },
        retroBounce: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-10px) scale(1.05)' }
        },
        cyberScan: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100vw)' }
        },
        dataStream: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' }
        },
        screenFlicker: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0.98' }
        }
      }
    }
  },
  plugins: [],
}
