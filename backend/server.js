



// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');
// const mongoose = require('mongoose');
// const cors = require('cors'); 
// require('dotenv').config();

// const app = express();
// const server = http.createServer(app);

// app.use(express.json());
// app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
// app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// app.use(cors({
//   origin: ['https://dapper-muffin-326944.netlify.app', 'http://localhost:3000'],
//   credentials: true
// }));

// // Enhanced Socket.io configuration for Render
// const io = socketIo(server, {
//   cors: {
//     origin: [
//       "https://orderflow-frontend.onrender.com",
//       "http://localhost:3000",
//       "http://localhost:5173",
//       "*"
//     ],
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true
//   },
//   transports: ['websocket', 'polling'],
//   pingTimeout: 60000,
//   pingInterval: 25000,
//   allowEIO3: true
// });

// Middleware
// app.use(cors({
//   origin: [
//     "https://orderflow-frontend.onrender.com",
//     "http://localhost:3000",
//     "http://localhost:5173",
//     "*"
//   ],
//   credentials: true
// }));

// // Make io accessible to routes
// app.set('io', io);

// // Database connection with better error handling
// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant_ordering';

// mongoose.connect(MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   serverSelectionTimeoutMS: 5000,
//   socketTimeoutMS: 45000,
// })
// .then(() => {
//   console.log('✅ Connected to MongoDB successfully!');
// })
// .catch((error) => {
//   console.error('❌ MongoDB connection error:', error);
//   process.exit(1);
// });

// const db = mongoose.connection;
// db.on('error', (error) => {
//   console.error('❌ MongoDB connection error:', error);
// });
// db.on('connected', () => {
//   console.log('📊 MongoDB connection established');
// });
// db.on('disconnected', () => {
//   console.log('⚠️ MongoDB disconnected');
// });

// // Static files
// app.use('/uploads', express.static('uploads'));

// // Routes
// app.use('/api/upload', require('./routes/upload'));
// app.use('/api/menu', require('./routes/menu'));
// app.use('/api/init', require('./routes/init'));
// app.use('/api/tables', require('./routes/tables'));
// app.use('/api/orders', require('./routes/orders'));
// app.use('/api/inventory', require('./routes/inventory'));

// // Basic route for testing
// app.get('/', (req, res) => {
//   res.json({ 
//     message: 'Restaurant Ordering API is running!',
//     version: '1.0',
//     timestamp: new Date().toISOString(),
//     endpoints: {
//       orders: '/api/orders',
//       menu: '/api/menu',
//       tables: '/api/tables',
//       inventory: '/api/inventory'
//     }
//   });
// });

// // Health check endpoint
// app.get('/health', (req, res) => {
//   const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
//   res.json({ 
//     status: 'OK',
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime(),
//     database: dbStatus,
//     environment: process.env.NODE_ENV || 'development'
//   });
// });

// // Enhanced Socket.io for real-time notifications
// io.on('connection', (socket) => {
//   console.log('🔌 New client connected:', socket.id);
  
//   // Send immediate connection confirmation
//   socket.emit('connected', { 
//     message: 'Connected to server successfully',
//     socketId: socket.id,
//     timestamp: new Date().toISOString()
//   });

//   // Reception dashboard joins
//   socket.on('join-reception', () => {
//     socket.join('reception');
//     console.log('📋 Reception dashboard joined:', socket.id);
    
//     // Send confirmation to client
//     socket.emit('reception-joined', { 
//       message: 'Connected to real-time updates',
//       room: 'reception',
//       socketId: socket.id
//     });
    
//     // Send current connection status
//     socket.emit('connection-status', { 
//       status: 'connected', 
//       message: 'WebSocket connection active',
//       timestamp: new Date().toISOString()
//     });
//   });

//   // Kitchen display joins
//   socket.on('join-kitchen', () => {
//     socket.join('kitchen');
//     console.log('👨‍🍳 Kitchen display joined:', socket.id);
    
