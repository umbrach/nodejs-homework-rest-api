const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const { NotAuthorizedError } = require("../helpers/errors");
const User = require("../db/userModel");

const authMiddleware = async (req, res, next) => {
  try {
    const [tokenType, token] = req.headers["authorization"].split(" ");

    if (!token) {
      next(new NotAuthorizedError("Please, provide valid token"));
    }
    const user = jwt.verify(token, process.env.JWT_SECRET);

    const findedUser = await User.findById(user._id);
    if (!findedUser) next(new NotAuthorizedError("Not authorized"));

    if (token !== findedUser.token) {
      next(new NotAuthorizedError("Please, login or provide correct token"));
    }

    req.token = token;
    req.user = user;
    next();
  } catch (err) {
    next(new NotAuthorizedError("Invalid token"));
  }
};

const upload = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve("./tmp"));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const uploadMiddleware = multer({
  storage: upload,
});

module.exports = {
  authMiddleware,
  uploadMiddleware,
};
