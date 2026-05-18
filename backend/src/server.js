import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";

import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import socketHandler from "./sockets/socketHandler.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// socket setup
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Dynamically allow all origins to prevent CORS errors on any deployment (like Vercel) or local ports
      callback(null, true);
    },
    methods: ["GET", "POST"],
  },
});

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);

app.get("/", (req, res) => {
  res.send("CodeCollab Backend Server is running!");
});

// socket auth middleware
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      console.log("No token provided for socket connection");
      return next(new Error("Authentication error"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    console.log("Socket authenticated for user:", decoded.id);
    next();
  } catch (error) {
    console.error("Socket Auth Error:", error.message);
    next(new Error("Authentication error"));
  }
});

// socket handler
socketHandler(io);

// db connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("DB Connection Error:", err));

// server start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
