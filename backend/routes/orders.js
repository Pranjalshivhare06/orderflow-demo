

// const express = require('express');
// const router = express.Router();
// const Order = require('../models/Order');



// router.get('/', async (req, res) => {
//   try {
//     const orders = await Order.find()
//       .sort({ createdAt: -1 })
//       .limit(100); // Increased limit for more orders
//     res.json(orders);
//   } catch (error) {
//     console.error('Error fetching orders:', error);
//     res.status(500).json({ message: 'Error fetching orders' });
//   }
// });

// // Update order status
// router.patch('/:id/status', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     console.log(`🔄 Updating order ${id} status to:`, status);

//     // Validate status
//     const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled'];
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({ 
//         message: 'Invalid status',
//         validStatuses: validStatuses 
//       });
//     }

//     // Find and update the order
//     const order = await Order.findByIdAndUpdate(
//       id,
//       { status: status },
//       { new: true, runValidators: true }
//     );

//     if (!order) {
//       return res.status(404).json({ message: 'Order not found' });
//     }

//     console.log(`✅ Order ${id} status updated to: ${status}`);

//     // Emit socket event for real-time updates
//     req.app.get('io').emit('order-status-updated', {
//       orderId: id,
//       newStatus: status,
//       order: order
//     });

//     res.json({
//       success: true,
//       message: `Order status updated to ${status}`,
//       order: order
//     });

//   } catch (error) {
//     console.error('❌ Error updating order status:', error);
    
//     if (error.name === 'ValidationError') {
//       return res.status(400).json({ 
//         message: 'Validation error',
//         errors: Object.values(error.errors).map(err => err.message)
//       });
//     }

//     if (error.name === 'CastError') {
//       return res.status(400).json({ message: 'Invalid order ID' });
//     }

//     res.status(500).json({ 
//       message: 'Error updating order status',
//       error: error.message 
//     });
//   }
// });

// router.put('/:id/status', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     console.log(`🔄 PUT: Updating order ${id} status to:`, status);

//     const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled'];
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({ 
//         message: 'Invalid status',
//         validStatuses: validStatuses 
//       });
//     }

//     const order = await Order.findById(id);
//     if (!order) {
//       return res.status(404).json({ message: 'Order not found' });
//     }

//     // Update status
//     order.status = status;
//     await order.save();

//     console.log(`✅ Order ${id} status updated to: ${status}`);

//     // Emit socket event
//     req.app.get('io').emit('order-status-updated', {
//       orderId: id,
//       newStatus: status,
//       order: order
//     });

//     res.json({
//       success: true,
//       message: `Order status updated to ${status}`,
//       order: order
//     });

//   } catch (error) {
//     console.error('❌ Error in PUT status update:', error);
//     res.status(500).json({ 
//       message: 'Error updating order status',
//       error: error.message 
//     });
//   }
// });

// // Get order by ID
// router.get('/:id', async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id);
//     if (!order) {
//       return res.status(404).json({ message: 'Order not found' });
//     }
//     res.json(order);
//   } catch (error) {
//     console.error('Error fetching order:', error);
//     res.status(500).json({ message: 'Error fetching order' });
//   }
// });

// // Create new order
// router.post('/', async (req, res) => {
//   try {
//     // Generate order number if not provided
//     if (!req.body.orderNumber) {
//       const date = new Date();
//       const timestamp = date.getTime().toString().slice(-6);
//       req.body.orderNumber = `ORD-${timestamp}`;
//     }

//     const order = new Order(req.body);
//     await order.save();
//     res.status(201).json(order);
// //     res.status(201).json({ 
// //   message: 'Order placed successfully', 
// //   order 
// // });

//   } catch (error) {
//     console.error('Error creating order:', error);
//     res.status(400).json({ message: error.message });
//   }
// });

// // Update order
// router.put('/:id', async (req, res) => {
//   try {
//     const order = await Order.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true, runValidators: true }
//     );
//     if (!order) {
//       return res.status(404).json({ message: 'Order not found' });
//     }
//     res.json(order);
//   } catch (error) {
//     console.error('Error updating order:', error);
//     res.status(400).json({ message: error.message });
//   }
// });

// // Delete order
// router.delete('/:id', async (req, res) => {
//   try {
//     const order = await Order.findByIdAndDelete(req.params.id);
//     if (!order) {
//       return res.status(404).json({ message: 'Order not found' });
//     }
//     res.json({ message: 'Order deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting order:', error);
//     res.status(500).json({ message: error.message });
//   }
// });

// // Get today's order statistics
// // router.get('/stats/today', async (req, res) => {
// //   try {
// //     // Get today's date range
// //     const today = new Date();
// //     today.setHours(0, 0, 0, 0);
// //     const tomorrow = new Date(today);
// //     tomorrow.setDate(tomorrow.getDate() + 1);

// //     // Get all orders from today
// //     const todayOrders = await Order.find({
// //       createdAt: {
// //         $gte: today,
// //         $lt: tomorrow
// //       }
// //     });

// //     // Calculate statistics
// //     const totalOrders = todayOrders.length;
    
// //     const pendingOrders = todayOrders.filter(order => 
// //       ['pending', 'confirmed', 'preparing'].includes(order.status)
// //     ).length;
    
// //     const totalRevenue = todayOrders
// //       .filter(order => order.status !== 'cancelled')
// //       .reduce((total, order) => total + (order.finalTotal || order.totalAmount || 0), 0);

// //     res.json({
// //       totalOrders,
// //       pendingOrders,
// //       totalRevenue,
// //       date: today.toISOString().split('T')[0]
// //     });

// //   } catch (error) {
// //     console.error('Error fetching today stats:', error);
// //     res.status(500).json({ 
// //       message: 'Error fetching statistics',
// //       error: error.message 
// //     });
// //   }
// // });

// // GET /orders/stats/today
// router.get('/stats/today', async (req, res) => {
//   try {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);

//     const todayOrders = await Order.find({
//       createdAt: { $gte: today, $lt: tomorrow }
//     });

//     const totalOrders = todayOrders.length;
//     const pendingOrders = todayOrders.filter(order => order.status === 'pending').length;
//     const totalRevenue = todayOrders.reduce((sum, order) => sum + (order.finalTotal || 0), 0);

//     res.json({ totalOrders, pendingOrders, totalRevenue });
//   } catch (error) {
//     console.error('Error fetching today’s stats:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });

// // Get comprehensive statistics
// router.get('/stats/overview', async (req, res) => {
//   try {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);

//     // Today's stats
//     const todayOrders = await Order.find({
//       createdAt: { $gte: today, $lt: tomorrow }
//     });

//     // All time stats
//     const allOrders = await Order.find({});
    
//     // Status counts
//     const statusCounts = {
//       pending: allOrders.filter(order => order.status === 'pending').length,
//       confirmed: allOrders.filter(order => order.status === 'confirmed').length,
//       preparing: allOrders.filter(order => order.status === 'preparing').length,
//       ready: allOrders.filter(order => order.status === 'ready').length,
//       served: allOrders.filter(order => order.status === 'served').length,
//       cancelled: allOrders.filter(order => order.status === 'cancelled').length
//     };

//     const stats = {
//       today: {
//         totalOrders: todayOrders.length,
//         pendingOrders: todayOrders.filter(order => 
//           ['pending', 'confirmed', 'preparing'].includes(order.status)
//         ).length,
//         revenue: todayOrders
//           .filter(order => order.status !== 'cancelled')
//           .reduce((total, order) => total + (order.finalTotal || order.totalAmount || 0), 0)
//       },
//       allTime: {
//         totalOrders: allOrders.length,
//         totalRevenue: allOrders
//           .filter(order => order.status !== 'cancelled')
//           .reduce((total, order) => total + (order.finalTotal || order.totalAmount || 0), 0),
//         averageOrderValue: allOrders.length > 0 ? 
//           allOrders.reduce((total, order) => total + (order.finalTotal || order.totalAmount || 0), 0) / allOrders.length : 0
//       },
//       statusCounts
//     };

//     res.json(stats);

//   } catch (error) {
//     console.error('Error fetching overview stats:', error);
//     res.status(500).json({ message: 'Error fetching statistics' });
//   }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Utility function for date range
const getTodayDateRange = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return { today, tomorrow };
};

// Status validation
const validateStatus = (status) => {
  const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled'];
  return validStatuses.includes(status);
};

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json({
      success: true,
      data: orders,
      count: orders.length
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching orders',
      error: error.message 
    });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
});

// Create new order
router.post('/', async (req, res) => {
  try {
    // Generate order number if not provided
    if (!req.body.orderNumber) {
      const timestamp = Date.now().toString().slice(-6);
      req.body.orderNumber = `ORD-${timestamp}`;
    }

    const order = new Order(req.body);
    await order.save();
    
    // Emit socket event for new order
    req.app.get('io').emit('new-order', order);
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
});

// Update order status (PATCH)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`🔄 Updating order ${id} status to:`, status);

    // Validate status
    if (!validateStatus(status)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid status',
        validStatuses: ['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled']
      });
    }

    // Find and update the order
    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    console.log(`✅ Order ${id} status updated to: ${status}`);

    // Emit socket event for real-time updates
    req.app.get('io').emit('order-status-updated', order);

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order
    });

  } catch (error) {
    console.error('❌ Error updating order status:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid order ID' 
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Error updating order status',
      error: error.message 
    });
  }
});

