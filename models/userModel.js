const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const Email = require("./../utils/Email");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    validate: [validator.isEmail, "Lütfen geçerli bir email adresi giriniz"],
    required: true,
  },
  password: {
    type: String,
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
    type: String,
    default: "notVerified",
  },
  emailToken: String,
});

UserSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
  }
  next();
});

UserSchema.post("save", async function (doc, next) {
  const html = `<a href="http://localhost:3000/api/v1/user/verify/${doc.emailToken}">http://localhost:3000/api/v1/user/verify/${doc.emailToken}</a>`;
  const mailer = new Email(doc);
  await mailer.send("Doğrulama", html);
  next();
});

UserSchema.methods.comparePassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
