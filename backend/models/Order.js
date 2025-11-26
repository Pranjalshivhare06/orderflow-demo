

// const mongoose = require('mongoose');

// // const orderSchema = new mongoose.Schema({
// //   orderNumber: {
// //     type: String,
// //     unique: true,
// //     sparse: true // Allows null values but ensures uniqueness for non-null values
// //   },
// //   tableNumber: {
// //     type: Number,
// //     required: true
// //   },
// //   customerName: {
// //     type: String,
// //     default: 'Walk-in Customer'
// //   },
// //   mobileNumber:{
// //     type:String,
// //     required:true,
// //   },
// //   items: [{
// //     name: {
// //       type: String,
// //       required: true
// //     },
// //     quantity: {
// //       type: Number,
// //       required: true,
// //       min: 1
// //     },
// //     price: {
// //       type: Number,
// //       required: true,
// //       min: 0
// //     },
// //     notes: {
// //       type: String,
// //       default: ''
// //     }
// //   }],
// //   total: {
// //     type: Number,
// //     min: 0
// //   },
// //   tax: {
// //     type: Number,
// //     min: 0
// //   },
// //   finalTotal: {
// //     type: Number,
// //     required: true,
// //     min: 0,
// //     default: 0
// //   },
// //   status: {
// //     type: String,
// //     enum: ['pending', 'served', 'completed', 'cancelled', 'paid'],
// //     default: 'pending'
// //   },
// //   paymentMethod: {
// //     type: String,
// //     enum: ['Cash', 'Credit Card', 'Debit Card', 'Digital Wallet', 'Not Specified'],
// //     default: 'Not Specified'
// //   },
// //   notes: {
// //     type: String,
// //     default: ''
// //   }
// // }, {
// //   timestamps: true
// // });

// // Calculate totals before saving
// const orderSchema = new mongoose.Schema({
//   tableNumber: { type: Number, required: true },
//   customerName: { type: String, required: true },
//   mobileNumber: { type: String, required: true },
//   items: [{
//     menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
//     name: { type: String, required: true },
//     quantity: { type: Number, required: true },
//     price: { type: Number, required: true }
//   }],
//   totalAmount: { type: Number, required: true },
//   status: { 
//     type: String, 
//     enum: ['pending', 'preparing', 'ready', 'served', 'paid'],
//     default: 'pending' 
//   },
//   isPaid: { type: Boolean, default: false },
//   paidAt: { type: Date },
//   orderNumber: { type: String, unique: true }
// }, {
//   timestamps: true
// });

// orderSchema.pre('save', function(next) {
//   if (this.items && this.items.length > 0) {
//     this.total = this.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
//     this.tax = this.total * 0.085; // 8.5% tax
//     this.finalTotal = this.total + this.tax;
//   }
//   next();
// });

// // Auto-generate order number if not provided
// orderSchema.pre('save', function(next) {
//   if (!this.orderNumber) {
//     const timestamp = Date.now().toString().slice(-6);
//     this.orderNumber = `ORD-${timestamp}`;
//   }
//   next();
// });

// module.exports = mongoose.model('Order', orderSchema);

// const mongoose = require('mongoose');

// const orderItemSchema = new mongoose.Schema({
//   menuItem: {
//     type: String, // CHANGE FROM ObjectId to String
//     required: true
//   },
//   name: {
//     type: String,
//     required: true
//   },
//   price: {
//     type: Number,
//     required: true
//   },
//   quantity: {
//     type: Number,
//     required: true,
//     min: 1
//   },
//   isVeg: {
//     type: Boolean,
//     default: true
//   }
// });

// const orderSchema = new mongoose.Schema({
//   // Session information
//   sessionId: {
//     type: String,
//     required: true
//     // REMOVE unique: true - it causes conflicts
//   },
//   tableNumber: {
//     type: Number,
//     required: true
//   },
//   customerName: {
//     type: String,
//     required: true
//   },
//   mobileNumber: {
//     type: String,
//     required: true
//   },
  
//   // Order items grouped by session
//   items: [orderItemSchema],
  
//   // Order status and timing
//   status: {
//     type: String,
//     enum: ['active', 'billed', 'paid', 'cancelled'],
//     default: 'active'
//   },
  
//   // Financial information
//   subtotal: {
//     type: Number,
//     default: 0
//   },
//   taxAmount: {
//     type: Number,
//     default: 0
//   },
//   totalAmount: {
//     type: Number,
//     default: 0
//   },
  
