const jwt = require("jsonwebtoken");

const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d", // Token expires in 1 hour
  });

  // Send the token as an HTTP-only cookie
  res.cookie("jwt", token, {
    httpOnly: true,   // Prevents client-side JavaScript from accessing the token
    sameSite: "Strict", // Protects against CSRF
    secure: false, // Ensure cookies are sent over HTTPS in production
    maxAge: 15 * 24 * 60 * 60 * 1000, // Cookie will expire in 15 days
  });

  return token;
};

module.exports = generateToken;

//This is for Production
// res.cookie("jwt", token, {
// 	maxAge: 15 * 24 * 60 * 60 * 1000,  // Cookie will persist for 15 days
// 	httpOnly: true,                   // Prevents access from JavaScript (XSS protection)
// 	sameSite: "Strict",               // Protects against CSRF attacks
// 	secure: true,                     // Ensures the cookie is only sent over HTTPS
//   });
  
