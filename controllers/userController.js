const User = require("../models/userModel");
const expressAsyncHandler = require("express-async-handler");
const { generateToken } = require("../config/jwtToken");
const validateMongoDbId = require("../utils/validateMongoDbId");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const senEmail = require("./emailController");

// create new User
const createUser = expressAsyncHandler(async (req, res) => {
  const findUser = await User.findOne({
    $or: [{ email: req.body.email }, { phone: req.body.phone }],
  });
  if (!findUser) {
    const user = await User.create(req.body);
    res.json({ success: true, user });
  } else {
    throw new Error("User already exist");
  }
});

//login User
const loginUser = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check if user exists
  const user = await User.findOne({ email: email });
  if (user && (await user.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(user?.id);

    //create refresh token
    await User.findByIdAndUpdate(
      user?.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );

    //add refresh token to the response
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      success: true,
      user: {
        _id: user?._id,
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
        token: generateToken(user?._id),
      },
    });
  } else {
    throw new Error("Invalid credentials");
  }
});

//handle refresh token
const handleRefreshToken = expressAsyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No refresh token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error("No refresh token in db or not matched");
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user?.id !== decoded.id) {
      throw new Error("there is something wrong with refresh token");
    }
    const accessToken = generateToken(user?.id);
    res.json({ success: true, accessToken });
  });
});

const logout = expressAsyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No refresh token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });

  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    res.sendStatus(204);
  }
  await User.findOneAndUpdate(refreshToken, {
    refreshToken: "",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(200);
});

//git users list
const getAllUsers = expressAsyncHandler(async (req, res) => {
  try {
    const users = await User.find();
    res.json({ success: true, users });
  } catch (error) {
    throw new Error(error);
  }
});

// get user data
const getUser = expressAsyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const user = await User.findById(id);
    if (user) {
      res.json({ success: true, user });
    } else {
      throw new Error("No users Found");
    }
  } catch (error) {
    throw new Error("No users Found");
  }
});

// get user data
const updateUser = expressAsyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const user = await User.findByIdAndUpdate(
      id,
      {
        ...req?.body,
      },
      { new: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    throw new Error("No users Found");
  }
});

// delete user
const deleteUser = expressAsyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const user = await User.findByIdAndDelete(id);
    res.json({ success: true, user });
  } catch (error) {
    throw new Error("No users Found");
  }
});

const updatePassword = expressAsyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validateMongoDbId(_id);
  const user = await User.findById(_id);
  if (password || password.length < 8) {
    user.password = password;
    const updatedPassword = await user.save();
    res.json({ success: true, user });
  } else {
    // res.json(user)
    res.json({
      success: false,
      message: "please enter at least 6 eight characters password",
    });
  }
});

const forgotPasswordToken = expressAsyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetURL = `Hi, Please follow this link to reset your password, this link will be valid till 10 minuets. <a href='http://localhost:5000/api/user/reset-password/${token}'>Reset password</a>`;
    const data = {
      to: email,
      text: `Hey ${user.name}`,
      subject: 'Forgot Password Link',
      htm: resetURL
    }
    senEmail(data);
    res.json(token);
  } catch (error) {
    throw new Error(error);
  }
});

const resetPassword = expressAsyncHandler(
  async (req,res) => {
    const {password} = req.body;
    const {token} = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: {$gt: Date.now()}
    })
    if(!user) throw new Error('Token expired');
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json({
      success: true,
      user
    })
  }
)

module.exports = {
  createUser,
  loginUser,
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgotPasswordToken,
  resetPassword
};
