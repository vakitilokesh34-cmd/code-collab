 // cursor events
const cursorSocket = (
  io,
  socket
) => {
  socket.on(
    "cursor:move",
    ({
      roomId,
      line,
      column,
      username,
    }) => {
      socket.to(roomId).emit(
        "cursor:update",
        {
          userId:
            socket.id,

          line,
          column,
          username,
        }
      );
    }
  );
};

export default cursorSocket;