// imports
import express from "express";
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

app.use(cors());

app.get('/', (req, res) => {
    res.send('Server is running');
});

const players = {};
const RADIUS_TO_TAG = 30;

function distance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function randomPosition() {
    return Math.floor(Math.random() * 500) + 50;
}

// WebSocket logic
io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    const role = Object.values(players).some(p => p.role === 'seeker') ? 'hider' : 'seeker';

    players[socket.id] = {
        id: socket.id,
        x: randomPosition(),
        y: randomPosition(),
        role,
        username: "Anonymous",
    };

    socket.on("set username", (name) => {
        if (players[socket.id]) {
            players[socket.id].username = name || "Anonymous";
        }
    });

    io.emit('players update', players);

    // Movement logic + tagging
    socket.on('move', ({ x, y }) => {
        const player = players[socket.id];
        if (!player) return;

        player.x = x;
        player.y = y;

        if (player.role === 'seeker') {
            for (const [id, otherPlayer] of Object.entries(players)) {
                if (
                    id !== socket.id &&
                    otherPlayer.role === 'hider' &&
                    distance(player, otherPlayer) <= RADIUS_TO_TAG
                ) {
                    const hiderSocket = io.sockets.sockets.get(id);
                    if (hiderSocket) {
                        console.log(`Hider ${id} was caught by ${socket.id}`);
                        hiderSocket.emit('caught');
                        hiderSocket.disconnect(true); // remove hider from server
                        delete players[id];
                    }
                }
            }
        }

        io.emit('players update', players);
    });

    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        delete players[socket.id];
        io.emit('players update', players);
    });
});

const PORT = 5001;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
