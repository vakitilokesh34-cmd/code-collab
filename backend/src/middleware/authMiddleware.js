import jwt from "jsonwebtoken";

// verify jwt token
const authMiddleware = (
  req,
  res,
  next
) => {

  try {

    const authHeader =
      req.headers.authorization;

    // token missing
    if (!authHeader) {

      return res.status(401).json({
        message:
          "No token provided",
      });
    }

    // invalid format
    if (
      !authHeader.startsWith(
        "Bearer "
      )
    ) {

      return res.status(401).json({
        message:
          "Invalid token format",
      });
    }

    // extract token
    const token =
      authHeader.split(
        " "
      )[1];

    // verify token
    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    // attach user
    req.user = decoded;

    next();

  } catch (error) {

    console.log(
      "AUTH ERROR:"
    );

    console.log(
      error.message
    );

    res.status(401).json({
      message:
        "Invalid or expired token",
    });
  }
};

export default authMiddleware;