# 🕹️ Multiplayer Hide-and-Seek Game

This is a real-time multiplayer game inspired by the classic game of hide-and-seek. Built using **React**, **Tailwind CSS**, **Socket.IO**, and **Node.js**, this game allows players to join as either **Hiders** or **Seekers**, move around the screen, and interact in real time.

---

## 🚀 Features

- 🔁 Real-time communication using WebSockets
- 🧍 Multiple players with automatic role assignment (Hider or Seeker)
- ⏱️ Game timer that starts when more than one player joins
- 💻 Keyboard controls (WASD or Arrow keys)
- 📱 Mobile touch controls for movement
- 🌐 Responsive UI with smooth animations
- 🧑 Player usernames displayed under each character
- 👁️ Limited vision radius for Seekers
- 🔊 Background music
- 🖼️ Dynamic canvas rendering using SVG

---

## 🧩 Technologies

- **Frontend**: React, Tailwind CSS, SVG
- **Backend**: Node.js, Express, Socket.IO
- **Bundler**: Vite

---

## 📦 Installation

### Clone the Repository

```bash
git clone https://github.com/your-username/hide-and-seek-game.git
cd hide-and-seek-game
```
## Backend Setup

- cd backend
- npm install
- node server.js

## Frontend Setup

- cd frontend
- npm install
- node run dev
- Dont forget to initialise .env in Frontend with "VITE_BACKEND_URL=http://localhost:5001"


