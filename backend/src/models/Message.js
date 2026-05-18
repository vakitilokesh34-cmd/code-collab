import { Schema,model } from "mongoose";

// stores room chat messages
const messageSchema = new  Schema(
  {
    // room reference
    roomId: {
      type: String,
      required: true,
    },

    // sender username
    sender: {
      type: String,
      required: true,
    },

    // message text
    text: {
      type: String,
      required: true,
    },

    // optional user reference
    user: {
      type:Schema.Types.ObjectId,
      ref: "User",
    },
  },

  {
    timestamps: true,
  }
);

const Message = model(
  "Message",
  messageSchema
);

export default Message;