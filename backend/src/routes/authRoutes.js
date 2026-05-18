import express from "express";

import {
  signup,
  login,
  getProfile,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// register user
router.post(
  "/register",
  signup
);

// login user
router.post(
  "/login",
  login
);

// logged in profile
router.get(
  "/profile",
  authMiddleware,
  getProfile
);

export default router;