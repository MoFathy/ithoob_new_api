const User = require("../models/userModel");
const expressAsyncHandler = require("express-async-handler");
const { generateToken } = require("../config/jwtToken");
const validateMongoDbId = require("../utils/validateMongoDbId");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt  = require("jsonwebtoken");


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
    await User.findByIdAndUpdate(user?.id, {
      refreshToken: refreshToken
    },{new: true});

    //add refresh token to the response
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000
    })
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
const handleRefreshToken = expressAsyncHandler(
  async (req, res) => {
    const cookie = req.cookies;
    if(!cookie?.refreshToken) throw new Error("No refresh token in Cookies");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({refreshToken});
    if(!user) throw new Error("No refresh token in db or not matched");
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
      if(err || user?.id !== decoded.id){
        throw new Error("there is something wrong with refresh token");
      }
      const accessToken = generateToken(user?.id);
      res.json({success: true, accessToken})
    })
  }
)

const logout = expressAsyncHandler(
  async (req, res) => {
    const cookie = req.cookies;
    if(!cookie?.refreshToken) throw new Error("No refresh token in Cookies");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({refreshToken});

    if(!user){
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true
      })
      res.sendStatus(204);
    }
    await User.findOneAndUpdate(refreshToken, {
      refreshToken: ""
    })
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true
    })
    res.sendStatus(200);

  }
)


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
    if(user){
      res.json({ success: true, user });
    }else{
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
    const user = await User.findByIdAndUpdate(id,{
      ...req?.body
    },{new: true});
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

module.exports = { createUser, loginUser, getAllUsers, getUser, deleteUser,updateUser, handleRefreshToken,logout };
