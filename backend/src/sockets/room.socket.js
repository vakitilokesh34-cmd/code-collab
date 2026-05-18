import Room from "../models/Room.js";

// room events
const roomSocket = (io, socket) => {
  // create room
  socket.on("room:create", async ({ roomId, username, roomName, language = "javascript", password }) => {
    console.log("DEBUG: room:create", { roomId, username });
    try {
      const exists = await Room.findOne({ roomId });
      if (exists) {
        return socket.emit("error", { message: "Room already exists" });
      }

      const uid = socket.user?.id || `guest-${socket.id}`;
      const room = await Room.create({
        roomId,
        roomName,
        language,
        password,
        owner: uid,
        code: "",
        files: [{ name: "main.js", content: "" }],
        users: [{ socketId: socket.id, username, userId: uid }],
      });

      socket.join(roomId);
      
      io.to(roomId).emit("room:info", {
        roomId: room.roomId,
        roomName: room.roomName,
        owner: room.owner,
        language: room.language
      });
      
      io.to(roomId).emit("room:users", room.users || []);
      
      // Confirm creation to the owner
      socket.emit("room:created", { roomId });
      
      console.log("Room created and info emitted");
    } catch (error) {
      console.error("ROOM CREATE ERROR:", error);
      socket.emit("error", { message: "Failed to create room: " + error.message });
    }
  });

  // join room
  socket.on("room:join", async ({ roomId, username, password }) => {
    console.log(`DEBUG: room:join START - roomId: [${roomId}] (length: ${roomId?.length}) - user: ${username}`);
    console.log(`DEBUG: JSON roomId: ${JSON.stringify(roomId)}`);
    try {
      const room = await Room.findOne({ roomId });
      console.log("DEBUG: room:join FIND_ONE RESULT:", room ? "FOUND" : "NOT FOUND");
      
      if (!room) {
        return socket.emit("error", { message: "Room not found" });
      }

      if (room.password && room.password !== password) {
        return socket.emit("error", { message: "Incorrect password" });
      }

      socket.join(roomId);

      const userExists = room.users.find(u => u.socketId === socket.id);
      if (!userExists) {
        const uid = socket.user?.id || `guest-${socket.id}`;
        console.log(`DEBUG: room:join - Adding user ${username} with ID ${uid}`);
        room.users.push({ 
          socketId: socket.id, 
          username: username || "Guest", 
          userId: uid 
        });
        await room.save();
        console.log("DEBUG: room:join USER ADDED AND SAVED");
      }

      socket.emit("room:info", {
        roomId: room.roomId,
        roomName: room.roomName,
        owner: room.owner,
        language: room.language
      });
      
      socket.emit("code:sync", { code: room.code });
      socket.emit("files:sync", { files: room.files });

      console.log(`DEBUG: room:join successful. Current room.users count: ${room.users?.length}`);
      
      // Deduplicate users for the UI
      const uniqueUsersMap = {};
      room.users.forEach(u => {
        const uid = u.userId?.toString() || u.socketId;
        if (!uniqueUsersMap[uid]) {
          uniqueUsersMap[uid] = u.toObject ? u.toObject() : u;
        }
      });
      const uniqueUsers = Object.values(uniqueUsersMap);
      
      console.log(`DEBUG: Sending ${uniqueUsers.length} unique users: ${JSON.stringify(uniqueUsers.map(u => u.username))}`);
      io.to(roomId).emit("room:users", uniqueUsers);
      io.to(roomId).emit("activity:log", `${username} joined`);

      console.log(`Room joined successfully: ${roomId}`);
    } catch (error) {
      console.error("ROOM JOIN ERROR:", error);
      socket.emit("error", { message: "Join room failed: " + error.message });
    }
  });

  // Change Ownership
  socket.on("room:change-owner", async ({ roomId, newOwnerId }) => {
    try {
      const room = await Room.findOne({ roomId });
      if (!room) return socket.emit("error", { message: "Room not found" });

      const currentUid = socket.user?.id || `guest-${socket.id}`;
      if (room.owner.toString() !== currentUid.toString()) {
        return socket.emit("error", { message: "Only the admin can transfer ownership" });
      }

      room.owner = newOwnerId;
      await room.save();

      io.to(roomId).emit("room:info", {
        roomId: room.roomId,
        roomName: room.roomName,
        owner: room.owner,
        language: room.language
      });
      
      const newOwner = room.users.find(u => u.userId?.toString() === newOwnerId.toString())?.username || "Another user";
      io.to(roomId).emit("activity:log", `Ownership transferred to ${newOwner}`);
    } catch (error) {
      console.error("CHANGE OWNER ERROR:", error);
      socket.emit("error", { message: "Failed to transfer ownership" });
    }
  });

  // Handle disconnect
  socket.on("disconnect", async () => {
    try {
      const rooms = await Room.find({ "users.socketId": socket.id });
      for (const room of rooms) {
        const user = room.users.find(u => u.socketId === socket.id);
        const username = user ? user.username : "A user";
        
        room.users = room.users.filter(u => u.socketId !== socket.id);
        
        // Auto-assign new owner if current owner leaves
        const currentUid = user.userId?.toString();
        if (room.owner.toString() === currentUid && room.users.length > 0) {
          room.owner = room.users[0].userId;
          io.to(room.roomId).emit("room:info", {
            roomId: room.roomId,
            roomName: room.roomName,
            owner: room.owner,
            language: room.language
          });
          const newOwner = room.users[0].username;
          io.to(room.roomId).emit("activity:log", `Admin left. ${newOwner} is the new admin.`);
        }

        // Use updateOne to avoid VersionError from parallel saves
        await Room.updateOne(
          { _id: room._id },
          { $set: { users: room.users, owner: room.owner } }
        );

        // Broadcast unique users
        const uniqueUsersMap = {};
        room.users.forEach(u => {
          const uid = u.userId?.toString() || u.socketId;
          if (!uniqueUsersMap[uid]) {
            uniqueUsersMap[uid] = u.toObject ? u.toObject() : u;
          }
        });
        const uniqueUsers = Object.values(uniqueUsersMap);
        
        io.to(room.roomId).emit("room:users", uniqueUsers);
        io.to(room.roomId).emit("activity:log", `${username} left`);
        io.to(room.roomId).emit("cursor:remove", socket.id);
      }
    } catch (error) {
      console.error("DISCONNECT ERROR:", error);
    }
  });
};

export default roomSocket;