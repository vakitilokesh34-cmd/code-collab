import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";

import errorMiddleware from "./middleware/errorMiddleware.js";

const app = express();

// middlewares
app.use(cors());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// api routes
app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/rooms",
  roomRoutes
);

// health route
app.get("/", (req, res) => {

  res.status(200).json({
    success: true,
    message:
      "CodeCollab API Running",
  });
});

// 404 handler
app.use((req, res) => {

  res.status(404).json({
    success: false,
    message:
      "Route not found",
  });
});

// error middleware
app.use(errorMiddleware);

export default app;