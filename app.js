const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/userRoutes");
const globalErrorHandler = require("./controllers/errorController");

module.exports = app;

// MIDDLEWARES
app.use(express.json());
app.use(cookieParser());

// ROUTES
app.use("/api/v1/user", userRoutes);

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);