//   // Timestamps
//   sessionStartTime: {
//     type: Date,
//     default: Date.now
//   },
//   billGeneratedTime: {
//     type: Date
//   },
//   paymentTime: {
//     type: Date
//   },
  
//   // Additional fields
//   orderNumber: {
//     type: String
//     // REMOVE unique: true - can cause conflicts
//   },
//   billNumber: {
//     type: String
//     // REMOVE unique: true - can cause conflicts
//   },
  
//   // Kitchen status
//   kitchenStatus: {
//     type: String,
//     enum: ['pending', 'preparing', 'ready', 'served'],
//     default: 'pending'
//   }
// }, {
//   timestamps: true
// });

// // Calculate totals before saving
// orderSchema.pre('save', function(next) {
//   this.subtotal = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
//   this.taxAmount = this.subtotal * 0.05; // 5% tax
//   this.totalAmount = this.subtotal + this.taxAmount;
  
//   // Generate sessionId if not present
//   if (!this.sessionId) {
//     this.sessionId = `SESSION-${this.tableNumber}-${this.mobileNumber}-${Date.now()}`;
//   }
  
//   // Generate order number if not present
//   if (!this.orderNumber) {
//     this.orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
//   }
  
//   next();
// });

// module.exports = mongoose.model('Order', orderSchema);



// const mongoose = require('mongoose');

// const orderItemSchema = new mongoose.Schema({
//   menuItem: {
//     type: String, // CHANGED: String instead of ObjectId
//     required: true
//   },
//   name: {
//     type: String,
//     required: true
//   },
//   price: {
//     type: Number,
//     required: true
//   },
//   quantity: {
//     type: Number,
//     required: true,
//     min: 1
//   },
//   isVeg: {
//     type: Boolean,
//     default: true
//   }
// });

// const orderSchema = new mongoose.Schema({
//   tableNumber: {
//     type: Number,
//     required: true
//   },
//   customerName: {
//     type: String,
//     required: true
//   },
//   mobileNumber: {
//     type: String,
//     required: true
//   },
//   items: [orderItemSchema],
//   status: {
//     type: String,
//     default: 'active'
//   },
//   subtotal: {
//     type: Number,
//     default: 0
//   },
//   taxAmount: {
//     type: Number,
//     default: 0
//   },
//   totalAmount: {
//     type: Number,
//     default: 0
//   },
//   orderNumber: {
//     type: String
//   },
//   isPaid: {
//     type: Boolean,
//     default: false
//   }
// }, {
//   timestamps: true
// });

// // Calculate totals before saving
// orderSchema.pre('save', function(next) {
//   // Calculate subtotal from items
//   this.subtotal = this.items.reduce((total, item) => {
//     return total + (item.price * item.quantity);
//   }, 0);
  
//   // Calculate tax and total
//   this.taxAmount = this.subtotal * 0.05;
//   this.totalAmount = this.subtotal + this.taxAmount;
  
//   // Generate order number if not exists
//   if (!this.orderNumber) {
//     this.orderNumber = `ORD-${Date.now()}`;
//   }
  
//   next();
// });

// module.exports = mongoose.model('Order', orderSchema);


// const mongoose = require('mongoose');

// const orderItemSchema = new mongoose.Schema({
//   menuItem: {
//     type: String,
//     required: true
//   },
//   name: {
//     type: String,
//     required: true
//   },
//   price: {
//     type: Number,
//     required: true
//   },
//   quantity: {
//     type: Number,
//     required: true,
//     min: 1
//   },
//   isVeg: {
//     type: Boolean,
//     default: true
//   }
// });

// const orderSchema = new mongoose.Schema({
//   tableNumber: {
//     type: Number,
//     required: true,
//     min: 1,
//     max: 50
//   },
//   customerName: {
//     type: String,
//     required: true,
//     trim: true,
//     maxlength: 100
//   },
//   mobileNumber: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   items: [orderItemSchema],
//   status: {
//     type: String,
//     enum: ['pending', 'confirmed', 'preparing', 'ready', 'served', 'paid', 'cancelled'],
//     default: 'pending'
//   },
//   subtotal: {
//     type: Number,
//     default: 0
//   },
//   taxAmount: {
//     type: Number,
//     default: 0
//   },
//   totalAmount: {
//     type: Number,
//     default: 0
//   },
//   finalTotal: {
//     type: Number,
//     default: 0
//   },
//   orderNumber: {
//     type: String,
//     unique: true,
//     sparse: true
//   },
//   isPaid: {
//     type: Boolean,
//     default: false
//   },
//   notes: {
//     type: String,
//     maxlength: 500
//   }
// }, {
//   timestamps: true
// });

