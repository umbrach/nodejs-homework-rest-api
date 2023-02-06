const express = require("express");

const { asyncWrapper } = require("../../helpers/apiHelpers");
const { authMiddleware } = require("../../middlewares/authMiddleware");

const {
  registrationController,
  loginController,
  logoutController,
  currentController,
} = require("../../controllers/authController");

const {schemaAuthValidation} =require('../../middlewares/validation')

const router = express.Router();

router.post("/register",schemaAuthValidation, asyncWrapper(registrationController));

router.post("/login",schemaAuthValidation, asyncWrapper(loginController));

router.post("/logout", authMiddleware, asyncWrapper(logoutController));

router.get("/current", authMiddleware, asyncWrapper(currentController));

module.exports = router;
