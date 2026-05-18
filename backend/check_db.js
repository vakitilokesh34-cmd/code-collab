import mongoose from "mongoose";
import dotenv from "dotenv";
import Room from "./src/models/Room.js";

dotenv.config();

async function checkRooms() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const rooms = await Room.find({});
    console.log("Existing Rooms:", rooms.map(r => ({ roomId: r.roomId, users: r.users.length })));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkRooms();