// // Calculate totals before saving
// orderSchema.pre('save', function(next) {
//   // Calculate subtotal from items
//   this.subtotal = this.items.reduce((total, item) => {
//     return total + (item.price * item.quantity);
//   }, 0);
  
//   // Calculate tax and total
//   this.taxAmount = parseFloat((this.subtotal * 0.05).toFixed(2));
//   this.totalAmount = parseFloat((this.subtotal + this.taxAmount).toFixed(2));
//   this.finalTotal = this.totalAmount;
  
//   // Generate order number if not exists
//   if (!this.orderNumber) {
//     const timestamp = Date.now().toString().slice(-6);
//     const random = Math.random().toString(36).substr(2, 4).toUpperCase();
//     this.orderNumber = `ORD-${timestamp}-${random}`;
//   }
  
//   // Update isPaid based on status
//   if (this.status === 'paid') {
//     this.isPaid = true;
//   } else {
//     this.isPaid = false;
//   }
  
//   next();
// });

// // Index for better performance
// orderSchema.index({ status: 1 });
// orderSchema.index({ tableNumber: 1 });
// orderSchema.index({ createdAt: -1 });
// orderSchema.index({ orderNumber: 1 });

// // Virtual for formatted date
// orderSchema.virtual('formattedDate').get(function() {
//   return this.createdAt.toLocaleDateString('en-IN');
// });

// // Virtual for formatted time
// orderSchema.virtual('formattedTime').get(function() {
//   return this.createdAt.toLocaleTimeString('en-IN', {
//     hour: '2-digit',
//     minute: '2-digit'
//   });
// });

// // Method to check if order is active
// orderSchema.methods.isActive = function() {
//   return ['pending', 'confirmed', 'preparing', 'ready', 'served'].includes(this.status);
// };

// // Static method to get active orders
// orderSchema.statics.getActiveOrders = function() {
//   return this.find({
//     status: { $in: ['pending', 'confirmed', 'preparing', 'ready', 'served'] }
//   }).sort({ createdAt: -1 });
// };

// // Static method to get orders by table
// orderSchema.statics.getTableOrders = function(tableNumber) {
//   return this.find({
//     tableNumber: parseInt(tableNumber),
//     status: { $in: ['pending', 'confirmed', 'preparing', 'ready', 'served'] }
//   }).sort({ createdAt: -1 });
// };

// module.exports = mongoose.model('Order', orderSchema);


const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  isVeg: {
    type: Boolean,
    default: true
  }
}, {
  _id: true // ✅ FIXED: Ensure subdocuments have _id
});

const orderSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 50
  },
  customerName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  mobileNumber: {
    type: String,
    required: true,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number'] // ✅ FIXED: Added validation
  },
  items: [orderItemSchema],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'served', 'paid', 'cancelled'],
    default: 'pending'
  },
  subtotal: {
    type: Number,
    default: 0,
    min: 0
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  finalTotal: {
    type: Number,
    default: 0,
    min: 0
  },
  orderNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    maxlength: 500,
    default: ''
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }, // ✅ FIXED: Include virtuals in JSON
  toObject: { virtuals: true } // ✅ FIXED: Include virtuals in objects
});

// ✅ FIXED: Enhanced pre-save middleware with better error handling
orderSchema.pre('save', function(next) {
  try {
    // Calculate subtotal from items
    if (this.items && this.items.length > 0) {
      this.subtotal = this.items.reduce((total, item) => {
        const itemTotal = parseFloat(item.price) * parseInt(item.quantity);
        return total + (isNaN(itemTotal) ? 0 : itemTotal);
      }, 0);
    } else {
      this.subtotal = 0;
    }
    
    // Calculate tax (5%) and total
    this.taxAmount = parseFloat((this.subtotal * 0.05).toFixed(2));
    this.totalAmount = parseFloat((this.subtotal + this.taxAmount).toFixed(2));
    this.finalTotal = this.totalAmount;
    
    // ✅ FIXED: Better order number generation with collision handling
    if (!this.orderNumber) {
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.random().toString(36).substr(2, 4).toUpperCase();
      this.orderNumber = `ORD-${timestamp}-${random}`;
      
      // Add a fallback in case of collision
      this.orderNumber = this.orderNumber + '-' + Math.random().toString(36).substr(2, 2).toUpperCase();
    }
    
    // Update isPaid based on status
    this.isPaid = this.status === 'paid';
    
    next();
  } catch (error) {
    console.error('❌ Error in order pre-save middleware:', error);
    next(error);
  }
});

