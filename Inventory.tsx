@import "tailwindcss";

@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Rajdhani', sans-serif;
  overflow-x: hidden;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Orbitron', sans-serif;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: #0f172a;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #22d3ee, #a855f7);
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #a855f7, #22d3ee);
}

/* Neon glow animation */
@keyframes neon-pulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(34, 211, 238, 0.5), 0 0 40px rgba(34, 211, 238, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(34, 211, 238, 0.8), 0 0 60px rgba(34, 211, 238, 0.5);
  }
}

.neon-glow {
  animation: neon-pulse 2s ease-in-out infinite;
}

/* Glassmorphism utility */
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
