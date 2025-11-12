
// export default ReceptionDashboard

//3
// Updated ReceptionDashboard.jsx with audio permission handling
import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import io from 'socket.io-client'
import axios from 'axios'
import './ReceptionDashboard.css'

const API_BASE_URL = 'https://orderflow-backend-v964.onrender.com/api'

// For Vite, use import.meta.env instead of process.env
const ADMIN_CREDENTIALS = {
  username: import.meta.env.VITE_ADMIN_USERNAME || 'admin',
  password: import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'
}

const ReceptionDashboard = () => {
  // Admin Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  })
  const [loginError, setLoginError] = useState('')
  const [envStatus, setEnvStatus] = useState('')

  // New Order Notification State
  const [showNotification, setShowNotification] = useState(false)
  const [newOrder, setNewOrder] = useState(null)
  const [audioPermissionGranted, setAudioPermissionGranted] = useState(false)
  const notificationTimeoutRef = useRef(null)
  const audioRef = useRef(null)

  // Debug environment variables on component mount
  useEffect(() => {
    console.log('🔐 Vite Environment Variables Check:');
    console.log('VITE_ADMIN_USERNAME:', import.meta.env.VITE_ADMIN_USERNAME);
    console.log('VITE_ADMIN_PASSWORD:', import.meta.env.VITE_ADMIN_PASSWORD ? '***' : 'Not set');
    console.log('MODE:', import.meta.env.MODE);
  }, [])

  // Request audio permission on user interaction
  useEffect(() => {
    if (isAuthenticated) {
      // Add click event listener to grant audio permission
      const handleUserInteraction = async () => {
        try {
          if (audioRef.current) {
            // Try to play and immediately pause to get permission
            await audioRef.current.play()
            audioRef.current.pause()
            setAudioPermissionGranted(true)
            console.log('✅ Audio permission granted')
            
            // Remove event listener after first successful interaction
            document.removeEventListener('click', handleUserInteraction)
          }
        } catch (error) {
          console.log('🔇 Audio permission not yet granted, waiting for user interaction...')
        }
      }

      document.addEventListener('click', handleUserInteraction)
      
      return () => {
        document.removeEventListener('click', handleUserInteraction)
      }
    }
  }, [isAuthenticated])

  // Dashboard State
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0
  })
  const [loading, setLoading] = useState(false)
  const [statsError, setStatsError] = useState(false)

  // Play notification sound
  const playNotificationSound = async () => {
    if (!audioRef.current) return
    
    try {
      audioRef.current.currentTime = 0
      await audioRef.current.play()
      console.log('🔊 Notification sound played successfully')
    } catch (error) {
      console.log('🔇 Could not play sound:', error)
      // You can show a visual indicator that sound is muted
    }
  }

  // Show new order notification
  const showNewOrderNotification = (order) => {
    // Clear any existing timeout
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current)
    }

    // Set new order and show notification
    setNewOrder(order)
    setShowNotification(true)
    
    // Play notification sound
    playNotificationSound()

    // Auto hide after 5 seconds
    notificationTimeoutRef.current = setTimeout(() => {
      setShowNotification(false)
    }, 5000)
  }

  // Manual close notification
  const closeNotification = () => {
    setShowNotification(false)
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current)
    }
  }

  useEffect(() => {
    try {
      const authStatus = localStorage.getItem('receptionAuth')
      if (authStatus === 'authenticated') {
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error('Error checking authentication:', error)
    }
  }, [])

  // Fetch data only when authenticated
  useEffect(() => {
    if (!isAuthenticated) return

    let socket
    try {
      fetchOrders()
      fetchStats()
      
      socket = io('https://orderflow-backend-v964.onrender.com')
      socket.emit('join-reception')
      
      socket.on('new-order', (newOrder) => {
        console.log('🆕 New order received:', newOrder)
        setOrders(prev => [newOrder, ...prev])
        fetchStats()
        
        // Show notification for new order
        showNewOrderNotification(newOrder)
      })

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
      })

    } catch (error) {
      console.error('Error setting up socket:', error)
    }

    return () => {
      if (socket) {
        socket.disconnect()
      }
      // Cleanup timeout on unmount
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current)
      }
    }
  }, [isAuthenticated])

  // Admin Login Handler
  const handleLogin = (e) => {
    e.preventDefault()
    setLoginError('')

    try {
      console.log('🔑 Login attempt:', {
        enteredUsername: loginForm.username,
        expectedUsername: ADMIN_CREDENTIALS.username,
        envStatus: envStatus
      })
      
      if (loginForm.username === ADMIN_CREDENTIALS.username && 
          loginForm.password === ADMIN_CREDENTIALS.password) {
        setIsAuthenticated(true)
        localStorage.setItem('receptionAuth', 'authenticated')
        setLoginForm({ username: '', password: '' })
        console.log('✅ Login successful')
      } else {
        setLoginError('Invalid username or password')
        console.log('❌ Login failed - invalid credentials')
      }
    } catch (error) {
      console.error('Login error:', error)
      setLoginError('Login failed. Please try again.')
    }
  }

  // Logout Handler
  const handleLogout = () => {
    try {
      setIsAuthenticated(false)
      setOrders([])
      localStorage.removeItem('receptionAuth')
      console.log('🚪 User logged out')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/orders`)
      setOrders(response.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
      alert('Error loading orders. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // const fetchStats = async () => {
  //   try {
  //     const response = await axios.get(`${API_BASE_URL}/orders/stats/today`)
  //     setStats(response.data)
  //     setStatsError(false)
  //   } catch (error) {
  //     console.error('Error fetching stats:', error)
  //     setStatsError(true)
  //     // Set default stats if API fails
  //     setStats({
  //       totalOrders: orders.length,
  //       pendingOrders: orders.filter(order => 
  //         ['pending', 'confirmed', 'preparing'].includes(order.status)
  //       ).length,
  //       totalRevenue: orders
  //         .filter(order => order.status !== 'cancelled')
  //         .reduce((total, order) => total + order.totalAmount, 0)
  //     })
  //   }
  // }

  // Updated fetchStats function
const fetchStats = async () => {
  try {
    console.log('📊 Fetching statistics...');
    
    // Try the new stats endpoint first
    const response = await axios.get(`${API_BASE_URL}/orders/stats/today`);
    console.log('📊 Stats response:', response.data);
    
    setStats({
      totalOrders: response.data.totalOrders || 0,
      pendingOrders: response.data.pendingOrders || 0,
      totalRevenue: response.data.totalRevenue || 0
    });
    setStatsError(false);
    
  } catch (error) {
    console.error('❌ Error fetching stats from API:', error);
    
    // Fallback: Calculate stats from local orders data
    try {
      console.log('🔄 Using fallback stats calculation from local orders...');
      
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(order => 
        ['pending', 'confirmed', 'preparing'].includes(order.status)
      ).length;
      
      // Use finalTotal if available, otherwise use totalAmount
      const totalRevenue = orders
        .filter(order => order.status !== 'cancelled')
        .reduce((total, order) => {
          const orderTotal = order.finalTotal || order.totalAmount || 0;
          return total + orderTotal;
        }, 0);

      console.log('📊 Fallback stats calculated:', {
        totalOrders,
        pendingOrders,
        totalRevenue
      });

      setStats({
        totalOrders,
        pendingOrders,
        totalRevenue
      });
      setStatsError(true); // Mark as fallback mode
      
    } catch (fallbackError) {
      console.error('❌ Fallback stats calculation failed:', fallbackError);
      // Ultimate fallback
      setStats({
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0
      });
      setStatsError(true);
    }
  }
};

// Update the useEffect to include orders dependency
useEffect(() => {
  if (!isAuthenticated) return;

  let socket;
  try {
    fetchOrders().then(() => {
      // Fetch stats after orders are loaded
      fetchStats();
    });
    
    socket = io('https://orderflow-backend-v964.onrender.com');
    socket.emit('join-reception');
    
    socket.on('new-order', (newOrder) => {
      console.log('🆕 New order received:', newOrder);
      setOrders(prev => [newOrder, ...prev]);
      
      // Update stats when new order arrives
      setTimeout(() => {
        fetchStats();
      }, 100);
      
      // Show notification for new order
      showNewOrderNotification(newOrder);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

  } catch (error) {
    console.error('Error setting up socket:', error);
  }

  return () => {
    if (socket) {
      socket.disconnect();
    }
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
  };
}, [isAuthenticated]);

// Update the updateOrderStatus function to refresh stats
const updateOrderStatus = async (orderId, newStatus) => {
  try {
    await axios.patch(`${API_BASE_URL}/orders/${orderId}/status`, {
      status: newStatus
    });
    
    // Refresh both orders and stats
    await fetchOrders();
    setTimeout(() => {
      fetchStats();
    }, 100);
    
  } catch (error) {
    console.error('Error updating order status:', error);
    alert('Error updating order status. Please try again.');
  }
};

  // const updateOrderStatus = async (orderId, newStatus) => {
  //   try {
  //     await axios.patch(`${API_BASE_URL}/orders/${orderId}/status`, {
  //       status: newStatus
  //     })
  //     fetchOrders()
  //     fetchStats()
  //   } catch (error) {
  //     console.error('Error updating order status:', error)
  //     alert('Error updating order status. Please try again.')
  //   }
  // }

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      confirmed: '#17a2b8',
      preparing: '#fd7e14',
      ready: '#28a745',
      served: '#6c757d',
      cancelled: '#dc3545'
    }
    return colors[status] || '#6c757d'
  }

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      preparing: 'Preparing',
      ready: 'Ready to Serve',
      served: 'Served',
      cancelled: 'Cancelled'
    }
    return texts[status] || status
  }

  // Show Login Form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <h1>🔐 Reception Dashboard</h1>
            <p>Admin Login Required</p>
            {envStatus && (
              <div className={`env-status ${envStatus}`}>
                {envStatus === 'success' 
                  ? '✅ Using credentials from .env file' 
                  : '⚠️ Using fallback credentials - check .env file'
                }
              </div>
            )}
          </div>
          
          <form onSubmit={handleLogin} className="login-form">
            {loginError && (
              <div className="error-message">
                {loginError}
              </div>
            )}
            
            <div className="input-group">
              <label>Username</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                placeholder="Enter username"
                required
              />
            </div>
            
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                placeholder="Enter password"
                required
              />
            </div>
            
            <button type="submit" className="login-button">
              Sign In
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Main Dashboard (shown only when authenticated)
  return (
    <div className="reception-dashboard">
      {/* Hidden audio element for notification sound */}
      <audio 
        ref={audioRef} 
        className="hidden-audio" 
        preload="auto"
        muted={false}
      >
        <source src="/notification-sound.mp3" type="audio/mpeg" />
        <source src="/notification-sound.wav" type="audio/wav" />
        Your browser does not support the audio element.
      </audio>
      

      {/* Audio Permission Indicator */}
      {!audioPermissionGranted && (
        <div className="audio-permission-indicator" style={{
          position: 'fixed',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#ffeb3b',
          color: '#333',
          padding: '8px 16px',
          borderRadius: '4px',
          fontSize: '14px',
          zIndex: 1001,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}>
          🔇 Click anywhere to enable notification sounds
        </div>
      )}

      {/* New Order Notification Popup */}
      {showNotification && newOrder && (
        <div className="new-order-popup">
          <button 
            onClick={closeNotification}
            style={{
              position: 'absolute',
              top: '5px',
              right: '10px',
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
          <h4>🎉 New Order Received!</h4>
          <p><strong>Order #{newOrder.orderNumber}</strong></p>
          <p>Table {newOrder.tableNumber} • {newOrder.customerName}</p>
          <p>Total: ₹{newOrder.totalAmount}</p>
          <small>{new Date().toLocaleTimeString()}</small>
          {!audioPermissionGranted && (
            <small style={{display: 'block', marginTop: '5px', opacity: '0.8'}}>
              🔇 Sound disabled - click page to enable
            </small>
          )}
        </div>
      )}

      <header className="dashboard-header">
        <div className="header-top">
          <h1>Reception Dashboard</h1>
          <div className="header-actions">
            <div className="admin-welcome">
              <span>Welcome, Admin</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
            <div classname="list">
            <Link to="/admin/tables" className="btn-primary">
              Manage Tables
            </Link>
            <Link to="/admin/menu" className="btn-primary">
              Manage Menu Items
              </Link>
              <Link to="/inventory" className="btn-primary">
              Manage Inventory
              </Link>
              {/* <Link to="/admin/bill-printing" className="btn-primary">
              Bill Print 
              </Link> */}
              {/* <button>
            </button> */}
            {/* <button onClick={fetchOrders} className="btn-secondary" disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button> */}
            </div>
          </div>
        </div>
        
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>Total Orders Today</h3>
              <p className="stat-number">{stats.totalOrders}</p>
              {statsError && <small style={{color: '#ff6b6b'}}>Live stats unavailable</small>}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>Pending Orders</h3>
              <p className="stat-number">{stats.pendingOrders}</p>
              {statsError && <small style={{color: '#ff6b6b'}}>Live stats unavailable</small>}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>Revenue Today</h3>
              {/* <p className="stat-number">₹{stats.totalRevenue}</p> */}
              <p className="stat-number">
              ₹{stats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>

              {statsError && <small style={{color: '#ff6b6b'}}>Live stats unavailable</small>}
            </div>
          </div>
        </div>
      </header>

      <div className="orders-section">
        <div className="section-header">
          <h2>Recent Orders</h2>
          <span className="orders-count">{orders.length} orders</span>
        </div>
        
        {loading ? (
          <div className="loading-message">Loading orders...</div>
        ) : (
          <div className="orders-grid">
            {orders.length === 0 ? (
              <div className="no-orders">
                <p>No orders yet</p>
                <small>Orders will appear here when customers place them</small>
              </div>
            ) : (
              orders.map(order => (
                <div key={order._id} className="order-card">
                  {/* <div className="order-header"> */}
                    <div className="order-title">
                      <h3>Order #{order.orderNumber}</h3>
                      <span className="order-time">
                        {new Date(order.createdAt || order.orderTime).toLocaleTimeString()}
                      </span>
                    </div>
                    {/* <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {getStatusText(order.status)}
                    </span> */}
                  {/* </div> */}
                  
                  <div className="order-details">
                    <div className="detail-row">
                      <span className="detail-label">Table:</span>
                      <span className="detail-value">Table {order.tableNumber}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Customer:</span>
                      <span className="detail-value">{order.customerName}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Mobile:</span>
                      <span className="detail-value">{order.mobileNumber}</span>
                    </div>
                  </div>

                  <div className="order-items">
                    <h4>Order Items:</h4>
                    {order.items && order.items.map((item, index) => (
                      <div key={index} className="order-item">
                        <span className="item-name">
                          {item.quantity}x {item.menuItem?.name || 'Item'}
                        </span>
                        <span className="item-price">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="order-total">
                    <strong>Total: ₹{order.totalAmount}</strong>
                  </div>

                  <div className="order-actions">
                    <label>Update Status:</label>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      className="status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready</option>
                      <option value="served">Served</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReceptionDashboard


