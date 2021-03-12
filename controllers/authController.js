const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/AppError");
const Email = require("./../utils/Email");
const uuid = require("uuid");

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

const findUser = async (req, res, next) => {
  const { email, password } = req.body;

  // Check password and email
  if (!email || !password) {
    return next(new AppError("Lütfen şifrenizi veya emailinizi giriniz.", 404));
  }

  const user = await User.findOne({ email }).select("+password");

  // Check user and corect password
  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(
      new AppError("Lütfen şifrenizi veya emailinizi doğru yazınız.", 404)
    );
  }

  return user;
};

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;

  // Check input fields
  if (!name || !email || !password | !passwordConfirm)
    return next(new AppError("Lütfen gerekli alanları doldurunuz.", 404));

  // Check password length
  if (password.length < 5) {
    return next(new AppError("Şifreniz en az 5 karakterli yapınız", 404));
  }

  const emailToken = uuid.v4();

  const user = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    emailToken,
  });

  createSendToken(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const user = await findUser(req, res, next);

  if (user.activated === "verified") {
    createSendToken(user, 200, res);
  } else {
    return next(new AppError("Lütfen hesabınızı doğrulayınız", 404));
  }
});

exports.verification = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ emailToken: req.params.emailToken });

  if (!user || user.activated === "verified") {
    return next(
      new AppError(
        "Email önceden doğrulanmış veya yanlış bir linke girdiniz.",
        404
      )
    );
  }

  await user.updateOne({
    $set: { activated: "verified" },
    $unset: { emailToken: "" },
  });

  await user.save();

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.sendResetEmail = catchAsync(async (req, res, next) => {
  const user = await findUser(req, res, next);
  const mailer = new Email(user);
  const resetToken = user._id + Date.now();

  const html = `<a href="http://localhost:3000/api/v1/user/resetPassword/${resetToken}">http://localhost:3000/api/v1/user/resetPassword/${resetToken}</a>`;

  await mailer.send("Şifre Değiştirme", html);

  res.status(200).json({
    status: "success",
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const userID = req.params.resetToken.slice(0, 24);
  const timeStamp = req.params.resetToken.slice(25);

  const user = await User.findById(userID).select("+password");

  if (!user || Date.now() > timeStamp + 5 * 60 * 1000) {
    return next(
      new AppError(
        "Yanlış linke girdiniz veya şifre yenileme süresi geçti",
        404
      )
    );
  }

  user.password = req.body.password;
  await user.save();

  user.password = undefined;

  res.status(201).json({
    status: "success",
    data: {
      user,
    },
  });
});
