const UserService = require("./auth.service");


const SignupController = async (req, res) => {
  try {
    const { first_name, last_name, email, password, bio } = req.body;

    const response = await UserService.Signup({
      first_name,
      last_name,
      email,
      password,
      bio,
    });

    if (response.code === 201) {
      // return token + user info to client
      return res.status(201).json({
        success: true,
        message: response.message,
        user: response.data.user,
        token: response.data.token,
      });
    }

    return res.status(response.code).json({
      success: false,
      message: response.message,
    });
  } catch (err) {
    console.error("SignupController error:", err);
    return res.status(500).json({
      success: false,
      message: "Unexpected error occurred",
    });
  }
};


const LoginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const response = await UserService.Login({ email, password });

    if (response.code === 200) {
      // return token + user info
      return res.status(200).json({
        success: true,
        message: response.message,
        user: response.data.user,
        token: response.data.token,
      });
    }

    return res.status(response.code).json({
      success: false,
      message: response.message,
    });
  } catch (err) {
    console.error("LoginController error:", err);
    return res.status(500).json({
      success: false,
      message: "Unexpected error occurred",
    });
  }
};

module.exports = {
  SignupController,
  LoginController,
};