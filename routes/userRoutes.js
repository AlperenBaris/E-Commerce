const express = require("express");
const authController = require("./../controllers/authController");

const router = express.Router();

router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);
router.route("/verify/:emailToken").get(authController.verification);
router.route("/resetPassword").post(authController.sendResetEmail);
router.route("/resetPassword/:resetToken").post(authController.resetPassword);

module.exports = router;
