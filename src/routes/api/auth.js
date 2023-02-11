const express = require("express");

const { asyncWrapper } = require("../../helpers/apiHelpers");
const {
  authMiddleware,
  uploadMiddleware,
} = require("../../middlewares/authMiddleware");

const {
  registrationController,
  loginController,
  logoutController,
  currentController,
  avatarController,
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

module.exports = router;
