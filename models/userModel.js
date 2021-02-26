const mongoose = require("mongoose");
const validator = require("validator");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "Lütfen isminizi yazınız"],
  },
  email: {
    type: String,
    unique: true,
    validate: [validator.isEmail, "Lütfen geçerli bir email adresi giriniz"],
    required: [true, "Lütfen emailinizi yazınız"],
  },
  password: {
    type: String,
    min: [5, "Şifrenizi en az 5 karakterden oluşturun"],
    required: [true, "Lütfen şifrenizi yazınız"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Şifreleriniz birbiri ile uyuşmuyor",
    },
    required: [true, "Lütfen şifrenizi yazınız"],
    select: false,
  },
  registerDate: {
    type: Date,
    default: Date.now(),
  },
  activated: {
    type: Boolean,
    default: false,
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
