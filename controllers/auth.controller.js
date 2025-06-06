const bcrypt = require("bcryptjs");
const User = require("../models/user.models");
const generateTokenAndSetCookie = require("../utils/generateToken");
const jwt = require('jsonwebtoken')

const signup = async (req, res) => {

  
  try {
    const { fullName, username, password, confirmPassword, gender } = req.body;

    
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords don't match" });
    }

    const user = await User.findOne({ username });

    if (user) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // HASH PASSWORD HERE
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // https://avatar-placeholder.iran.liara.run/

    const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
    const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

    const newUser = new User({
      fullName,
      username,
      password: hashedPassword,
      gender,
      profilePic: gender === "male" ? boyProfilePic : girlProfilePic,
    });

    if (newUser) {
      // Generate JWT token here
      await newUser.save();
      
      const token = generateTokenAndSetCookie(newUser._id, res);

      console.log("token "+token)


      res.status(201).json({
        token:token
      });

    
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const login = async (req, res) => {
  try {

    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");
    
    
    console.log("Inside Login")

    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const token = generateTokenAndSetCookie(user._id, res);

    console.log("token "+token)


    res.status(200).json({
      token:token
    });


  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const logout = (req, res) => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      expires: new Date(0), // Set an explicit expiration date (past date)
    });

    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });


    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


module.exports = {
  signup,
  login,
  logout,
};
