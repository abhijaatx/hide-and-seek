import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io(import.meta.env.VITE_BACKEND_URL);

const PLAYER_RADIUS = 25;
const VISIBLE_DISTANCE = 100;

function isWithinRadius(p1, p2, radius = VISIBLE_DISTANCE) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy) <= radius;
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function App() {
  const CANVAS_WIDTH = window.innerWidth;
  const CANVAS_HEIGHT = window.innerHeight;

  useEffect(() => {
    const username = localStorage.getItem("username");
    socket.emit("set username", username); // custom event to set it on the backend
  }, []);


  const [players, setPlayers] = useState({});
  const [me, setMe] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    socket.on('players update', (data) => {
      setPlayers(data);
      setMe(data[socket.id]);
    });

    socket.on('caught', () => {
      alert('You were caught by the seeker!');
      socket.disconnect();
    });

    return () => {
      socket.off('players update');
      socket.off('caught');
    };
  }, []);

  useEffect(() => {
    if (Object.keys(players).length > 1 && !isTimerRunning) {
      setIsTimerRunning(true);
    }
  }, [players]);

  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  useEffect(() => {
    const handleKey = (e) => {
      if (!me) return;

      let { x, y } = me;
      const step = me.role === 'seeker' ? 45 : 30;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          y = Math.max(PLAYER_RADIUS, y - step);
          break;
        case 'ArrowDown':
        case 's':
          y = Math.min(CANVAS_HEIGHT - PLAYER_RADIUS, y + step);
          break;
        case 'ArrowLeft':
        case 'a':
          x = Math.max(PLAYER_RADIUS, x - step);
          break;
        case 'ArrowRight':
        case 'd':
          x = Math.min(CANVAS_WIDTH - PLAYER_RADIUS, x + step);
          break;
        default:
          return;
      }

      socket.emit('move', { x, y });
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [me]);

  const playerCount = Object.keys(players).length;

  return (
    <div className="w-screen h-screen relative overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/images/background.jpg')" }}
      />

      {/* Background music */}
      <audio autoPlay loop>
        <source src="/music/background.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      {/* Game Info Box */}
      {me && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 text-center">
          <div className="bg-white bg-opacity-80 backdrop-blur-md rounded-md px-4 py-2 shadow-lg inline-block">
            <p className="text-lg font-semibold">
              <span className={me.role === "seeker" ? "text-red-600" : "text-blue-600"}>
                You are: {me.role === "seeker" ? "Seeker 🟥" : "Hider 🟦"}
              </span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Players online: <span className="font-semibold">{playerCount}</span>
            </p>
            {isTimerRunning && (
              <p className="text-sm text-gray-600 mt-1">
                Game Time: <span className="font-semibold">{formatTime(timer)}</span>
              </p>
            )}
            <p className="text-sm text-gray-600">
              Use <kbd>WASD</kbd> or <kbd>Arrow Keys</kbd> to move
            </p>
          </div>
        </div>
      )}

      {/* Player Avatars */}
      <svg width="100%" height="100%" className="absolute top-0 left-0 z-10">
        {Object.values(players).map((p) => {
          const isVisible =
            me?.role === "seeker"
              ? p.role === "seeker" || isWithinRadius(me, p)
              : true;

          if (!isVisible) return null;

          const imageSize = PLAYER_RADIUS * 2;
          const imageSrc = p.role === "seeker" ? "/images/seeker.jpg" : "/images/hider.jpg";

          return (
            <g key={p.id}>
              <image
                href={imageSrc}
                x={p.x - PLAYER_RADIUS}
                y={p.y - PLAYER_RADIUS}
                width={imageSize}
                height={imageSize}
                clipPath="circle(50%)"
              />
              <text
                x={p.x}
                y={p.y + PLAYER_RADIUS + 15}
                textAnchor="middle"
                fill="white"
                fontSize="12"
                fontFamily="sans-serif"
              >
                {p.username || "Player"}
              </text>
            </g>
          );
        })}
      </svg>


      {/* Mobile Controls */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex flex-col items-center gap-2 md:hidden">
        <button
          className="bg-white bg-opacity-80 p-4 rounded-full shadow-md"
          onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))}
        >
          ⬆️
        </button>
        <div className="flex gap-6">
          <button
            className="bg-white bg-opacity-80 p-4 rounded-full shadow-md"
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))}
          >
            ⬅️
          </button>
          <button
            className="bg-white bg-opacity-80 p-4 rounded-full shadow-md"
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))}
          >
            ⬇️
          </button>
          <button
            className="bg-white bg-opacity-80 p-4 rounded-full shadow-md"
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))}
          >
            ➡️
          </button>
        </div>
      </div>
    </div>

  );
}

export default App;
