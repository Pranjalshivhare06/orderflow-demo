// const express = require('express');
// const router = express.Router();
// const Order = require('../models/Order'); // Make sure this import exists

// // Create new order
// router.post('/', async (req, res) => {
//   try {
//     const { tableNumber, customerName, mobileNumber, items, specialInstructions } = req.body;
    
//     if (!tableNumber || !customerName || !mobileNumber || !items || items.length === 0) {
//       return res.status(400).json({ message: 'All fields are required' });
//     }
    
//     // Calculate total amount
//     let totalAmount = 0;
//     const orderItems = items.map(item => {
//       const itemTotal = item.price * item.quantity;
//       totalAmount += itemTotal;
//       return item;
//     });
    
//     const order = new Order({
//       tableNumber,
//       customerName,
//       mobileNumber,
//       items: orderItems,
//       totalAmount,
//       specialInstructions
//     });
    
//     await order.save();
    
//     // Send real-time notification to reception
//     const io = req.app.get('io');
//     io.to('reception').emit('new-order', order);
    
//     res.status(201).json({
//       message: 'Order placed successfully',
//       order: order
//     });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// // Get all orders
// router.get('/', async (req, res) => {
//   try {
//     const orders = await Order.find()
//       .populate('items.menuItem')
//       .sort({ createdAt: -1 });
//     res.json(orders);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });


// // router.get('/', async (req, res) => {
// //   try {
// //     const orders = await Order.find({ status: 'completed' })
// //       .sort({ createdAt: -1 })
// //       .limit(50);
// //     res.json(orders);
// //   } catch (error) {
// //     console.error('Error fetching orders:', error);
// //     res.status(500).json({ message: 'Error fetching orders' });
// //   }
// // });


// // Get orders by table number
// router.get('/table/:tableNumber', async (req, res) => {
//   try {
//     const orders = await Order.find({ tableNumber: req.params.tableNumber })
//       .populate('items.menuItem')
//       .sort({ createdAt: -1 });
//     res.json(orders);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Update order status
// router.patch('/:id/status', async (req, res) => {
//   try {
//     const { status } = req.body;
//     const order = await Order.findByIdAndUpdate(
//       req.params.id,
//       { status },
//       { new: true }
//     ).populate('items.menuItem');
    
//     res.json({
//       message: 'Order status updated successfully',
//       order: order
//     });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// // Get order statistics - ADD THIS TO ORDERS.JS
// router.get('/stats/today', async (req, res) => {
//   try {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);

//     // Get all orders for today
//     const todayOrders = await Order.find({
//       createdAt: { $gte: today, $lt: tomorrow }
//     });

//     // Calculate stats manually
//     const totalOrders = todayOrders.length;
    
//     const pendingOrders = todayOrders.filter(order => 
//       ['pending', 'confirmed', 'preparing'].includes(order.status)
//     ).length;

//     const totalRevenue = todayOrders
//       .filter(order => order.status !== 'cancelled')
//       .reduce((total, order) => total + (order.totalAmount || 0), 0);

//     res.json({
//       totalOrders,
//       pendingOrders,
//       totalRevenue
//     });
//   } catch (error) {
//     console.error('Error fetching stats:', error);
//     res.status(500).json({ 
//       message: 'Error fetching statistics',
//       error: error.message 
//     });
//   }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Add this to your routes/orders.js for testing
router.post('/test/sample', async (req, res) => {
  try {
    const sampleOrders = [
      {
        tableNumber: 1,
        customerName: 'Test Customer 1',
        items: [
          { name: 'Margherita Pizza', quantity: 1, price: 12.99 },
          { name: 'Garlic Bread', quantity: 2, price: 4.99 },
          { name: 'Coke', quantity: 1, price: 2.50 }
        ],
        status: 'completed',
        paymentMethod: 'Credit Card'
      },
      {
        tableNumber: 2,
        customerName: 'Test Customer 2',
        items: [
          { name: 'Pasta Carbonara', quantity: 1, price: 14.99 },
          { name: 'Caesar Salad', quantity: 1, price: 8.99 }
        ],
        status: 'completed',
        paymentMethod: 'Cash'
      }
    ];

    const createdOrders = await Order.insertMany(sampleOrders);
    res.json({ message: 'Sample orders created', orders: createdOrders });
  } catch (error) {
    console.error('Error creating sample orders:', error);
    res.status(500).json({ message: 'Error creating sample orders' });
  }
});

