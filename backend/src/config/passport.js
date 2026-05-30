import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import User from "../models/User.js";

const registerStrategies = () => {
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      "google",
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: `${process.env.API_URL}/api/auth/google/callback`,
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            let user = await User.findOne({
              $or: [
                { providerId: profile.id, provider: "google" },
                { email: profile.emails?.[0]?.value },
              ],
            });

            if (user) {
              if (user.provider === "local") {
                user.provider = "google";
                user.providerId = profile.id;
                user.avatar = user.avatar || profile.photos?.[0]?.value;
                await user.save();
              }
              return done(null, user);
            }

            const email = profile.emails?.[0]?.value || `${profile.id}@google-oauth.com`;

            user = await User.create({
              username: profile.displayName.replace(/\s+/g, "_").toLowerCase() + "_" + profile.id.slice(-4),
              email,
              provider: "google",
              providerId: profile.id,
              avatar: profile.photos?.[0]?.value,
              isOnline: true,
            });

            done(null, user);
          } catch (error) {
            done(error, null);
          }
        }
      )
    );
  }

  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(
      "github",
      new GitHubStrategy(
        {
          clientID: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          callbackURL: `${process.env.API_URL}/api/auth/github/callback`,
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            let user = await User.findOne({
              $or: [
                { providerId: profile.id, provider: "github" },
                { email: profile.emails?.[0]?.value },
              ],
            });

            if (user) {
              if (user.provider === "local") {
                user.provider = "github";
                user.providerId = profile.id;
                user.avatar = user.avatar || profile.photos?.[0]?.value;
                await user.save();
              }
              return done(null, user);
            }

            const email = profile.emails?.[0]?.value || `${profile.id}@github-oauth.com`;

            user = await User.create({
              username: (profile.displayName || profile.username).replace(/\s+/g, "_").toLowerCase() + "_" + profile.id.slice(-4),
              email,
              provider: "github",
              providerId: profile.id,
              avatar: profile.photos?.[0]?.value,
              isOnline: true,
            });

            done(null, user);
          } catch (error) {
            done(error, null);
          }
        }
      )
    );
  }
};

registerStrategies();

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
