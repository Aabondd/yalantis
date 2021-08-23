const User = require("./User");
const Joi = require("joi");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const {
  Types: { ObjectId },
} = require("mongoose");
const { stringify } = require("querystring");

async function getUsers(req, res) {
  const users = await User.find();
  res.json(users);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "temp/");
  },
  filename: function (req, file, cb) {
    console.log("file", file);
    const extension = path.parse(file.originalname).ext;
    cb(null, `${Date.now()}${extension}`);
  },
});

const imageFilter = function (req, file, cb) {
  if (
    file.mimetype == "image/png" ||
    file.mimetype == "image/jpg" ||
    file.mimetype == "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
    return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
  }
};

const upload = multer({ storage: storage, fileFilter: imageFilter });

function validateCreateUser(req, res, next) {
  const validationSchema = Joi.object({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    email: Joi.string().required(),
    photo: Joi.any(),
  });

  const validationResult = validationSchema.validate(req.body);

  if (validationResult.error) {
    return res.status(400).send(validationResult.error);
  }

  next();
}

async function createUser(req, res) {
  const obj = {
    first_name: req.body.first_name,
    last_name: req.body.first_name,
    email: req.body.email,
    photo: {
      data: fs.readFileSync(
        path.join(__dirname + "/../temp/" + req.file.filename)
      ),
      contentType: "image/png",
    },
  };

  const user = await User.create(obj);

  res.status(201).json(user._id);
}

function validateId(req, res, next) {
  const {
    params: { id },
  } = req;

  if (!ObjectId.isValid(id)) {
    return res.status(404).json({ message: "Id is not valid" });
  }

  next();
}

async function getUserById(req, res) {
  const {
    params: { id },
  } = req;

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({ message: "User is not found" });
  }

  res.json(user);
}

async function resizePhoto(req, res, next) {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(200, 200)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
}

module.exports = {
  getUsers,
  validateCreateUser,
  createUser,
  validateId,
  getUserById,
  upload,
  resizePhoto,
};
