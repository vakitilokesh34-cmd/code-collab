import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// register user
export const register = async (
  req,
  res
) => {

  try {

    const {
      username,
      email,
      password,
    } = req.body;

    // existing user
    const exists =
      await User.findOne({
        $or: [
          { email },
          { username },
        ],
      });

    if (exists) {
      return res.status(400).json({
        message:
          "User already exists",
      });
    }

    // hash password
    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    // create user
    const user =
      await User.create({
        username,
        email,
        password:
          hashedPassword,
      });

    // token
    const token =
      jwt.sign(
        {
          userId: user._id,
        },

        process.env.JWT_SECRET,

        {
          expiresIn: "7d",
        }
      );

    res.status(201).json({
      message:
        "User registered",
      token,
      user,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message:
        "Registration failed",
    });
  }
};