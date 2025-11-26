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

// const mongoose = require('mongoose');

// const menuItemSchema = new mongoose.Schema({
//   id: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   name: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   description: {
//     type: String,
//     required: true
//   },
//   price: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//   category: {
//     type: String,
//     required: true
//   },
//   image: {
//     type: String,
//     default: '/menu-images/placeholder.jpg'
//   },
//   preparationTime: {
//     type: Number,
//     default: 15,
//     min: 1
//   },
//   isVegetarian: {
//     type: Boolean,
//     default: false
//   },
//   isAvailable: {
//     type: Boolean,
//     default: true
//   },
//   ingredients: [{
//     type: String
//   }]
// }, {
//   timestamps: true
// });

// module.exports = mongoose.model('MenuItem', menuItemSchema);




const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Menu item name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    max: [10000, 'Price seems too high']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: [
        'Starters',
        'Main Course', 
        'Biryani',
        'Chinese',
        'Italian',
        'Desserts',
        'Beverages',
        'Specials',
        'Coffee',
        'Tea',
        'Sandwiches',
        'Salads',
        'Pastries',
        'Breakfast',
        'Lunch',
        'Dinner',
        'Appetizers',
        'Soups',
        'Snacks'
      ],
      message: '{VALUE} is not a valid category'
    }
  },
  image: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true // Empty string is allowed
        return /^https?:\/\/.+\..+/.test(v)
      },
      message: 'Please provide a valid image URL'
    }
  },
  isVegetarian: {
    type: Boolean,
    default: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  preparationTime: {
    type: Number,
    default: 15,
    min: [1, 'Preparation time must be at least 1 minute'],
    max: [240, 'Preparation time cannot exceed 4 hours']
  },
  ingredients: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Add index for better performance
menuItemSchema.index({ name: 'text', description: 'text' });
menuItemSchema.index({ category: 1, isAvailable: 1 });
menuItemSchema.index({ isAvailable: 1 });

// Add a pre-save hook to log creation
menuItemSchema.pre('save', function(next) {
  console.log(`💾 Saving menu item: ${this.name} (${this._id})`);
  next();
});

// module.exports = mongoose.model('MenuItem', menuItemSchema);
// const menuItemSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   price: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//   description: {
//     type: String,
//     trim: true
//   },
//   category: {
//     type: String,
//     required: true,
//     enum: [
//       'Coffee',
//       'Tea', 
//       'Sandwiches',
//       'Salads',
//       'Pastries',
//       'Breakfast',
//       'Lunch',
//       'Dinner',
//       'Desserts',
//       'Beverages',
//       'Appetizers',
//       'Main Course',
//       'Soups',
//       'Snacks'
//     ]
//   },
//   image: {
//     type: String,
//     trim: true
//   },
//   isVegetarian: {
//     type: Boolean,
//     default: true
//   },
//   isAvailable: {
//     type: Boolean,
//     default: true
//   },
//   preparationTime: {
//     type: Number,
//     default: 15,
//     min: 1,
//     max: 120
//   },
//   ingredients: [{
//     type: String,
//     trim: true
//   }],
//   tags: [{
//     type: String,
//     trim: true
//   }]
// }, {
//   timestamps: true
// });

// Index for better search performance
menuItemSchema.index({ name: 1, category: 1 });
menuItemSchema.index({ isAvailable: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);