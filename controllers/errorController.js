const AppError = require("../utils/AppError");

sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: err.status,
      message: "Serverda sıkıntı var",
    });
  }
};

handleDuplicateKeyError = (err, res) => {
  return new AppError("Bu email adresi alınmıştır", 404);
};

handleValidationError = (err, res) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `${errors.join(". ")}`;
  return new AppError(message, 400);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "fail";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    if (err.code === 11000) err = handleDuplicateKeyError(err, res);
    if (err.name === "ValidationError") err = handleValidationError(err, res);
    sendErrorProd(err, res);
  }
};
