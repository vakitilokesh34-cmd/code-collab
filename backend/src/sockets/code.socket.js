import Room from "../models/Room.js";
import { executeCode } from "../services/judge0Service.js";

const codeSocket = (io, socket) => {
  socket.on("code:change", async ({ roomId, code }) => {
    try {
      await Room.updateOne({ roomId }, { code });
      socket.to(roomId).emit("code:sync", { code });
      io.to(roomId).emit("activity:log", `${socket.user?.username || "Someone"} is typing...`);
    } catch (error) {
      socket.emit("error", { message: "Code sync failed" });
    }
  });

  socket.on("input:update", ({ roomId, input }) => {
    socket.to(roomId).emit("input:sync", { input });
  });

  socket.on("code:run", async ({ roomId, code, language, input }) => {
    console.log(`Running code for room ${roomId} in ${language}`);

    try {
      const result = await executeCode({ code, language, input });

      if (result.status === "Error") {
        socket.emit("error", { message: result.error });
        return;
      }

      io.to(roomId).emit("code:output", {
        output: result.output || "No output",
        error: result.error || "",
        status: result.status,
      });
    } catch (error) {
      console.error("Code Execution Error:", error.message);
      socket.emit("error", { message: "Code execution failed: " + error.message });
    }
  });
};

export default codeSocket;
