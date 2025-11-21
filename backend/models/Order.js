

const mongoose = require('mongoose');

// const orderSchema = new mongoose.Schema({
//   orderNumber: {
//     type: String,
//     unique: true,
//     sparse: true // Allows null values but ensures uniqueness for non-null values
//   },
//   tableNumber: {
//     type: Number,
//     required: true
//   },
//   customerName: {
//     type: String,
//     default: 'Walk-in Customer'
//   },
//   mobileNumber:{
//     type:String,
//     required:true,
//   },
//   items: [{
//     name: {
//       type: String,
//       required: true
//     },
//     quantity: {
//       type: Number,
//       required: true,
//       min: 1
//     },
//     price: {
//       type: Number,
//       required: true,
//       min: 0
//     },
//     notes: {
//       type: String,
//       default: ''
//     }
//   }],
//   total: {
//     type: Number,
//     min: 0
//   },
//   tax: {
//     type: Number,
//     min: 0
//   },
//   finalTotal: {
//     type: Number,
//     required: true,
//     min: 0,
//     default: 0
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'served', 'completed', 'cancelled', 'paid'],
//     default: 'pending'
//   },
//   paymentMethod: {
//     type: String,
//     enum: ['Cash', 'Credit Card', 'Debit Card', 'Digital Wallet', 'Not Specified'],
//     default: 'Not Specified'
//   },
//   notes: {
//     type: String,
//     default: ''
//   }
// }, {
//   timestamps: true
// });

// Calculate totals before saving
const orderSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true },
  customerName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  items: [{
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'preparing', 'ready', 'served', 'paid'],
    default: 'pending' 
  },
  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date },
  orderNumber: { type: String, unique: true }
}, {
  timestamps: true
});

orderSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.total = this.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    this.tax = this.total * 0.085; // 8.5% tax
    this.finalTotal = this.total + this.tax;
  }
  next();
});

// Auto-generate order number if not provided
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString().slice(-6);
    this.orderNumber = `ORD-${timestamp}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
