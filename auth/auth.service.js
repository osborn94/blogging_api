const UserModel = require("./auth.model");
const jwtUtil = require("../utils/jwt");

// Signup service
const Signup = async ({ first_name, last_name, email, password, bio }) => {
  try {
    // ensure email is unique
    const existingUser = await UserModel.findOne({
      email: email.toLowerCase(),
    });
    if (existingUser) {
      return {
        code: 400,
        message: "user already exists",
      };
    }

    // create new user
    const user = await UserModel.create({
      first_name: first_name.toLowerCase(),
      last_name: last_name.toLowerCase(),
      email: email.toLowerCase(),
      password,
      bio,
    });

    // generate token
    const token = jwtUtil.encode({
      id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    });

    return {
      code: 201,
      message: "User created successfully",
      data: {
        user: {
          id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
        },
        token,
      },
    };
  } catch (err) {
    return {
      code: 500,
      message: "Signup failed",
      error: err.message,
    };
  }
};

// Login service
const Login = async ({ email, password }) => {
  try {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return {
        code: 401,
        message: "Invalid credentials",
      };
    }

    // verify password
    const isValidPassword = await user.isValidPassword(password);
    if (!isValidPassword) {
      return {
        code: 401,
        message: "Invalid credentials",
      };
    }

    // generate token
    const token = jwtUtil.encode({
      id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    });

    return {
      code: 200,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
        },
        token,
      },
    };
  } catch (err) {
    return {
      code: 500,
      message: "Login failed",
      error: err.message,
    };
  }
};

module.exports = { Signup, Login };
