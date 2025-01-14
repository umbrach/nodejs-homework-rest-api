const express = require("express");

const { asyncWrapper } = require("../../helpers/apiHelpers");
const { authMiddleware } = require("../../middlewares/authMiddleware");

const {
  get,
  getById,
  remove,
  add,
  update,
  patch,
} = require("../../controllers/contactsController");

const {
  schemaPostContact,
  schemaPutContact,
  schemaFavorite,
} = require("../../middlewares/validation");

const router = express.Router();

router.use(authMiddleware);

router.get("/", asyncWrapper(get));

router.get("/:contactId", asyncWrapper(getById));

router.post("/", schemaPostContact, asyncWrapper(add));

router.delete("/:contactId", asyncWrapper(remove));

router.put("/:contactId", schemaPostContact, asyncWrapper(update));

router.patch("/:contactId", schemaPutContact, asyncWrapper(patch));

router.patch("/:contactId/favorite", schemaFavorite, asyncWrapper(patch));

module.exports = router;