// Get all orders for billing
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(100); // Increased limit for more orders
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Error fetching order' });
  }
});

// Create new order
router.post('/', async (req, res) => {
  try {
    // Generate order number if not provided
    if (!req.body.orderNumber) {
      const date = new Date();
      const timestamp = date.getTime().toString().slice(-6);
      req.body.orderNumber = `ORD-${timestamp}`;
    }

    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
//     res.status(201).json({ 
//   message: 'Order placed successfully', 
//   order 
// });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update order
router.put('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get today's order statistics
// router.get('/stats/today', async (req, res) => {
//   try {
//     // Get today's date range
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);

//     // Get all orders from today
//     const todayOrders = await Order.find({
//       createdAt: {
//         $gte: today,
//         $lt: tomorrow
//       }
//     });

//     // Calculate statistics
//     const totalOrders = todayOrders.length;
    
//     const pendingOrders = todayOrders.filter(order => 
//       ['pending', 'confirmed', 'preparing'].includes(order.status)
//     ).length;
    
//     const totalRevenue = todayOrders
//       .filter(order => order.status !== 'cancelled')
//       .reduce((total, order) => total + (order.finalTotal || order.totalAmount || 0), 0);

//     res.json({
//       totalOrders,
//       pendingOrders,
//       totalRevenue,
//       date: today.toISOString().split('T')[0]
//     });

//   } catch (error) {
//     console.error('Error fetching today stats:', error);
//     res.status(500).json({ 
//       message: 'Error fetching statistics',
//       error: error.message 
//     });
//   }
// });

// GET /orders/stats/today
router.get('/stats/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayOrders = await Order.find({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    const totalOrders = todayOrders.length;
    const pendingOrders = todayOrders.filter(order => order.status === 'pending').length;
    const totalRevenue = todayOrders.reduce((sum, order) => sum + (order.finalTotal || 0), 0);

    res.json({ totalOrders, pendingOrders, totalRevenue });
  } catch (error) {
    console.error('Error fetching today’s stats:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get comprehensive statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's stats
    const todayOrders = await Order.find({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    // All time stats
    const allOrders = await Order.find({});
    
    // Status counts
    const statusCounts = {
      pending: allOrders.filter(order => order.status === 'pending').length,
      confirmed: allOrders.filter(order => order.status === 'confirmed').length,
      preparing: allOrders.filter(order => order.status === 'preparing').length,
      ready: allOrders.filter(order => order.status === 'ready').length,
      served: allOrders.filter(order => order.status === 'served').length,
      cancelled: allOrders.filter(order => order.status === 'cancelled').length
    };

    const stats = {
      today: {
        totalOrders: todayOrders.length,
        pendingOrders: todayOrders.filter(order => 
          ['pending', 'confirmed', 'preparing'].includes(order.status)
        ).length,
        revenue: todayOrders
          .filter(order => order.status !== 'cancelled')
          .reduce((total, order) => total + (order.finalTotal || order.totalAmount || 0), 0)
      },
      allTime: {
        totalOrders: allOrders.length,
        totalRevenue: allOrders
          .filter(order => order.status !== 'cancelled')
          .reduce((total, order) => total + (order.finalTotal || order.totalAmount || 0), 0),
        averageOrderValue: allOrders.length > 0 ? 
          allOrders.reduce((total, order) => total + (order.finalTotal || order.totalAmount || 0), 0) / allOrders.length : 0
      },
      statusCounts
    };

    res.json(stats);

  } catch (error) {
    console.error('Error fetching overview stats:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

module.exports = router;

