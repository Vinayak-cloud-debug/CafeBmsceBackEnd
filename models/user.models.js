const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female"],
    },
    resetPasswordToken: {
      type: String,
      default: "",
    },
    resetPasswordOtp: {
      type: String,
      default: "",
    },
    resetPasswordOtpExpiry: {
      type: String,
      default: "",
    },
    resetPasswordExpiry: {
      type: Date,
      default: Date.now(),
    },

    // 🆕 Add an orders array referencing the Order model
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      }
    ],
  },
  {
    timestamps: true,
    collection: "users",
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
