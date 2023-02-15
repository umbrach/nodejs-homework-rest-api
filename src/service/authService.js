const bcrypt = require("bcrypt");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const jimp = require("jimp");
const sgMail = require("@sendgrid/mail");
const { v4: uuidv4 } = require("uuid");

const { createToken } = require("../helpers/apiHelpers");
const User = require("../db/userModel");
const { NotAuthorizedError, NotFoundError } = require("../helpers/errors");

const registration = async (email, password) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const avatarURL = gravatar.url(
    email,
    { s: "250", r: "x", d: "robohash" },
    true
  );
  const verificationToken = uuidv4();
  const user = new User({ email, password, avatarURL, verificationToken });
  await user.save();

  const newToken = await createToken(user);
  user.token = newToken;
  await user.save();

  const { email: userEmail, subscription, token } = user;

  const msg = {
    to: email,
    from: "umbrach415@ukr.net",
    subject: "Email verification",
    text: `Please, confirm your email address GET http://localhost:3000/api/users/verify/${verificationToken}`,
    html: `<p>Please, confirm your email address GET http://localhost:3000/api/users/verify/${verificationToken}</p>`,
  };

  await sgMail.send(msg);

  return { userEmail, subscription, token, avatarURL };
};

const verificationConfirmation = async (verificationToken) => {
  const user = await User.findOne({
    verificationToken,
    verify: false,
  });
  if (!user) {
    throw new NotFoundError("Already varified");
  }
  user.verify = true;
  user.verificationToken = "null";

  await user.save();

  const msg = {
    to: user.email,
    from: "umbrach415@ukr.net",
    subject: "Thank you for registration!",
    text: `Thank you for registration!`,
    html: `<p>Registration successfully completed</p>`,
  };

  await sgMail.send(msg);
};

const resendVerificationMail = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new NotFoundError("No user found");
  }

  if (user.verify) {
    throw new NotAuthorizedError("Verification has already been completed");
  }

  const msg = {
    to: email,
    from: "umbrach415@ukr.net",
    subject: "Email confirmation",
    text: `Please, confirm your email address GET http://localhost:3000/api/users/verify/${user.verificationToken}`,
    html: `<p>Please, confirm your email address GET http://localhost:3000/api/users/verify/${user.verificationToken}</p>`,
  };

  await sgMail.send(msg);
};

const login = async (email, password) => {
  const user = await User.findOne({ email, verify: true });

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
  const { email, subscription, _id } = user;

  return { email, subscription, _id };
};

const changeAvatar = async (_id, file) => {
  if (!file) {
    throw new NotAuthorizedError("Please add file or check headers");
  }
  const { path: temporaryName, originalname } = file;
  const storeImage = path.resolve("./public/avatars");
  const tempImage = path.resolve("./tmp");
  const extension = originalname.split(".").pop();
  // Resize img
  const image = await jimp.read(temporaryName);
  image.resize(250, 250).write(temporaryName);

  const newName = `${_id}.${extension}`;
  const filePath = path.join(storeImage, newName);
  console.log(filePath);
  const avatarUrl = path.join("avatars", newName).replaceAll("\\", "/");
  await fs.rename(temporaryName, filePath);
  const newUser = await User.findOneAndUpdate(
    { _id },
    { avatarURL: avatarUrl },
    { new: true }
  );
  return newUser;
};

module.exports = {
  registration,
  login,
  logout,
  current,
  changeAvatar,
  verificationConfirmation,
  resendVerificationMail,
};
