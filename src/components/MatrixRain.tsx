import React, { useEffect, useRef } from 'react';

const MatrixRain: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const chars = "01";

    // Create matrix columns
    for (let i = 0; i < 10; i++) {
      const column = document.createElement("div");
      column.className = "matrix-column";
      column.style.left = Math.random() * 100 + "%";
      column.style.animationDuration = Math.random() * 3 + 4 + "s";
      column.style.animationDelay = Math.random() * 2 + "s";

      let columnText = "";
      for (let j = 0; j < 20; j++) {
        columnText += chars[Math.floor(Math.random() * chars.length)];
      }
      column.textContent = columnText;

      container.appendChild(column);
    }

    // Cleanup function
    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-[-2]"
    />
  );
};

export default MatrixRain;
