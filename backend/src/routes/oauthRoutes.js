import express from "express";
import jwt from "jsonwebtoken";
import passport from "../config/passport.js";

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const handleOAuthRedirect = (req, res) => {
  const token = generateToken(req.user._id);
  const user = {
    id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    avatar: req.user.avatar,
  };
  const encoded = encodeURIComponent(JSON.stringify(user));
  res.redirect(`${process.env.FRONTEND_URL}/oauth/callback?token=${token}&user=${encoded}`);
};

// initiate google oauth
router.get("/google", (req, res, next) => {
  if (!passport._strategies.google) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=google_not_configured`);
  }
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});

// google oauth callback
router.get("/google/callback", (req, res, next) => {
  if (!passport._strategies.google) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=google_not_configured`);
  }
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`,
  })(req, res, next);
}, handleOAuthRedirect);

// initiate github oauth
router.get("/github", (req, res, next) => {
  if (!passport._strategies.github) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=github_not_configured`);
  }
  passport.authenticate("github", { scope: ["user:email"] })(req, res, next);
});

// github oauth callback
router.get("/github/callback", (req, res, next) => {
  if (!passport._strategies.github) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=github_not_configured`);
  }
  passport.authenticate("github", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`,
  })(req, res, next);
}, handleOAuthRedirect);

export default router;
