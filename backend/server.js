//imports
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


//CORS for HTTP routes here. CORS for webSockets defined above
app.use(cors());



app.get('/', (req, res) => {
    res.send('Server is running');
});


io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
});


//Connected players
const players = {};


//generating random positions
function randomPosition() {
    return Math.floor(Math.random() * 500) + 50;
}
// Handle WebSocket connections
io.on('connection', (socket) => {

    console.log(`Player connected: ${socket.id}`);


    // Assign role: first one is seeker
    const role = Object.values(players).some(p => p.role === 'seeker') ? 'hider' : 'seeker';

    // Add player to list
    players[socket.id] = {
        id: socket.id,
        x: randomPosition(),
        y: randomPosition(),
        role,
    };
    console.log(Object.keys(players).length);

    // Broadcast updated player list
    io.emit('players update', players);

    // Update player position
    socket.on('move', ({ x, y }) => {
        if (players[socket.id]) {
            players[socket.id].x = x;
            players[socket.id].y = y;
            io.emit('players update', players);
        }
    });

    // Remove on disconnect
    socket.on('disconnect', () => {
        console.log("player disconnected!");
        delete players[socket.id];  // 💥 This removes player from queue
        io.emit('players update', players);  // Broadcast update
        console.log(Object.keys(players).length);
    });
});



const PORT = 5001;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
})