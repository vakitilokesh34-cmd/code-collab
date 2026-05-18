import Room from "../models/Room.js";

// file events
const fileSocket = (io, socket) => {
  // create file
  socket.on(
    "file:create",
    async ({
      roomId,
      fileName,
    }) => {
      try {
        const room =
          await Room.findOne({
            roomId,
          });

        if (!room) {
          return socket.emit(
            "error",
            {
              message:
                "Room not found",
            }
          );
        }

        const exists =
          room.files.find(
            (file) =>
              file.name ===
              fileName
          );

        if (exists) {
          return socket.emit(
            "error",
            {
              message:
                "File already exists",
            }
          );
        }

        room.files.push({
          name: fileName,
          content: "",
        });

        await room.save();

        io.to(roomId).emit(
          "files:sync",
          {
            files:
              room.files,
          }
        );
      } catch (error) {
        socket.emit("error", {
          message:
            "Failed to create file",
        });
      }
    }
  );

  // update file
  socket.on(
    "file:update",
    async ({
      roomId,
      fileName,
      content,
    }) => {
      try {
        const room =
          await Room.findOne({
            roomId,
          });

        if (!room) return;

        const file =
          room.files.find(
            (file) =>
              file.name ===
              fileName
          );

        if (!file) return;

        file.content = content;

        await room.save();

        socket.to(roomId).emit(
          "file:sync",
          {
            fileName,
            content,
          }
        );
      } catch (error) {
        socket.emit("error", {
          message:
            "Failed to update file",
        });
      }
    }
  );

  // delete file
  socket.on(
    "file:delete",
    async ({
      roomId,
      fileName,
    }) => {
      try {
        const room =
          await Room.findOne({
            roomId,
          });

        if (!room) return;

        room.files =
          room.files.filter(
            (file) =>
              file.name !==
              fileName
          );

        await room.save();

        io.to(roomId).emit(
          "files:sync",
          {
            files:
              room.files,
          }
        );
      } catch (error) {
        socket.emit("error", {
          message:
            "Failed to delete file",
        });
      }
    }
  );

  // rename file
  socket.on("file:rename", async ({ roomId, oldName, newName }) => {
    try {
      const room = await Room.findOne({ roomId });
      if (!room) return;

      const file = room.files.find(f => f.name === oldName);
      if (!file) return;

      file.name = newName;
      await room.save();

      io.to(roomId).emit("files:sync", { files: room.files });
    } catch (error) {
      socket.emit("error", { message: "Failed to rename file" });
    }
  });
};

export default fileSocket;