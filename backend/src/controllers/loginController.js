export const login = async (
  req,
  res
) => {

  try {

    const {
      email,
      password,
    } = req.body;

    // find user
    const user =
      await User.findOne({
        email,
      });

    if (!user) {
      return res.status(404).json({
        message:
          "User not found",
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

    // generate token
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

    res.json({
      message:
        "Login successful",
      token,
      user,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message:
        "Login failed",
    });
  }
};