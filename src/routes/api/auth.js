const express = require("express");

const { asyncWrapper } = require("../../helpers/apiHelpers");
const {
  authMiddleware,
  uploadMiddleware,
  resendVerificationMiddleware,
} = require("../../middlewares/authMiddleware");

const {
  registrationController,
  loginController,
  logoutController,
  currentController,
  avatarController,
  resendVerificationController,
  emailVerificationController,
} = require("../../controllers/authController");

const { schemaAuthValidation } = require("../../middlewares/validation");

const router = express.Router();

router.post(
  "/register",
  schemaAuthValidation,
  asyncWrapper(registrationController)
);

router.post("/login", schemaAuthValidation, asyncWrapper(loginController));

router.post("/logout", authMiddleware, asyncWrapper(logoutController));

router.get("/current", authMiddleware, asyncWrapper(currentController));

router.patch(
  "/avatars",
  authMiddleware,
  uploadMiddleware.single("avatar"),
  asyncWrapper(avatarController)
);

router.get(
  "/verify/:verificationToken",
  asyncWrapper(emailVerificationController)
);

router.post(
  "/verify",
  resendVerificationMiddleware,
  asyncWrapper(resendVerificationController)
);

module.exports = router;