//     socket.emit('kitchen-joined', {
//       message: 'Connected to kitchen updates',
//       room: 'kitchen',
//       socketId: socket.id
//     });
//   });

//   // Handle order status updates from reception
//   socket.on('update-order-status', async (data) => {
//     try {
//       console.log('🔄 Order status update via socket:', data);
      
//       const { orderId, status } = data;
      
//       if (!orderId || !status) {
//         socket.emit('update-error', { 
//           message: 'Missing orderId or status',
//           data 
//         });
//         return;
//       }

//       // Validate status
//       const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'paid', 'cancelled'];
//       if (!validStatuses.includes(status)) {
//         socket.emit('update-error', { 
//           message: `Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`,
//           data 
//         });
//         return;
//       }

//       // Update order in database
//       const Order = require('./models/Order');
//       const order = await Order.findByIdAndUpdate(
//         orderId,
//         { 
//           status, 
//           updatedAt: new Date() 
//         },
//         { new: true, runValidators: true }
//       );
      
//       if (!order) {
//         socket.emit('update-error', { 
//           message: `Order not found with ID: ${orderId}`,
//           orderId 
//         });
//         return;
//       }

//       console.log(`✅ Order status updated via socket: ${order.orderNumber} -> ${status}`);

//       // Broadcast to all connected clients with multiple events for compatibility
//       const updateData = {
//         ...order.toObject(),
//         socketId: socket.id,
//         updateType: 'status',
//         timestamp: new Date().toISOString()
//       };

//       // Emit multiple events for better compatibility
//       io.emit('order-status-updated', updateData);
//       io.emit('order-updated', updateData);
//       io.emit('order-change', updateData);
      
//       // Emit to specific rooms
//       io.to('reception').emit('order-status-updated', updateData);
//       io.to('kitchen').emit('order-status-updated', updateData);

//       // Send confirmation to sender
//       socket.emit('order-update-success', { 
//         orderId, 
//         status,
//         orderNumber: order.orderNumber,
//         message: 'Order status updated successfully',
//         timestamp: new Date().toISOString()
//       });

//     } catch (error) {
//       console.error('❌ Error updating order status via socket:', error);
//       socket.emit('update-error', { 
//         message: 'Error updating order status',
//         error: error.message,
//         timestamp: new Date().toISOString()
//       });
//     }
//   });

//   // Handle manual order refresh
//   socket.on('refresh-orders', () => {
//     console.log('🔄 Manual refresh requested by:', socket.id);
    
//     const refreshData = {
//       requestedBy: socket.id,
//       timestamp: new Date().toISOString(),
//       message: 'Orders refresh requested'
//     };
    
//     // Broadcast to all connected clients
//     io.emit('orders-refreshed', refreshData);
//     io.to('reception').emit('orders-refreshed', refreshData);
//     io.to('kitchen').emit('orders-refreshed', refreshData);
//   });

//   // Handle connection testing
//   socket.on('test-connection', (data) => {
//     console.log('🧪 Connection test from:', socket.id, data);
//     socket.emit('test-response', {
//       ...data,
//       serverTime: new Date().toISOString(),
//       socketId: socket.id,
//       message: 'Connection test successful'
//     });
//   });

//   // Handle connection errors
//   socket.on('connect_error', (error) => {
//     console.error('❌ Socket connection error:', error);
//     socket.emit('connection-error', {
//       error: error.message,
//       timestamp: new Date().toISOString()
//     });
//   });

//   socket.on('error', (error) => {
//     console.error('❌ Socket error:', error);
//     socket.emit('socket-error', {
//       error: error.message,
//       timestamp: new Date().toISOString()
//     });
//   });

//   socket.on('disconnect', (reason) => {
//     console.log('🔌 Client disconnected:', socket.id, 'Reason:', reason);
    
//     // Notify other clients about disconnection (optional)
//     socket.broadcast.emit('user-disconnected', {
//       socketId: socket.id,
//       reason: reason,
//       timestamp: new Date().toISOString()
//     });
//   });

