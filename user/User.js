const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  photo: {
    data: Buffer,
    contentType: String,
  },
});

module.exports = mongoose.model("User", UserSchema);
