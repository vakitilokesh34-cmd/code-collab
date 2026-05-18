import { Schema, model } from "mongoose";

// stores application users
const userSchema = new Schema(
  {
    // display name
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // login email
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // hashed password
    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // online status
    isOnline: {
      type: Boolean,
      default: false,
    },

    // last active time
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },

  {
    timestamps: true,
  }
);

const User = model(
  "User",
  userSchema
);

export default User;