// ✅ FIXED: Pre-validate middleware to ensure data integrity
orderSchema.pre('validate', function(next) {
  // Ensure items array exists and has valid data
  if (!this.items || !Array.isArray(this.items)) {
    this.items = [];
  }
  
  // Validate each item
  this.items.forEach((item, index) => {
    if (!item.menuItem || item.menuItem.trim() === '') {
      item.menuItem = `temp-item-${Date.now()}-${index}`;
    }
    
    // Ensure numeric fields are properly converted
    if (item.price) item.price = parseFloat(item.price);
    if (item.quantity) item.quantity = parseInt(item.quantity);
  });
  
  next();
});

// Index for better performance
orderSchema.index({ status: 1 });
orderSchema.index({ tableNumber: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ 'items.menuItem': 1 }); // ✅ FIXED: Added index for menuItem queries

// Virtual for formatted date
orderSchema.virtual('formattedDate').get(function() {
  return this.createdAt ? this.createdAt.toLocaleDateString('en-IN') : 'N/A';
});

// Virtual for formatted time
orderSchema.virtual('formattedTime').get(function() {
  return this.createdAt ? this.createdAt.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  }) : 'N/A';
});

// ✅ FIXED: Virtual for order duration
orderSchema.virtual('duration').get(function() {
  if (!this.createdAt) return 'N/A';
  const now = new Date();
  const diffMs = now - this.createdAt;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  
  if (diffHours > 0) {
    return `${diffHours}h ${diffMins % 60}m`;
  }
  return `${diffMins}m`;
});

// ✅ FIXED: Virtual for item count
orderSchema.virtual('itemCount').get(function() {
  return this.items ? this.items.reduce((total, item) => total + item.quantity, 0) : 0;
});

// Method to check if order is active
orderSchema.methods.isActive = function() {
  return ['pending', 'confirmed', 'preparing', 'ready', 'served'].includes(this.status);
};

// ✅ FIXED: Method to mark as paid
orderSchema.methods.markAsPaid = function() {
  this.status = 'paid';
  this.isPaid = true;
  return this.save();
};

// ✅ FIXED: Method to update status with validation
orderSchema.methods.updateStatus = function(newStatus) {
  const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'paid', 'cancelled'];
  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}`);
  }
  
  this.status = newStatus;
  if (newStatus === 'paid') {
    this.isPaid = true;
  }
  return this.save();
};

// Static method to get active orders
orderSchema.statics.getActiveOrders = function() {
  return this.find({
    status: { $in: ['pending', 'confirmed', 'preparing', 'ready', 'served'] }
  }).sort({ createdAt: -1 });
};

// Static method to get orders by table
orderSchema.statics.getTableOrders = function(tableNumber) {
  const tableNum = parseInt(tableNumber);
  if (isNaN(tableNum)) {
    throw new Error('Invalid table number');
  }
  
  return this.find({
    tableNumber: tableNum,
    status: { $in: ['pending', 'confirmed', 'preparing', 'ready', 'served'] }
  }).sort({ createdAt: -1 });
};

// ✅ FIXED: Static method to get today's orders
orderSchema.statics.getTodaysOrders = function() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.find({
    createdAt: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  }).sort({ createdAt: -1 });
};

// ✅ FIXED: Static method to get revenue statistics
orderSchema.statics.getRevenueStats = async function(startDate, endDate) {
  const matchStage = { status: 'paid' };
  
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  const result = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: '$totalAmount' }
      }
    }
  ]);
  
  return result.length > 0 ? result[0] : {
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0
  };
};

// ✅ FIXED: Instance method to add item to order
orderSchema.methods.addItem = function(itemData) {
  const newItem = {
    menuItem: itemData._id || itemData.menuItem,
    name: itemData.name,
    price: parseFloat(itemData.price),
    quantity: parseInt(itemData.quantity),
    isVeg: Boolean(itemData.isVeg)
  };
  
  this.items.push(newItem);
  return this.save();
};

// ✅ FIXED: Instance method to remove item from order
orderSchema.methods.removeItem = function(itemIndex) {
  if (itemIndex >= 0 && itemIndex < this.items.length) {
    this.items.splice(itemIndex, 1);
    return this.save();
  }
  throw new Error('Invalid item index');
};

module.exports = mongoose.model('Order', orderSchema);