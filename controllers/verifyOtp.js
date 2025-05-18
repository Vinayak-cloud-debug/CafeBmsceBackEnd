
const express = require('express');
const User = require('../models/user.models');
const router = express.Router();


router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
  
    try {
      const user = await User.findOne({ username: email });
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
  
      if (!user.resetPasswordOtp || user.resetPasswordExpiry < Date.now()) {
        return res.status(400).json({ error: 'OTP expired or invalid.' });
      }
  
      if (user.resetPasswordOtp !== otp) {
        return res.status(400).json({ error: 'Invalid OTP.' });
      }
  
      // OTP is valid, clear the OTP fields in the database
      user.resetPasswordOtp = undefined;
      user.resetPasswordExpiry = undefined;
      await user.save();
  
      res.status(200).json({ message: 'OTP verified successfully. You may now reset your password.',output:1 });
    } catch (error) {
      console.error('Error in verify-otp controller:', error.message);
      res.status(500).json({ error: 'Internal Server Error',output:0 });
    }
  });
  
  module.exports = router;