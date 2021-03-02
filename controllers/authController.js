const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/AppError");

const createSendToken = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV == "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;

  // CHECK INPUT FIELDS
  if (!name || !email || !password | !passwordConfirm)
    return next(new AppError("Lütfen gerekli alanları doldurunuz.", 404));

  if (password.length < 5) {
    return next(new AppError("Şifreniz en az 5 karakterli yapınız", 404));
  }

  const user = await User.create({
    name,
    email,
    password,
    passwordConfirm,
  });

  createSendToken(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check password and email
  if (!email || !password) {
    return next(new AppError("Lütfen şifrenizi ve emailinizi giriniz.", 404));
  }

  const user = await User.findOne({ email }).select("+password");

  // Check user and corect password
  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(
      new AppError("Lütfen şifrenizi veya emailinizi doğru yazınız.", 404)
    );
  }

  createSendToken(user, 200, res);
});
