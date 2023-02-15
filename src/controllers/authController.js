const {
  registration,
  login,
  logout,
  current,
  changeAvatar,
  verificationConfirmation,
  resendVerificationMail,
} = require("../service/authService");

const registrationController = async (req, res) => {
  const { email, password } = req.body;
  const newUser = await registration(email, password);
  res.status(201).json({ status: "success", newUser });
};

const loginController = async (req, res) => {
  const { email, password } = req.body;
  const { token, userEmail, subscription } = await login(email, password);

  res.json({
    status: "success",
    token,
    user: { email: userEmail, subscription },
  });
};

const logoutController = async (req, res) => {
  const [tokenType, token] = req.headers["authorization"].split(" ");

  await logout(token);

  res.status(204).json();
};

const currentController = async (req, res) => {
  const [tokenType, token] = req.headers["authorization"].split(" ");
  const { email, subscription } = await current(token);

  res.status(200).json({ email, subscription });
};

const avatarController = async (req, res) => {
  const [, token] = req.headers["authorization"].split(" ");

  const {email, subscription, _id } = await current(token);
  const avatarURL = await changeAvatar(_id, req.file);

  res.status(200).json({ avatarURL });
};

const emailVerificationController = async (req, res) => {
  const { verificationToken } = req.params;
  await verificationConfirmation(verificationToken);

  res.status(200).json({ status: "Verification successfully completed" });
};

const resendVerificationController = async (req, res) => {
  const { email } = req.body;
  await resendVerificationMail(email);

  res.status(200).json({ status: "Verification email sent" });
};

module.exports = {
  registrationController,
  loginController,
  logoutController,
  currentController,
  avatarController,
  emailVerificationController,
  resendVerificationController,
};
