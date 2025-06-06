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
	origin: ['https://cafe-bmsce-front-end.vercel.app','https://cafebmscebackend.onrender.com','https://cafe-bmsce-admin.vercel.app'], // Allow requests from this frontend
	methods: 'GET,POST,PUT,DELETE',
	allowedHeaders: 'Content-Type,Authorization',
	credentials:true
  }));



// PORT should be assigned after calling dotenv.config() because we need to access the env variables. Didn't realize while recording the video. Sorry for the confusion.

App.use(express.json()); // to parse the incoming requests with JSON payloads (from req.body)
App.use(cookieParser());

App.use("/api/auth", authRoutes);



App.post('/api/fetchUserOrdersEmail',async(req,res)=>{

    try {

      const email = req.body.email
	console.log(email)

    const user = await User.findOne({username:email}).populate({
      path: "orders",
      populate: {
        path: "items", // not needed unless items reference other docs
      }
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    console.log(user)

    res.json(user);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
})




App.get('/api/fetchUserOrders',async(req,res)=>{

    try {

    const user = await User.find({}).populate({
      path: "orders",
      populate: {
        path: "items", // not needed unless items reference other docs
      }
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    console.log(user)

    res.json(user);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
})


App.post('/api/ConfirmOrderDetails',async(req,res)=>{

    const email = req.body.email;
    var cart =  req.body.cartData
    const totalAmount = req.body.totalAmount
    const canteenName = req.body.canteenName

  
  if (!email || !cart  ) {
    return res.status(400).json({ message: "Invalid order request" });
  }


  try {
    // Find the user by username (you are storing email in the username field)
    const user = await User.findOne({ username: email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }


    // Create new order
    const newOrder = new Order({
      user: user._id,
      canteenName:canteenName,
      items: cart,
      totalAmount: totalAmount,
    });

    const savedOrder = await newOrder.save();

    // Push order ID to user.orders
    user.orders.push(savedOrder._id);
    await user.save();

     const transporter = nodemailer.createTransport({
      service: 'gmail', // You can use any email service
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Create invoice HTML (simplified example)
    let itemDetails = cart.map(item => `
      <li>${item.name} - ${item.quantity} x ₹${item.price}</li>
    `).join("");

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Order Invoice from Cafe BMSCE!',
      html: `
        <h2>Invoice from ${canteenName}</h2>
        <p>Thank you for your order, we will confirm your order Soon!</p>
        <ul>${itemDetails}</ul>
        <p><strong>Total: ₹${totalAmount}</strong></p>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);


    return res.status(200).json({msg:"Order Confirmed"});

  } catch (err) {
    console.error("Order error:", err);
	   const transporter = nodemailer.createTransport({
      service: 'gmail', // You can use any email service
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
      }
    });

  

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Your Order failed from Cafe BMSCE!',
      html: `
        <h2> ${canteenName}</h2>
        <p>Order failed due to network error , please try again!</p>
        
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

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




App.put('/api/updateOrderStatus', async (req, res) => {
  try {
    const {orders,fullName,email, orderId, status } = req.body;

    console.log(orders)

    // Validate input
    if (!fullName || !email || !orderId || !status) {
      return res.status(400).json({ 
        error: 'Missing required fields:UserName ,email, orderId and status are required' 
      });
    }


    // Validate status value
    const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be one of: pending, shipped, delivered, cancelled' 
      });
    }

    
    
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { 
        status: status.toLowerCase(),
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (updatedOrder) {


      const orderRows = orders.items.map(item => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${item.price}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${item.quantity * item.price}</td>
      </tr>
    `).join('');

    const status = updatedOrder.status.toLowerCase();
    const restaurantCharge = 7;
    const platformFee = 5;
    const packingCharge = 4;
    const extraCharges = restaurantCharge + platformFee + packingCharge;
    const totalPayable = updatedOrder.totalAmount + extraCharges;

    // Conditionally show shipped message
    const shippedNote = status === 'shipped' 
      ? `<p style="color: green;"><strong>Your order has been shipped and is on the way!</strong></p>` 
      : '';

    // Conditionally hide Total Amount to be Paid if cancelled
    const finalTotalRow = status !== 'cancelled' 
      ? `
        <tr>
          <td colspan="3" style="padding: 8px; border: 1px solid #ddd; text-align: right;"><strong>Total Amount to be Paid:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;"><strong>₹${totalPayable}</strong></td>
        </tr>` 
      : '';

      const invoiceHtml = `
        <h2>Hello ${fullName},</h2>
        <p>Your order status has been updated to <strong>${updatedOrder.status.toUpperCase()}</strong>.</p>
        ${shippedNote}
        <h3>Invoice from ${updatedOrder.canteenName || 'Canteen'}</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr>
              <th style="padding: 8px; border: 1px solid #ddd;">Item</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Quantity</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Price</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${orderRows}
            <tr>
              <td colspan="3" style="padding: 8px; border: 1px solid #ddd; text-align: right;"><strong>Total:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: right;"><strong>₹${updatedOrder.totalAmount}</strong></td>
            </tr>
            <tr>
              <td colspan="3" style="padding: 8px; border: 1px solid #ddd; text-align: right;"><strong>Restaurant Charges:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: right;"><strong>₹${restaurantCharge}</strong></td>
            </tr>
            <tr>
              <td colspan="3" style="padding: 8px; border: 1px solid #ddd; text-align: right;"><strong>Platform Fee:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: right;"><strong>₹${platformFee}</strong></td>
            </tr>
            <tr>
              <td colspan="3" style="padding: 8px; border: 1px solid #ddd; text-align: right;"><strong>Packing Charges:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: right;"><strong>₹${packingCharge}</strong></td>
            </tr>
            ${finalTotalRow}
          </tbody>
        </table>
        <p>Thank you for ordering from ${updatedOrder.canteenName}!</p>
      `;


        const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD,
        },
      });


          
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: 'Your Order Invoice - Cafe BMSCE',
        html: invoiceHtml,
      });





      return res.status(200).json({
        message: 'Order status updated successfully',
        order: {
          _id: updatedOrder._id,
          status: updatedOrder.status,
          updatedAt: updatedOrder.updatedAt
        }
      });
    }

    // If no order found
    return res.status(404).json({ 
      error: 'Order not found' 
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      error: 'Failed to update order status',
      message: error.message 
    });
  }
});



// App.put('/api/updateOrderStatus', async (req, res) => {
//   try {
//     const {fullName,email, orderId} = req.body;
// 	  const status = req.body.status;

// 	console.log(fullName,email,orderId,status);

//     // Validate input
//      if (!fullName || !email || !orderId || !status) {
//       return res.status(400).json({ 
//         error: 'Missing required fields:UserName ,email, orderId and status are required' 
//       });
//     }


//     // Validate status value
//     const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
//     if (!validStatuses.includes(status.toLowerCase())) {
//       return res.status(400).json({ 
//         error: 'Invalid status. Must be one of: pending, shipped, delivered, cancelled' 
//       });
//     }

    
//     // Method 3: If you have a separate Order collection
//     const updatedOrder = await Order.findByIdAndUpdate(
//       orderId,
//       { 
//         status: status.toLowerCase(),
//         updatedAt: new Date()
//       },
//       { new: true, runValidators: true }
//     );

//     if (updatedOrder) {

//    const transporter = nodemailer.createTransport({
//         service: 'Gmail',
//         auth: {
//           user: process.env.EMAIL,
//           pass: process.env.EMAIL_PASSWORD,
//         },
//       });


//     await transporter.sendMail({
//       from: process.env.EMAIL,
//       to: email,
//       subject: 'Your Status Has been Updated By Cafe BMSCE',
//       html: `<p>${fullName} Your Order Status: <strong>${updatedOrder.status}</strong>. 
//       Thank you for Ordering .</p>`,
//     });




	    
//       return res.status(200).json({
//         message: 'Order status updated successfully',
//         order: {
//           _id: updatedOrder._id,
//           status: updatedOrder.status,
//           updatedAt: updatedOrder.updatedAt
//         }
//       });
//     }

//     // If no order found
//     return res.status(404).json({ 
//       error: 'Order not found' 
//     });

//   } catch (error) {
//     console.error('Error updating order status:', error);
//     res.status(500).json({ 
//       error: 'Failed to update order status',
//       message: error.message 
//     });
//   }
// });





App.listen(PORT,'0.0.0.0',err=>{

    connectToMongoDB();

    if(err)
        console.log(err)
    else
        console.log("Server Running at port "+PORT)
})

