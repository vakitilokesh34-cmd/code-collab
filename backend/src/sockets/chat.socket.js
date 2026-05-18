import Message from "../models/Message.js";

// chat events
const chatSocket = (
  io,
  socket
) => {
  // send message
  socket.on(
    "chat:send",
    async ({
      roomId,
      sender,
      text,
    }) => {
      try {
        const message =
          await Message.create({
            roomId,
            sender,
            text,
          });

        io.to(roomId).emit(
          "chat:message",
          {
            sender,
            text,
            createdAt:
              message.createdAt,
          }
        );

        // activity log
        io.to(roomId).emit(
          "activity:log",
          `${sender} sent a message`
        );
      } catch (error) {
        socket.emit("error", {
          message:
            "Message send failed",
        });
      }
    }
  );

  // chat history
  socket.on(
    "chat:history",
    async ({ roomId }) => {
      try {
        const messages =
          await Message.find({
            roomId,
          }).sort({
            createdAt: 1,
          });

        socket.emit(
          "chat:messages",
          messages
        );
      } catch (error) {
        socket.emit("error", {
          message:
            "Failed to load chats",
        });
      }
    }
  );
};

export default chatSocket;