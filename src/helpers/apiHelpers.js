const jwt = require("jsonwebtoken");
const fs = require("fs");
const { ValidationError, WrongParametersError } = require("./errors");

const asyncWrapper = (controller) => {
  return (req, res, next) => {
    controller(req, res).catch(next);
  };
};

const errorHandler = (err, req, res, next) => {
  if (err instanceof ValidationError || err instanceof WrongParametersError) {
    return res.status(err.status).json({ message: err.message });
  }
  res.status(500).json({ message: err.message });
};

const createToken = async (user) => {
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
  return token;
};

module.exports = { asyncWrapper, errorHandler, createToken };
