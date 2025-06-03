const express = require('express')
const cors = require('cors')
const bp = require('body-parser')
const PORT = 9000
const CustomerLogin = require('./UserLogin')
const FoodQtyIncrement = require('./AddFood')
const FoodQtyDecrement = require('./RemoveFood')
const connectToMongoDB = require('./db/connectToMongoDB.js')
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth.routes.js");
const User = require("./models/user.models.js")
const Order = require("./models/order.models.js")
const nodemailer = require('nodemailer');
const validator = require('validator');
const Food = require('./models/food.models.js')
const axios = require('axios');

dotenv.config();

const App = express();

App.use(cors({
	origin: ['https://cafe-bmsce-front-end.vercel.app','https://cafebmscebackend.onrender.com'], // Allow requests from this frontend
	methods: 'GET,POST,PUT,DELETE',
	allowedHeaders: 'Content-Type,Authorization',
	credentials:true
  }));



// PORT should be assigned after calling dotenv.config() because we need to access the env variables. Didn't realize while recording the video. Sorry for the confusion.

App.use(express.json()); // to parse the incoming requests with JSON payloads (from req.body)
App.use(cookieParser());

App.use("/api/auth", authRoutes);


App.post('/api/fetchUserOrders',async(req,res)=>{

    try {
    const email = req.body.email;

    // Find user by email or username
    const user = await User.findOne({ username: email }).populate({
      path: "orders",
      populate: {
        path: "items", // not needed unless items reference other docs
      }
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
})

App.post('/api/ConfirmOrderDetails',async(req,res)=>{

    const email = req.body.email;
    var cart =  req.body.items
    const totalAmount = req.body.totalAmount

  
  if (!email || !cart || !Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ message: "Invalid order request" });
  }

  console.log("after array check")

  try {
    // Find the user by username (you are storing email in the username field)
    const user = await User.findOne({ username: email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }


    // Create new order
    const newOrder = new Order({
      user: user._id,
      items: cart,
      totalAmount: totalAmount,
    });

    const savedOrder = await newOrder.save();

    // Push order ID to user.orders
    user.orders.push(savedOrder._id);
    await user.save();

    return res.status(200).json({msg:"Order Confirmed"});

  } catch (err) {
    console.error("Order error:", err);
    return res.status(500).json({ message: "Server error placing order" });
  }
})


App.get("/api/getToken", async (req, res) => {
    try {
        const token = req.cookies.jwt;
        console.log("Token:", token);
        if (!token) {
            return res.status(401).json({ isAuthenticated: false });
        }



            if (!token) {
            return res.status(400).json({ error: "No token provided" });
            }
            // Verify and decode the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const userId = decoded.userId; // This must match how you encoded it
            if (!userId) {
            return res.status(400).json({ error: "Invalid token structure" });
            }

        const user = await User.findById(userId).select("-password");
        console.log("User : "+user)

        if (!user) {
        return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({token:token,user:user});
    } catch (error) {
        console.error("Error fetching token:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})




App.use("/api/Customer",CustomerLogin)



App.get("/api/GetAllFoodItems",async(req,resp)=>{


    const FoodItems = await Food.find({})

    resp.send(FoodItems)
    console.log(FoodItems)

})

App.post("/api/GetFoodItemsByCategory",async(req,resp)=>{

    const Category = req.body.SelectedCategory



    const FoodItems = await Food.find({Category:Category})

    resp.send(FoodItems)

})

App.post("/api/GetSearchedFood",async(req,resp)=>{

    const SearchedFood = req.body.FoodName

    var FoodCollection =  myDb.collection("Food")

    const regex = new RegExp(SearchedFood, 'i'); 

    const result = await FoodCollection.find({ Name: regex }).toArray();
    resp.send(result)
    console.log(result)
})







App.post('/api/auth/Verify-Gmail',  async (req, res) => {

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
        
        return res.status(404).json({ error: 'User exists signup thru different Email.' });
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

setInterval(() => {
  axios.get('https://cafe-bmsce-front-end.vercel.app')
    .then(() => console.log('⏱️ Keep-alive ping sent'))
    .catch((err) => console.error('Ping error:', err.message));
}, 5 * 60 * 1000); 

App.listen(PORT,'0.0.0.0',err=>{

    connectToMongoDB();

    if(err)
        console.log(err)
    else
        console.log("Server Running at port "+PORT)
})

