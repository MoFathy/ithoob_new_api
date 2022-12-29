const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const authMiddleware = expressAsyncHandler(async (req, res, next) => {
  let token;
  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded?.id);
        if (user) {
          req.user = user;
          next();
        } else {
          throw new Error("Not authorized token, Please login again");
        }
      } else {
        throw new Error("Not authorized token, Please login again");
      }
    } catch (error) {
      throw new Error("Not authorized token, Please login again");
    }
  } else {
    throw new Error("There is no token attached to the request header");
  }
});

const isAdmin = expressAsyncHandler(async (req, res, next) => {
  try {
    if (req.user && req.user.role == "admin") {
      next();
    } else {
      throw new Error("you are not allowed to do this action");
    }
  } catch (error) {
    throw new Error("you are not allowed to do this action");
  }
});

module.exports = { authMiddleware, isAdmin };
