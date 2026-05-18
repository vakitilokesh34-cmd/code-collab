import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";

// generate jwt
const generateToken = (id) => {

  return jwt.sign(
    { id },

    process.env.JWT_SECRET,

    {
      expiresIn: "7d",
    }
  );
};

// signup controller
export const signup = async (
  req,
  res
) => {

  try {

    const {
      username,
      email,
      password,
    } = req.body;

    // validation
    if (
      !username ||
      !email ||
      !password
    ) {

      return res.status(400).json({
        message:
          "All fields are required",
      });
    }

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
      generateToken(
        user._id
      );

    res.status(201).json({

      message:
        "Signup successful",

      token,

      user: {
        id: user._id,
        username:
          user.username,
        email:
          user.email,
      },
    });

  } catch (error) {

    console.log(
      "SIGNUP ERROR:"
    );

    console.log(error);

    res.status(500).json({
      message:
        "Signup failed",
    });
  }
};

// login controller
export const login = async (
  req,
  res
) => {

  try {

    const {
      email,
      password,
    } = req.body;

    // validation
    if (
      !email ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password required",
      });
    }

    // find user
    const user =
      await User.findOne({
        email,
      });

    if (!user) {
      return res.status(404).json({
        message: "Account not found. Please sign up first.",
      });
    }

    // compare password
    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {

      return res.status(400).json({
        message:
          "Invalid credentials",
      });
    }

    // update online status
    user.isOnline = true;

    await user.save();

    // token
    const token =
      generateToken(
        user._id
      );

    res.status(200).json({

      message:
        "Login successful",

      token,

      user: {
        id: user._id,
        username:
          user.username,
        email:
          user.email,
      },
    });

  } catch (error) {

    console.log(
      "LOGIN ERROR:"
    );

    console.log(error);

    res.status(500).json({
      message:
        "Login failed",
    });
  }
};

// current user profile
export const getProfile =
  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.user.id
        ).select(
          "-password"
        );

      if (!user) {

        return res.status(404).json({
          message:
            "User not found",
        });
      }

      res.status(200).json(
        user
      );

    } catch (error) {

      console.log(
        "PROFILE ERROR:"
      );

      console.log(error);

      res.status(500).json({
        message:
          "Failed to fetch profile",
      });
    }
  };