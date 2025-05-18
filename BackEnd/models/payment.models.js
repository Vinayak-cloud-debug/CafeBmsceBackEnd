const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    Username: {
      type: String,
      required: true,
      unique:true,
    },
    PaidStatus: {
      type: String,
      required: true,
      unique:false,
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
