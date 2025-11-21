// const mongoose = require('mongoose');

// const menuItemSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true
//   },
//   description: String,
//   price: {
//     type: Number,
//     required: true
//   },
//   category: {
//     type: String,
//     required: true
//   },
//   image:{
//     type: String,
//     default: ''
//   },
//   isAvailable: {
//     type: Boolean,
//     default: true
//   },
//   preparationTime: {
//     type: Number, // in minutes
//     default: 15
//   }
// }, {
//   timestamps: true
// });

// module.exports = mongoose.model('MenuItem', menuItemSchema);

const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: '/menu-images/placeholder.jpg'
  },
  preparationTime: {
    type: Number,
    default: 15,
    min: 1
  },
  isVegetarian: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  ingredients: [{
    type: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('MenuItem', menuItemSchema);