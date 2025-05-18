

const express = require('express');
const nodemailer = require('nodemailer');
const User = require('../models/user.models');
const router = express.Router();
const validator = require('validator');



router.post('/Verify-Gmail',  async (req, res) => {

  console.log(req.body)

    const {GmailValue} = req.body

  try {
    // Validate email format
    if (!GmailValue || !validator.isEmail(GmailValue)) {
      
      
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    // Check if the user exists
    const user = await User.findOne({ username: GmailValue });
    if (user) {
        
      return res.status(404).json({ error: 'User exits signup thru different Email.' });
    }



    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // e.g., 123456

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
      to: GmailValue,
      subject: 'Your Password Reset OTP',
      html: `<p>Your OTP for password reset is <strong>${otp}</strong>. This OTP will expire in 15 minutes.</p>`,
    });

    
  
    res.status(200).json({ message: 'OTP sent to your email.',otp:otp });
  } catch (error) {
    
    console.error('Error in Verify-Gmail controller:', error.message);
    res.status(500).json({ error: 'Internal Server Error',output:0 });
  }

})

module.exports = router