// Update order status (PUT - alternative)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`🔄 PUT: Updating order ${id} status to:`, status);

    if (!validateStatus(status)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid status',
        validStatuses: ['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled']
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Update status
    order.status = status;
    await order.save();

    console.log(`✅ Order ${id} status updated to: ${status}`);

    // Emit socket event
    req.app.get('io').emit('order-status-updated', order);

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order
    });

  } catch (error) {
    console.error('❌ Error in PUT status update:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating order status',
      error: error.message 
    });
  }
});

// NEW: Update order status by order number
router.patch('/order-number/:orderNumber/status', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { status } = req.body;

    console.log(`🔄 Updating order ${orderNumber} status to:`, status);

    if (!validateStatus(status)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid status',
        validStatuses: ['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled']
      });
    }

    // Find order by orderNumber instead of _id
    const order = await Order.findOneAndUpdate(
      { orderNumber },
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    console.log(`✅ Order ${orderNumber} status updated to: ${status}`);

    // Emit socket event
    req.app.get('io').emit('order-status-updated', order);

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order
    });

  } catch (error) {
    console.error('❌ Error updating order status by order number:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating order status',
      error: error.message 
    });
  }
});

// Update entire order
router.put('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Order updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Error updating order:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Error updating order',
      error: error.message
    });
  }
});

