const whiteboardSocket = (io, socket) => {
  socket.on("whiteboard:draw", (data) => {
    const { roomId } = data;
    socket.to(roomId).emit("whiteboard:draw", data);
  });

  socket.on("whiteboard:clear", (data) => {
    const { roomId } = data;
    socket.to(roomId).emit("whiteboard:clear");
  });
};

export default whiteboardSocket;
