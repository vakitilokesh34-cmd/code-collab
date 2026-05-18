import {connect} from "mongoose";

// mongodb connection
export const connectDB = async () => {
  try {
    await connect(
      process.env.MONGO_URI
    );

    console.log(
      "MongoDB Connected"
    );
  } catch (error) {
    console.log(
      "Database Error:",
      error.message
    );

    process.exit(1);
  }
};

export default connectDB;