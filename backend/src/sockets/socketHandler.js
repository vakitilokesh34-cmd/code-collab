import roomSocket from "./room.socket.js";
import fileSocket from "./file.socket.js";
import codeSocket from "./code.socket.js";
import cursorSocket from "./cursor.socket.js";
import chatSocket from "./chat.socket.js";

// socket entry
const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log(
      "User connected:",
      socket.id
    );

    socket.onAny((event, ...args) => {
      console.log(`[Socket ${socket.id}] RECEIVED EVENT:`, event, args);
    });

    try {
      // room events
      roomSocket(io, socket);

      // file events
      fileSocket(io, socket);

      // code events
      codeSocket(io, socket);

      // cursor events
      cursorSocket(io, socket);

      // chat events
      chatSocket(io, socket);

    } catch (error) {

      console.log(
        "Socket Setup Error:",
        error
      );
    }

    // disconnect
    socket.on("disconnect", () => {
      console.log(
        "User disconnected:",
        socket.id
      );
    });
  });
};

export default socketHandler;