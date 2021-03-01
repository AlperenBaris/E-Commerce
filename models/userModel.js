const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const catchAsync = require("./../utils/catchAsync");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    unique: [true, "Bu email adresin alınmıştır"],
    validate: [validator.isEmail, "Lütfen geçerli bir email adresi giriniz"],
    required: true,
  },
  password: {
    type: String,
    min: [5, "Şifrenizi en az 5 karakterden oluşturun"],
    required: true,
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
    required: true,
    select: false,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
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

UserSchema.pre(
  "save",
  catchAsync(async function (next) {
    if (this.isModified("password") || this.isNew) {
      this.password = await bcrypt.hash(this.password, 12);
      this.passwordConfirm = undefined;
    }
    next();
  })
);

UserSchema.methods.comparePassword = catchAsync(async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
