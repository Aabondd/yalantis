const { Router } = require("express");
const UserController = require("./user.controller");
const User = require("./User");

const router = Router();

router.get("/", UserController.getUsers);
router.get("/:id", UserController.validateId, UserController.getUserById);
router.post(
  "/",
  UserController.upload.single("photo"),
  UserController.validateCreateUser,
  UserController.createUser,
  UserController.resizePhoto
);

module.exports = router;
