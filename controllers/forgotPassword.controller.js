


const express = require('express');
const nodemailer = require('nodemailer');
const validator = require('validator');
const User = require('../models/user.models');
const rateLimit = require('express-rate-limit');
const router = express.Router();

// Rate Limiter Middleware
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 requests per IP
  message: 'Too many password reset requests from this IP, please try again after 15 minutes.',
});

router.post('/forgot-password', forgotPasswordLimiter, async (req, res) => {
  const { email } = req.body;

  console.log(req.body)

  try {
    // Validate email format
    if (!email || !validator.isEmail(email)) {
      
      
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    // Check if the user exists
    const user = await User.findOne({ username: email });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }


    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // e.g., 123456
    user.resetPasswordOtp = otp;
    user.resetPasswordExpiry = Date.now() + 15 * 60 * 1000; // OTP valid for 15 minutes
    await user.save();

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: user.username,
      subject: 'Your Password Reset OTP',
      html: `<p>Your OTP for password reset is <strong>${otp}</strong>. This OTP will expire in 15 minutes.</p>`,
    });


    res.status(200).json({ message: 'OTP sent to your email.',output:1 });
  } catch (error) {
    
    console.error('Error in forgot-password controller:', error.message);
    res.status(500).json({ error: 'Internal Server Error',output:0 });
  }
});


module.exports = router