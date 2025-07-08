import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useRef } from 'react';


const socket = io(import.meta.env.VITE_BACKEND_URL);

const PLAYER_RADIUS = 25;
const VISIBLE_DISTANCE = 100;


const audioRef = useRef(null);

const playAudio = () => {
  audioRef.current.play();
};


function isWithinRadius(p1, p2, radius = VISIBLE_DISTANCE) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  playAudio();

  // const pauseAudio = () => {
  //   audioRef.current.pause();
  // };

  return Math.sqrt(dx * dx + dy * dy) <= radius;
}

function App() {
  const CANVAS_WIDTH = window.innerWidth;
  const CANVAS_HEIGHT = window.innerHeight;
  const [players, setPlayers] = useState({});
  const [me, setMe] = useState(null);

  useEffect(() => {
    socket.on('players update', (data) => {
      setPlayers(data);
      setMe(data[socket.id]);
    });

    const handleKey = (e) => {
      if (!me) return;

      let { x, y } = me;
      const step = me.role === 'seeker' ? 25 : 18;

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

  return (


    <div className="relative w-screen h-screen bg-gradient-to-br from-purple-300 via-pink-200 to-blue-200 overflow-hidden">
      {/* Overlay header and role box */}
      {/* <audio autoPlay loop>
        <source src="/music/background.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio> */}

      <audio ref={audioRef} src="/music/caught.mp3" />


      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2"> Hide and Seek</h1>

        {me && (
          <div className="bg-white bg-opacity-80 backdrop-blur-md rounded-md px-4 py-2 shadow-lg inline-block">
            <p className="text-lg font-semibold">
              You are:{" "}
              <span className={me.role === "seeker" ? "text-red-600" : "text-blue-600"}>
                {me.role === "seeker" ? "Seeker 🟥" : "Hider 🟦"}
              </span>
            </p>
            <p className="text-sm text-gray-600">Use <kbd>WASD</kbd> or <kbd>Arrow Keys</kbd> to move</p>
          </div>
        )}
      </div>

      {/* Full-screen game canvas */}
      <svg width="100%" height="100%" className="absolute top-0 left-0">
        {Object.values(players).map((p) => {
          const isMe = p.id === socket.id;
          const isVisible =
            me?.role === 'seeker'
              ? p.role === 'seeker' || isWithinRadius(me, p)
              : true; // hiders can see all hiders

          if (!isVisible) return null;

          const imageSize = PLAYER_RADIUS * 2;
          const imageSrc = p.role === 'seeker' ? 'images/seeker.jpg' : 'images/hider.jpg';

          return (
            <image
              key={p.id}
              href={imageSrc}
              x={p.x - PLAYER_RADIUS}
              y={p.y - PLAYER_RADIUS}
              width={imageSize}
              height={imageSize}
              clipPath="circle(50%)"
            />
          );
        })}
      </svg>

    </div>
  );
}

export default App;