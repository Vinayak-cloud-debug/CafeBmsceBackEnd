const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user.models');

const router = express.Router();

router.post('/reset-password', async (req, res) => {
  const { email, password } = req.body; // Extract email and password from the request

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find the user by email
    const user = await User.findOne({ username: email });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear reset-related fields (if any)
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpiry = undefined;

    // Save the updated user
    await user.save();

    res.status(200).json({ message: 'Password successfully reset.' });
  } catch (error) {
    console.error('Error in reset-password route:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
