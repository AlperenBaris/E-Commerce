require("dotenv").config({ path: "./config.env" });
const mongoose = require("mongoose");

process.on("uncaughtException", (err) => {
  console.log(err);
  console.log("UNCAUGHT EXCEPTION");
  process.exit(1);
});

const app = require("./app");

mongoose
  .connect(process.env.DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("DB connection is successfully"));

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log(err);
  console.log("UNHANDLED REJECTION");
  server.close(() => {
    process.exit(1);
  });
});
