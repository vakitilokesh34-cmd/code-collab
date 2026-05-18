# CodeCollab

A **real-time collaborative code editor** that enables multiple developers to write, edit, and execute code together in shared rooms. Built with a modern stack featuring live cursors, in-room chat, file management, and multi-language code execution via Judge0 API.

---

## Features

- **User Authentication** -- Register and login with JWT-based auth (bcrypt password hashing)
- **Collaborative Rooms** -- Create or join rooms with a unique room ID; share the link to invite others
- **Real-Time Code Editing** -- Syncs code changes instantly across all room members using Socket.IO and Monaco Editor
- **Live Cursor Tracking** -- See where other users are typing in real time
- **Multi-File Support** -- Create, rename, delete files within a room with a built-in file explorer
- **In-Room Chat** -- Send and receive messages with other room members
- **Code Execution** -- Run code (JavaScript, Python, C++, Java) via the Judge0 API with custom input
- **Input / Output Console** -- Provide stdin input and view stdout, stderr, and compile output
- **Language Selection** -- Switch between supported languages per room
- **Shareable Room Links** -- Copy room link to clipboard to invite collaborators

---

## Tech Stack

| Layer       | Technology                                                    |
| ----------- | ------------------------------------------------------------- |
| Frontend    | React 19, Vite, Tailwind CSS, PostCSS, Monaco Editor          |
| Backend     | Node.js, Express.js, Socket.IO                                |
| Database    | MongoDB with Mongoose ODM                                     |
| Auth        | JWT (jsonwebtoken) + bcryptjs                                 |
| Code Exec   | Judge0 API (RapidAPI)                                         |
| Icons       | lucide-react                                                  |
| HTTP Client | axios                                                         |

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [MongoDB](https://www.mongodb.com/) (local instance or Atlas URI)
- (Optional) [Judge0 API key](https://ce.judge0.com/) -- the app uses the free tier by default

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/codecollab.git
cd codecollab
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/src/` (or edit the existing one):

```env
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/codecollab
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
```

### 3. Frontend setup

```bash
cd frontend
npm install
```

---

## Execution

### Start the backend

```bash
cd backend
npm run dev
```

The server starts at `http://localhost:4000`.

### Start the frontend

```bash
cd frontend
npm run dev
```

The Vite dev server starts at `http://localhost:5173` (proxies API and Socket.IO to the backend).

### Build for production

```bash
cd frontend
npm run build
npm run preview
```

---

## Project Structure

```
codecollab/
├── backend/
│   └── src/
│       ├── server.js            # Entry point -- Express + Socket.IO + MongoDB
│       ├── app.js               # Express app config (routes, middleware)
│       ├── .env                 # Environment variables
│       ├── controllers/         # Route handlers (auth, room)
│       ├── middleware/          # Auth & error middleware
│       ├── models/              # Mongoose models (User, Room, File)
│       ├── routes/              # Express routes (auth, room)
│       ├── services/            # Judge0 code execution service
│       ├── sockets/             # Socket.IO event handlers
│       │   ├── socketHandler.js # Entry: wires up all socket modules
│       │   ├── room.socket.js   # Join/leave room events
│       │   ├── code.socket.js   # Real-time code sync
│       │   ├── cursor.socket.js # Live cursor tracking
│       │   ├── chat.socket.js   # In-room chat
│       │   └── file.socket.js   # File CRUD events
│       └── utils/               # Helpers (room ID gen, language map)
│
├── frontend/
│   └── src/
│       ├── main.jsx             # React entry point
│       ├── App.jsx              # Router setup
│       ├── pages/               # Route pages (Home, Room, Login, SignUp)
│       ├── components/          # UI components
│       │   ├── auth/            # SignUpForm, LoginForm
│       │   ├── chat/            # ChatBox, ChatInput, ChatMessage
│       │   ├── common/          # Button, Input, Modal, Loader, NavBar
│       │   ├── editor/          # MonacoEditor, FileExplorer, EditorTabs,
│       │   │                    # LanguageSelector, InputConsole, OutputConsole,
│       │   │                    # RunButton
│       │   └── room/            # RoomHeader, ShareRoom, CursorTracker,
│       │                        # OnlineUser, UserList
│       ├── context/             # AuthContext, SocketContext
│       ├── hooks/               # useSocket, useEditor, useChat
│       ├── services/            # api.js (axios), socket.js (client)
│       └── utils/               # formatTime, copyRoomLink, languageMap
│
└── README.md
```

---

## API Endpoints

### Auth `/api/auth`
| Method | Path       | Description        |
| ------ | ---------- | ------------------ |
| POST   | `/register` | Register a new user |
| POST   | `/login`    | Login and get JWT   |
| GET    | `/profile`  | Get logged-in user  |

### Rooms `/api/rooms`
| Method | Path          | Description          |
| ------ | ------------- | -------------------- |
| POST   | `/create`     | Create a new room     |
| GET    | `/`           | Get all rooms         |
| GET    | `/:roomId`    | Get room details      |
| DELETE | `/:roomId`    | Delete a room         |

---

## Socket Events

| Event                   | Direction       | Description                    |
| ----------------------- | --------------- | ------------------------------ |
| `room:join`             | client → server | Join a room                    |
| `room:leave`            | client → server | Leave a room                   |
| `code:change`           | client → server | Broadcast code changes         |
| `code:update`           | server → client | Receive code changes           |
| `cursor:move`           | client → server | Broadcast cursor position      |
| `cursor:update`         | server → client | Receive cursor positions       |
| `chat:send`             | client → server | Send a chat message            |
| `chat:receive`          | server → client | Receive a chat message         |
| `file:create`           | client → server | Create a new file              |
| `file:rename`           | client → server | Rename a file                  |
| `file:delete`           | client → server | Delete a file                  |
| `file:updated`          | server → client | Notify file changes            |

---

## License

ISC
