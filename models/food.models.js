// models/Food.js
const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  imgUrl: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Drinks'], // optional: restrict to known categories
  },
  qty: {
    type: Number,
    required: true,
    default: 0,
  }
}, {
  timestamps: true, // optional: adds createdAt and updatedAt
});

const Food = mongoose.model('Food', foodSchema,'Food');

module.exports = Food;
