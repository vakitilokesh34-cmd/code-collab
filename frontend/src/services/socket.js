import { io } from "socket.io-client";

let socket = null;

export const connectSocket = () => {

  if (socket) {
    return socket;
  }

  const token = localStorage.getItem("token");

  // don't connect if not authenticated
  if (!token) {
    console.log("No token - socket not connected");
    return null;
  }

  const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  socket = io(backendUrl, {
    autoConnect: true,
    auth: { token },
    transports: ["polling", "websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on(
    "connect",
    () => {

      console.log(
        "SOCKET CONNECTED:",
        socket.id
      );
    }
  );

  socket.on(
    "disconnect",
    () => {

      console.log(
        "SOCKET DISCONNECTED"
      );
    }
  );

  socket.on(
    "connect_error",
    (err) => {

      console.log(
        "SOCKET ERROR:",
        err.message
      );
    }
  );

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket =
  () => socket;