const express = require("express");
const app = express();
const userRoutes = require("./routes/userRoutes");

module.exports = app;

// MIDDLEWARES
app.use(express.json());

// ROUTES
app.use("api/v1/user", userRoutes);
