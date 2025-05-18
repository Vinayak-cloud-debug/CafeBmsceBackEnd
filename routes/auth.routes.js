const express = require("express");
const { signup, login, logout } = require("../controllers/auth.controller");
const forgotPassword = require("../controllers/forgotPassword.controller");
const VerifyOtp = require('../controllers/verifyOtp')
const ResetPassword = require('../controllers/resetPassword.controllers')
const gmailVerify = require('../controllers/verifyGmail.controller');
const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.post("/forgot-password",forgotPassword);

router.post('/verify-otp',VerifyOtp)

router.post('/Verify-Gmail',gmailVerify)

router.post('/reset-password',ResetPassword)



module.exports = router;