//   // Enhanced ping-pong for connection monitoring
//   socket.on('ping', (data) => {
//     const pongData = {
//       ...data,
//       serverTime: new Date().toISOString(),
//       socketId: socket.id,
//       latency: Date.now() - (data.clientTime || Date.now())
//     };
//     socket.emit('pong', pongData);
//   });

//   // Send periodic connection health checks
//   const healthInterval = setInterval(() => {
//     if (socket.connected) {
//       socket.emit('health-check', {
//         timestamp: new Date().toISOString(),
//         message: 'Connection health check'
//       });
//     }
//   }, 30000); // Every 30 seconds

//   // Clear interval on disconnect
//   socket.on('disconnect', () => {
//     clearInterval(healthInterval);
//   });
// });

// // Monitor socket connections
// setInterval(() => {
//   const connectedClients = io.engine.clientsCount;
//   console.log(`📊 Currently connected clients: ${connectedClients}`);
// }, 60000); // Log every minute

// // Global error handler for uncaught exceptions
// process.on('uncaughtException', (error) => {
//   console.error('❌ Uncaught Exception:', error);
// });

// process.on('unhandledRejection', (reason, promise) => {
//   console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
// });

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, '0.0.0.0', () => {
//   console.log(`
// 🚀 Server running on port ${PORT}
// 📍 Host: 0.0.0.0
// 📊 API URL: https://orderflow-backend-v964.onrender.com
// 🔌 Socket.io: wss://orderflow-backend-v964.onrender.com
// 📈 Health check: https://orderflow-backend-v964.onrender.com/health
// 🌍 Environment: ${process.env.NODE_ENV || 'development'}
//   `);
// });

// // Graceful shutdown
// process.on('SIGINT', () => {
//   console.log('\n🛑 Shutting down server gracefully...');
  
//   // Close all socket connections
//   io.close(() => {
//     console.log('✅ Socket.io server closed.');
//   });
  
//   server.close(() => {
//     console.log('✅ HTTP server closed.');
//     mongoose.connection.close(false, () => {
//       console.log('✅ MongoDB connection closed.');
//       process.exit(0);
//     });
//   });
// });




// module.exports = { app, server, io };








// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');
// const mongoose = require('mongoose');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();
// const server = http.createServer(app);

// // ✅ FIXED: Proper middleware setup
// app.use(cors({
//   origin: ['https://dapper-muffin-326944.netlify.app', 'http://localhost:3000', 'http://localhost:5173'],
//   credentials: true
// }));

// // ✅ FIXED: Body parsing middleware - CRITICAL FIX
// app.use(express.json({ 
//   limit: '10mb',
//   verify: (req, res, buf) => {
//     req.rawBody = buf;
//     console.log('📨 Raw body received:', buf.toString());
//   }
// }));

// app.use(express.urlencoded({ 
//   extended: true, 
//   limit: '10mb'
// }));

// // ✅ FIXED: Request logging middleware
// app.use((req, res, next) => {
//   console.log(`\n🔍 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  
//   if (req.method === 'POST' && req.path === '/api/orders') {
//     console.log('📦 Order request headers:', req.headers);
//     console.log('📦 Order request body:', req.body);
//     console.log('📦 Content-Type:', req.headers['content-type']);
//   }
  
//   next();
// });

// // Enhanced Socket.io configuration
// const io = socketIo(server, {
//   cors: {
//     origin: [
//       "https://orderflow-frontend.onrender.com",
//       "http://localhost:3000",
//       "http://localhost:5173",
//       "*"
//     ],
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true
//   },
//   transports: ['websocket', 'polling'],
//   pingTimeout: 60000,
//   pingInterval: 25000,
//   allowEIO3: true
// });

// // Make io accessible to routes
// app.set('io', io);

// // Database connection
// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant_ordering';

// mongoose.connect(MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   serverSelectionTimeoutMS: 5000,
//   socketTimeoutMS: 45000,
// })
// .then(() => {
//   console.log('✅ Connected to MongoDB successfully!');
// })
// .catch((error) => {
//   console.error('❌ MongoDB connection error:', error);
//   process.exit(1);
// });

// const db = mongoose.connection;
// db.on('error', (error) => {
//   console.error('❌ MongoDB connection error:', error);
// });
// db.on('connected', () => {
//   console.log('📊 MongoDB connection established');
// });
// db.on('disconnected', () => {
//   console.log('⚠️ MongoDB disconnected');
// });

// // Static files
// app.use('/uploads', express.static('uploads'));

// // Routes
// app.use('/api/upload', require('./routes/upload'));
// app.use('/api/menu', require('./routes/menu'));
// app.use('/api/init', require('./routes/init'));
// app.use('/api/tables', require('./routes/tables'));
// app.use('/api/orders', require('./routes/orders'));
// app.use('/api/inventory', require('./routes/inventory'));

// // Basic route for testing
// app.get('/', (req, res) => {
//   res.json({ 
//     message: 'Restaurant Ordering API is running!',
//     version: '1.0',
//     timestamp: new Date().toISOString(),
//     endpoints: {
//       orders: '/api/orders',
//       menu: '/api/menu',
//       tables: '/api/tables',
//       inventory: '/api/inventory'
//     }
//   });
// });

// // Health check endpoint
// app.get('/health', (req, res) => {
//   const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
//   res.json({ 
//     status: 'OK',
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime(),
//     database: dbStatus,
//     environment: process.env.NODE_ENV || 'development'
//   });
// });

// // Test endpoint to check body parsing
// app.post('/api/test-body', (req, res) => {
//   console.log('🧪 Test endpoint called');
//   console.log('📨 Headers:', req.headers);
//   console.log('📨 Body:', req.body);
//   console.log('📨 Body type:', typeof req.body);
  
//   res.json({
//     success: true,
//     message: 'Body received successfully',
//     receivedBody: req.body,
//     bodyType: typeof req.body,
//     headers: req.headers
//   });
// });

// // Enhanced Socket.io for real-time notifications
// io.on('connection', (socket) => {
//   console.log('🔌 New client connected:', socket.id);
  
//   socket.emit('connected', { 
//     message: 'Connected to server successfully',
//     socketId: socket.id,
//     timestamp: new Date().toISOString()
//   });

//   // Reception dashboard joins
//   socket.on('join-reception', () => {
//     socket.join('reception');
//     console.log('📋 Reception dashboard joined:', socket.id);
    
//     socket.emit('reception-joined', { 
//       message: 'Connected to real-time updates',
//       room: 'reception',
//       socketId: socket.id
//     });
//   });

//   // Kitchen display joins
//   socket.on('join-kitchen', () => {
//     socket.join('kitchen');
//     console.log('👨‍🍳 Kitchen display joined:', socket.id);
    
//     socket.emit('kitchen-joined', {
//       message: 'Connected to kitchen updates',
//       room: 'kitchen',
//       socketId: socket.id
//     });
//   });

//   // Handle order status updates
//   socket.on('update-order-status', async (data) => {
//     try {
//       console.log('🔄 Order status update via socket:', data);
      
//       const { orderId, status } = data;
      
//       if (!orderId || !status) {
//         socket.emit('update-error', { 
//           message: 'Missing orderId or status',
//           data 
//         });
//         return;
//       }

//       const Order = require('./models/Order');
//       const order = await Order.findByIdAndUpdate(
//         orderId,
//         { 
//           status, 
//           updatedAt: new Date() 
//         },
//         { new: true, runValidators: true }
//       );
      
//       if (!order) {
//         socket.emit('update-error', { 
//           message: `Order not found with ID: ${orderId}`,
//           orderId 
//         });
//         return;
//       }

//       console.log(`✅ Order status updated via socket: ${order.orderNumber} -> ${status}`);

//       const updateData = {
//         ...order.toObject(),
//         socketId: socket.id,
//         updateType: 'status',
//         timestamp: new Date().toISOString()
//       };

//       io.emit('order-status-updated', updateData);
//       io.emit('order-updated', updateData);
//       io.emit('order-change', updateData);
      
//       io.to('reception').emit('order-status-updated', updateData);
//       io.to('kitchen').emit('order-status-updated', updateData);

//       socket.emit('order-update-success', { 
//         orderId, 
//         status,
//         orderNumber: order.orderNumber,
//         message: 'Order status updated successfully',
//         timestamp: new Date().toISOString()
//       });

//     } catch (error) {
//       console.error('❌ Error updating order status via socket:', error);
//       socket.emit('update-error', { 
//         message: 'Error updating order status',
//         error: error.message,
//         timestamp: new Date().toISOString()
//       });
//     }
//   });

//   socket.on('disconnect', (reason) => {
//     console.log('🔌 Client disconnected:', socket.id, 'Reason:', reason);
//   });
// });

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, '0.0.0.0', () => {
//   console.log(`
// 🚀 Server running on port ${PORT}
// 📍 Host: 0.0.0.0
// 📊 API URL: http://localhost:${PORT}
// 🔌 Socket.io: ws://localhost:${PORT}
// 📈 Health check: http://localhost:${PORT}/health
// 🌍 Environment: ${process.env.NODE_ENV || 'development'}
//   `);
// });

// // Graceful shutdown
// process.on('SIGINT', () => {
//   console.log('\n🛑 Shutting down server gracefully...');
  
//   io.close(() => {
//     console.log('✅ Socket.io server closed.');
//   });
  
//   server.close(() => {
//     console.log('✅ HTTP server closed.');
//     mongoose.connection.close(false, () => {
//       console.log('✅ MongoDB connection closed.');
//       process.exit(0);
//     });
//   });
// });

// module.exports = { app, server, io };



const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// ✅ FIXED: Simplified CORS configuration
app.use(cors({
  origin: [
    'https://dapper-muffin-326944.netlify.app',
    'https://orderflow-frontend.onrender.com',
    'http://localhost:3000', 
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ FIXED: Handle preflight requests
app.options('*', cors());

// ✅ FIXED: Body parsing middleware - SIMPLIFIED VERSION
app.use(express.json({ 
  limit: '10mb'
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb'
}));

// ✅ FIXED: Request logging middleware
app.use((req, res, next) => {
  console.log(`\n🔍 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  
  if (req.method === 'POST' && req.path === '/api/orders') {
    console.log('📦 Order request headers:', req.headers);
    console.log('📦 Order request body:', req.body);
    console.log('📦 Content-Type:', req.headers['content-type']);
    console.log('📦 Raw body available:', !!req.body);
  }
  
  next();
});

// Enhanced Socket.io configuration
const io = socketIo(server, {
  cors: {
    origin: [
      "https://dapper-muffin-326944.netlify.app",
      "https://orderflow-frontend.onrender.com",
      "http://localhost:3000",
      "http://localhost:5173"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// Make io accessible to routes
app.set('io', io);

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant_ordering';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ Connected to MongoDB successfully!');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

const db = mongoose.connection;
db.on('error', (error) => {
  console.error('❌ MongoDB connection error:', error);
});
db.on('connected', () => {
  console.log('📊 MongoDB connection established');
});
db.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

// Static files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/upload', require('./routes/upload'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/init', require('./routes/init'));
app.use('/api/tables', require('./routes/tables'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/inventory', require('./routes/inventory'));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'Restaurant Ordering API is running!',
    version: '1.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      orders: '/api/orders',
      menu: '/api/menu',
      tables: '/api/tables',
      inventory: '/api/inventory'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
    environment: process.env.NODE_ENV || 'development'
  });
});

// ✅ FIXED: Test endpoint to check body parsing
app.post('/api/test-body', (req, res) => {
  console.log('🧪 Test endpoint called');
  console.log('📨 Headers:', req.headers);
  console.log('📨 Body:', req.body);
  console.log('📨 Body type:', typeof req.body);
  console.log('📨 Body keys:', Object.keys(req.body));
  
  res.json({
    success: true,
    message: 'Body received successfully',
    receivedBody: req.body,
    bodyType: typeof req.body,
    bodyKeys: Object.keys(req.body),
    headers: req.headers
  });
});

// ✅ FIXED: Add a simple test order endpoint
app.post('/api/test-order', (req, res) => {
  try {
    console.log('🧪 Test order endpoint called');
    console.log('📦 Request body:', req.body);
    
    const { tableNumber, customerName, mobileNumber, items } = req.body;
    
    // Basic validation
    if (!tableNumber || !customerName || !mobileNumber || !items) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: ['tableNumber', 'customerName', 'mobileNumber', 'items'],
        received: Object.keys(req.body)
      });
    }
    
    res.json({
      success: true,
      message: 'Test order received successfully',
      orderData: req.body,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Test order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in test endpoint',
      error: error.message
    });
  }
});

// Enhanced Socket.io for real-time notifications
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);
  
  socket.emit('connected', { 
    message: 'Connected to server successfully',
    socketId: socket.id,
    timestamp: new Date().toISOString()
  });

  // Reception dashboard joins
  socket.on('join-reception', () => {
    socket.join('reception');
    console.log('📋 Reception dashboard joined:', socket.id);
    
    socket.emit('reception-joined', { 
      message: 'Connected to real-time updates',
      room: 'reception',
      socketId: socket.id
    });
  });

  // Kitchen display joins
  socket.on('join-kitchen', () => {
    socket.join('kitchen');
    console.log('👨‍🍳 Kitchen display joined:', socket.id);
    
    socket.emit('kitchen-joined', {
      message: 'Connected to kitchen updates',
      room: 'kitchen',
      socketId: socket.id
    });
  });

  // Handle order status updates
  socket.on('update-order-status', async (data) => {
    try {
      console.log('🔄 Order status update via socket:', data);
      
      const { orderId, status } = data;
      
      if (!orderId || !status) {
        socket.emit('update-error', { 
          message: 'Missing orderId or status',
          data 
        });
        return;
      }

      const Order = require('./models/Order');
      const order = await Order.findByIdAndUpdate(
        orderId,
        { 
          status, 
          updatedAt: new Date() 
        },
        { new: true, runValidators: true }
      );
      
      if (!order) {
        socket.emit('update-error', { 
          message: `Order not found with ID: ${orderId}`,
          orderId 
        });
        return;
      }

      console.log(`✅ Order status updated via socket: ${order.orderNumber} -> ${status}`);

      const updateData = {
        ...order.toObject(),
        socketId: socket.id,
        updateType: 'status',
        timestamp: new Date().toISOString()
      };

      io.emit('order-status-updated', updateData);
      io.emit('order-updated', updateData);
      io.emit('order-change', updateData);
      
      io.to('reception').emit('order-status-updated', updateData);
      io.to('kitchen').emit('order-status-updated', updateData);

      socket.emit('order-update-success', { 
        orderId, 
        status,
        orderNumber: order.orderNumber,
        message: 'Order status updated successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error updating order status via socket:', error);
      socket.emit('update-error', { 
        message: 'Error updating order status',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Client disconnected:', socket.id, 'Reason:', reason);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 Server running on port ${PORT}
📍 Host: 0.0.0.0
📊 API URL: http://localhost:${PORT}
🔌 Socket.io: ws://localhost:${PORT}
📈 Health check: http://localhost:${PORT}/health
🧪 Test endpoints:
   - POST http://localhost:${PORT}/api/test-body
   - POST http://localhost:${PORT}/api/test-order
🌍 Environment: ${process.env.NODE_ENV || 'development'}
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  
  io.close(() => {
    console.log('✅ Socket.io server closed.');
  });
  
  server.close(() => {
    console.log('✅ HTTP server closed.');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed.');
      process.exit(0);
    });
  });
});

module.exports = { app, server, io };