const bcrypt = require("bcrypt");
const { createToken } = require("../helpers/apiHelpers");
const User = require("../db/userModel");
const { NotAuthorizedError } = require("../helpers/errors");

const registration = async (email, password) => {
  const user = new User({ email, password });
  await user.save();

  const newToken = await createToken(user);
  user.token = newToken;
  await user.save();

  const { email: userEmail, subscription, token } = user;

  return { userEmail, subscription, token };
};

const login = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new NotAuthorizedError(`No user with email ${email} found`);
  }

  if (!(await bcrypt.compare(password, user.password))) {
    throw new NotAuthorizedError(`"Wrong password"`);
  }

  const { email: userEmail, subscription } = user;

  const newToken = await createToken(user);
  user.token = newToken;
  await user.save();

  return { token: newToken, userEmail, subscription };
};

const logout = async (token) => {
  const user = await User.findOne({ token });

  if (!user) {
    throw new NotAuthorizedError("Not authorized");
  }
  user.token = "";
  const result = await user.save();

  return result;
};

const current = async (token) => {
  const user = await User.findOne({ token });
  if (!user) {
    throw new NotAuthorizedError("Not authorized");
  }
  const { email, subscription } = user;

  return { email, subscription };
};

module.exports = { registration, login, logout, current };
