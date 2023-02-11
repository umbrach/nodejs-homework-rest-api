const bcrypt = require("bcrypt");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const jimp = require("jimp");
const { createToken, isPathExist } = require("../helpers/apiHelpers");
const User = require("../db/userModel");
const { NotAuthorizedError } = require("../helpers/errors");

const registration = async (email, password) => {
  const avatarURL = gravatar.url(
    email,
    { s: "250", r: "x", d: "robohash" },
    true
  );
  const user = new User({ email, password, avatarURL });
  await user.save();

  const newToken = await createToken(user);
  user.token = newToken;
  await user.save();

  const { email: userEmail, subscription, token } = user;

  return { userEmail, subscription, token, avatarURL };
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
  const { email, subscription, _id } = user;

  return { email, subscription, _id };
};

/////////////////////////////////////

// const avatarDir = path.join(__dirname, "../../", "public", "avatars");

const changeAvatar = async (_id, file) => {
  // const { _id } = req.user;
  // const { path: tempUpload, originalname } = req.file;
  // const extension = originalname.split(".").pop();
  // const filename = `${_id}.${extension}`;
  // const resultUpload = path.join(avatarDir, filename);
  // await fs.rename(tempUpload, resultUpload);
  // const avatarURL = path.join("avatars", filename);
  // await User.findByIdAndUpdate(_id, { avatarURL });

  // res.json({ avatarURL });

  if (!file) {
    throw new NotAuthorizedError("Please add file or check headers");
  }
  const { path: temporaryName, originalname } = file;
  const storeImage = path.resolve("./public/avatars");
  const tempImage = path.resolve("./tmp")
  const extension = originalname.split(".").pop();
  // Resize img
  const image = await jimp.read(temporaryName);
  image.resize(250, 250).write(temporaryName);

  const newName = `${_id}.${extension}`;
  const filePath = path.join(storeImage, newName)
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

module.exports = { registration, login, logout, current, changeAvatar };
