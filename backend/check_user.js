import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";

dotenv.config();

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
    
    const user = await User.findOne({ email: "jay@gmail.com" });
    if (user) {
      console.log("User found:");
      console.log("- Username:", user.username);
      console.log("- Email:", user.email);
      console.log("- Password (hashed):", user.password);
    } else {
      console.log("User 'jay@gmail.com' NOT found in database.");
      const allUsers = await User.find({}, { email: 1 });
      console.log("Current users in DB:", allUsers.map(u => u.email));
    }
    
    await mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err);
  }
};

checkUser();