// Delete order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Order deleted successfully',
      data: { id: req.params.id }
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting order',
      error: error.message
    });
  }
});

// Get today's order statistics
router.get('/stats/today', async (req, res) => {
  try {
    const { today, tomorrow } = getTodayDateRange();

    const todayOrders = await Order.find({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    const totalOrders = todayOrders.length;
    const pendingOrders = todayOrders.filter(order => 
      ['pending', 'confirmed', 'preparing'].includes(order.status)
    ).length;
    
    const totalRevenue = todayOrders
      .filter(order => order.status !== 'cancelled')
      .reduce((total, order) => total + (order.finalTotal || 0), 0);

    res.json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        totalRevenue,
        date: today.toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error('Error fetching today stats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching statistics',
      error: error.message 
    });
  }
});

// Get comprehensive statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const { today, tomorrow } = getTodayDateRange();

    // Today's stats
    const todayOrders = await Order.find({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    // All time stats
    const allOrders = await Order.find();
    
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
          .reduce((total, order) => total + (order.finalTotal || 0), 0)
      },
      allTime: {
        totalOrders: allOrders.length,
        totalRevenue: allOrders
          .filter(order => order.status !== 'cancelled')
          .reduce((total, order) => total + (order.finalTotal || 0), 0),
        averageOrderValue: allOrders.length > 0 ? 
          allOrders
            .filter(order => order.status !== 'cancelled')
            .reduce((total, order) => total + (order.finalTotal || 0), 0) / 
          allOrders.filter(order => order.status !== 'cancelled').length : 0
      },
      statusCounts
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching overview stats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching statistics',
      error: error.message 
    });
  }
});

module.exports = router;