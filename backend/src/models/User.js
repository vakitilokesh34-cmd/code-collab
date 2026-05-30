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

    // hashed password (optional for OAuth users)
    password: {
      type: String,
      minlength: 6,
    },

    // oauth provider
    provider: {
      type: String,
      enum: ["local", "google", "github"],
      default: "local",
    },

    // oauth provider user id
    providerId: {
      type: String,
    },

    // avatar url from provider
    avatar: {
      type: String,
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