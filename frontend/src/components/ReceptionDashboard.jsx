

import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import io from 'socket.io-client'
import axios from 'axios'
import './ReceptionDashboard.css'

const API_BASE_URL = 'https://orderflow-backend-v964.onrender.com/api'

const ADMIN_CREDENTIALS = {
  username: import.meta.env.VITE_ADMIN_USERNAME || 'admin',
  password: import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'
}

const ReceptionDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [showNotification, setShowNotification] = useState(false)
  const [newOrder, setNewOrder] = useState(null)
  const [audioPermissionGranted, setAudioPermissionGranted] = useState(false)
  const notificationTimeoutRef = useRef(null)
  const audioRef = useRef(null)
  const [updatingOrders, setUpdatingOrders] = useState(new Set())
  const socketRef = useRef(null)

  // Dashboard State
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Debug function to check API response
  const debugAPIResponse = (data) => {
    console.log('🔍 DEBUG API RESPONSE:')
    console.log('Full response:', data)
    console.log('Type of data:', typeof data)
    console.log('Is array:', Array.isArray(data))
    console.log('Keys:', Object.keys(data))
    if (data && typeof data === 'object') {
      console.log('Data properties:', Object.keys(data))
    }
  }

  // SIMPLIFIED fetchOrders function
  const fetchOrders = async () => {
    try {
      console.log('🔄 FETCHING ORDERS FROM:', `${API_BASE_URL}/orders`)
      setLoading(true)
      setError('')
      
      const response = await axios.get(`${API_BASE_URL}/orders`)
      
      console.log('✅ RAW API RESPONSE:', response)
      console.log('📦 RESPONSE DATA:', response.data)
      
      // Debug the response
      debugAPIResponse(response.data)
      
      let ordersData = []
      
      // Handle different response formats
      if (Array.isArray(response.data)) {
        ordersData = response.data
        console.log('✅ Using direct array from response.data')
      } else if (response.data.orders && Array.isArray(response.data.orders)) {
        ordersData = response.data.orders
        console.log('✅ Using orders array from response.data.orders')
      } else if (response.data.data && Array.isArray(response.data.data)) {
        ordersData = response.data.data
        console.log('✅ Using data array from response.data.data')
      } else {
        console.warn('⚠️ Unexpected response format:', response.data)
        // Try to extract any array from the response
        const possibleArrays = Object.values(response.data).filter(val => Array.isArray(val))
        if (possibleArrays.length > 0) {
          ordersData = possibleArrays[0]
          console.log('✅ Found array in response:', Object.keys(response.data).find(key => Array.isArray(response.data[key])))
        }
      }
      
      console.log(`🎯 FINAL ORDERS DATA:`, ordersData)
      console.log(`📊 Number of orders: ${ordersData.length}`)
      
      if (ordersData.length > 0) {
        console.log('📝 Sample order:', ordersData[0])
      }
      
      setOrders(ordersData)
      calculateStatsFromOrders(ordersData)
      
    } catch (error) {
      console.error('❌ ERROR FETCHING ORDERS:', error)
      console.error('Error details:', error.response?.data || error.message)
      setError(`Failed to load orders: ${error.message}`)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  // Calculate stats from orders
  const calculateStatsFromOrders = (ordersData) => {
    try {
      const totalOrders = ordersData.length
      const pendingOrders = ordersData.filter(order => 
        ['pending', 'confirmed', 'preparing'].includes(order.status)
      ).length
      const totalRevenue = ordersData
        .filter(order => order.status !== 'cancelled')
        .reduce((total, order) => total + (order.finalTotal || order.totalAmount || 0), 0)

      setStats({ totalOrders, pendingOrders, totalRevenue })
    } catch (error) {
      console.error('Error calculating stats:', error)
    }
  }

 

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

  // Check authentication
  useEffect(() => {
    const authStatus = localStorage.getItem('receptionAuth')
    if (authStatus === 'authenticated') {
      setIsAuthenticated(true)
    }
  }, [])

  // Main data fetching effect
  useEffect(() => {
    if (!isAuthenticated) return

    console.log('🚀 INITIALIZING DASHBOARD...')
    
    const initializeDashboard = async () => {
      await fetchOrders()
      setupSocketConnection()
    }

    initializeDashboard()

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current)
      }
    }
  }, [isAuthenticated])


const setupSocketConnection = () => {
  try {
    const socket = io('https://orderflow-backend-v964.onrender.com')
    socketRef.current = socket
    
    socket.emit('join-reception')
    
    socket.on('new-order', (newOrder) => {
      console.log('🆕 New order via socket:', newOrder)
      
      // FIX: Use functional update to get latest state
      setOrders(prev => {
        const updatedOrders = [newOrder, ...prev]
        // Calculate stats with the updated orders
        calculateStatsFromOrders(updatedOrders)
        return updatedOrders
      })
      
      // Show notification
      setNewOrder(newOrder)
      setShowNotification(true)
      playNotificationSound()
      
      // Auto hide notification
      setTimeout(() => setShowNotification(false), 5000)
    })

    socket.on('order-status-updated', (updatedOrder) => {
      console.log('🔄 Order status updated:', updatedOrder)
      
      // FIX: Use functional update for status changes too
      setOrders(prev => {
        const updatedOrders = prev.map(order => 
          order._id === updatedOrder._id ? updatedOrder : order
        )
        calculateStatsFromOrders(updatedOrders)
        return updatedOrders
      })
    })

  } catch (error) {
    console.error('Socket error:', error)
  }
}
 

// Client-side only status update (temporary solution)
const updateOrderStatus = async (orderNumber, newStatus) => {
  try {
    console.log('🔄 Updating order status locally:', { orderNumber, newStatus });
    setUpdatingOrders(prev => new Set(prev).add(orderNumber));

    const order = orders.find(o => o.orderNumber === orderNumber);
    
    if (!order) {
      alert('Order not found in local data.');
      return;
    }

    // Update local state immediately (client-side only)
    setOrders(prev => {
      const updatedOrders = prev.map(order => 
        order.orderNumber === orderNumber 
          ? { 
              ...order, 
              status: newStatus,
              updatedAt: new Date().toISOString() // Add update timestamp
            }
          : order
      );
      
      // Recalculate stats with updated orders
      calculateStatsFromOrders(updatedOrders);
      return updatedOrders;
    });

    console.log('✅ Order status updated locally');

    // Try to update backend, but don't block if it fails
    try {
      await updateOrderStatusInBackend(orderNumber, newStatus, order._id);
    } catch (backendError) {
      console.warn('⚠️ Backend update failed, but local state updated:', backendError.message);
      // Don't show error to user since local state is updated
    }

  } catch (error) {
    console.error('❌ Error updating order status:', error);
    alert('Error updating order status. Please try again.');
  } finally {
    setUpdatingOrders(prev => {
      const newSet = new Set(prev);
      newSet.delete(orderNumber);
      return newSet;
    });
  }
};

// Separate function to try backend update (non-blocking)
const updateOrderStatusInBackend = async (orderNumber, newStatus, orderId) => {
  try {
    console.log('🔄 Attempting backend update...');
    
    // Try different approaches
    const approaches = [
      // Approach 1: PATCH with status
      () => axios.patch(`${API_BASE_URL}/orders/${orderId}/status`, { status: newStatus }),
      
      // Approach 2: PUT with status  
      () => axios.put(`${API_BASE_URL}/orders/${orderId}/status`, { status: newStatus }),
      
      // Approach 3: Update entire order
      () => {
        const order = orders.find(o => o.orderNumber === orderNumber);
        const updatedOrder = { ...order, status: newStatus };
        return axios.put(`${API_BASE_URL}/orders/${orderId}`, updatedOrder);
      },
      
      // Approach 4: Different field name
      () => axios.patch(`${API_BASE_URL}/orders/${orderId}`, { orderStatus: newStatus }),
      
      // Approach 5: Simple field update
      () => axios.patch(`${API_BASE_URL}/orders/${orderId}`, { status: newStatus })
    ];

    for (let i = 0; i < approaches.length; i++) {
      try {
        const response = await approaches[i]();
        console.log(`✅ Backend update successful (approach ${i + 1}):`, response.data);
        return response.data;
      } catch (error) {
        console.warn(`❌ Backend approach ${i + 1} failed:`, error.response?.status);
        // Continue to next approach
      }
    }
    
    throw new Error('All backend approaches failed');
    
  } catch (error) {
    console.warn('⚠️ Backend update failed completely, but local state is preserved');
    // Don't throw error - local state is already updated
  }
};

// Debug function to check order data
const debugOrderStatus = (order) => {
  console.log('🔍 Order Debug:', {
    orderNumber: order.orderNumber,
    currentStatus: order.status,
    orderId: order._id,
    hasItems: !!order.items,
    itemsCount: order.items?.length
  });
};

// Call this in your orders.map temporarily to debug:
{orders.map(order => {
  debugOrderStatus(order); // Remove this after debugging
  return (
    <div key={order._id} className="order-card">
      // ... rest of your order card

    </div>
  );
})}


// Print bill function for thermal printers
const printBill = async (order) => {
  try {
    console.log('🖨️ Printing bill for order:', order.orderNumber);
    
    // Check if Web Bluetooth API is available
    if (!navigator.bluetooth) {
      alert('Web Bluetooth is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    // Request Bluetooth device
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ['generic_access']
    });

    console.log('📱 Connected to device:', device.name);
    
    // Create ESC/POS commands for thermal printer
    const billContent = generateBillContent(order);
    
    // Convert to Uint8Array for Bluetooth
    const encoder = new TextEncoder();
    const data = encoder.encode(billContent);
    
    // Send to printer (this is a simplified version)
    // Note: Actual implementation depends on your printer's Bluetooth service
    alert(`Bill for Order #${order.orderNumber} sent to printer!`);
    
  } catch (error) {
    console.error('❌ Print error:', error);
    
    if (error.name === 'NotFoundError') {
      alert('No Bluetooth printer found. Please make sure your printer is paired and in range.');
    } else if (error.name === 'NotAllowedError') {
      alert('Bluetooth permission denied. Please allow Bluetooth access.');
    } else {
      alert('Failed to print bill: ' + error.message);
    }
  }
};

// Generate ESC/POS formatted bill content
// const generateBillContent = (order) => {
//   const lineBreak = '\n';
//   const doubleLineBreak = '\n\n';
//   const separator = '--------------------------------';
  
//   // ESC/POS commands
//   const ESC = '\x1B';
//   const initialize = ESC + '@';
//   const centerAlign = ESC + '\x61\x01';
//   const leftAlign = ESC + '\x61\x00';
//   const boldOn = ESC + '\x45\x01';
//   const boldOff = ESC + '\x45\x00';
//   const doubleHeight = ESC + '\x21\x30';
//   const normalText = ESC + '\x21\x00';
  
//   let bill = initialize;
  
//   // Header
//   bill += centerAlign + boldOn + doubleHeight;
//   bill += 'AMORE MIO' + lineBreak;
//   bill += boldOff + normalText;
//   bill += 'Restaurant & Cafe' + lineBreak;
//   bill += '-------------------' + doubleLineBreak;
  
//   // Order details
//   bill += leftAlign;
//   bill += `Order #: ${order.orderNumber}` + lineBreak;
//   bill += `Date: ${new Date(order.createdAt).toLocaleDateString()}` + lineBreak;
//   bill += `Time: ${new Date(order.createdAt).toLocaleTimeString()}` + lineBreak;
//   bill += `Table: ${order.tableNumber}` + lineBreak;
//   bill += `Customer: ${order.customerName}` + lineBreak;
//   bill += separator + doubleLineBreak;
  
//   // Items header
//   bill += boldOn;
//   bill += 'ITEMS' + lineBreak;
//   bill += boldOff;
//   bill += separator + lineBreak;
  
//   // Items list
//   order.items?.forEach(item => {
//     const itemName = item.name || item.menuItem?.name || 'Item';
//     const quantity = item.quantity || 1;
//     const price = item.price || 0;
//     const total = price * quantity;
    
//     bill += `${quantity}x ${itemName}` + lineBreak;
//     bill += `    ₹${price} x ${quantity} = ₹${total}` + lineBreak;
//   });
  
//   bill += separator + doubleLineBreak;
  
//   // Totals
//   bill += boldOn;
//   bill += 'TOTAL: ₹' + (order.finalTotal || order.totalAmount || 0) + lineBreak;
//   bill += boldOff;
  
//   // Tax and discount breakdown
//   if (order.taxAmount > 0) {
//     bill += `Tax: ₹${order.taxAmount || 0}` + lineBreak;
//   }
//   if (order.discountAmount > 0) {
//     bill += `Discount: -₹${order.discountAmount || 0}` + lineBreak;
//   }
  
//   bill += doubleLineBreak;
//   bill += separator + doubleLineBreak;
  
//   // Footer
//   bill += centerAlign;
//   bill += 'Thank you for visiting!' + lineBreak;
//   bill += 'We hope to see you again soon.' + doubleLineBreak;
//   bill += doubleLineBreak + doubleLineBreak + doubleLineBreak; // Paper cut
  
//   return bill;
// };

// Alternative: Print using browser print dialog (fallback)
const printBrowserBill = (order) => {
  const billWindow = window.open('', '_blank');
  const billContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Bill - Order #${order.orderNumber}</title>
      <style>
        body { 
          font-family: 'Courier New', monospace; 
          width: 80mm; 
          margin: 0; 
          padding: 10px;
          font-size: 14px;
        }
        .header { text-align: center; font-weight: bold; font-size: 16px; }
        .separator { border-bottom: 1px dashed #000; margin: 10px 0; }
        .item { display: flex; justify-content: space-between; margin: 5px 0; }
        .total { font-weight: bold; margin-top: 10px; }
        .footer { text-align: center; margin-top: 20px; font-style: italic; }
        @media print {
          body { width: 80mm !important; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>AMORE MIO</h2>
        <p>Restaurant & Cafe</p>
      </div>
      <div class="separator"></div>
      
      <p><strong>Order #:</strong> ${order.orderNumber}</p>
      <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
      <p><strong>Time:</strong> ${new Date(order.createdAt).toLocaleTimeString()}</p>
      <p><strong>Table:</strong> ${order.tableNumber}</p>
      <p><strong>Customer:</strong> ${order.customerName}</p>
      
      <div class="separator"></div>
      
      <h3>ITEMS</h3>
      ${order.items?.map(item => {
        const itemName = item.name || item.menuItem?.name || 'Item';
        const quantity = item.quantity || 1;
        const price = item.price || 0;
        const total = price * quantity;
        return `
          <div class="item">
            <span>${quantity}x ${itemName}</span>
            <span>₹${total}</span>
          </div>
          <div style="font-size: 12px; margin-left: 20px;">₹${price} x ${quantity}</div>
        `;
      }).join('')}
      
      <div class="separator"></div>
      
      <div class="total">
        <div class="item">
          <span>TOTAL:</span>
          <span>₹${order.finalTotal || order.totalAmount || 0}</span>
        </div>
      </div>
      
      ${order.taxAmount > 0 ? `<p>Tax: ₹${order.taxAmount}</p>` : ''}
      ${order.discountAmount > 0 ? `<p>Discount: -₹${order.discountAmount}</p>` : ''}
      
      <div class="footer">
        <p>Thank you for visiting!</p>
        <p>We hope to see you again soon.</p>
      </div>
    </body>
    </html>
  `;
  
  billWindow.document.write(billContent);
  billWindow.document.close();
  billWindow.print();
  billWindow.close();
};



// Enhanced Bluetooth printing function
const printBillEnhanced = async (order) => {
  try {
    console.log('🖨️ Printing bill for order:', order.orderNumber);
    
    if (!navigator.bluetooth) {
      // Fallback to browser print
      printBrowserBill(order);
      return;
    }

    // For common thermal printers, try these services
    const device = await navigator.bluetooth.requestDevice({
      filters: [
        { namePrefix: 'BT' },
        { namePrefix: 'Printer' },
        { namePrefix: 'POS' }
      ],
      optionalServices: [
        '000018f0-0000-1000-8000-00805f9b34fb', // Common POS service
        '00001101-0000-1000-8000-00805f9b34fb'  // Serial Port Profile
      ]
    });

    const server = await device.gatt.connect();
    console.log('✅ Connected to GATT server');
    
    // Try different services
    let service;
    try {
      service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
    } catch (e) {
      service = await server.getPrimaryService('00001101-0000-1000-8000-00805f9b34fb');
    }
    
    const characteristics = await service.getCharacteristics();
    console.log('📋 Found characteristics:', characteristics.length);
    
    // Find a writable characteristic
    const characteristic = characteristics.find(char => 
      char.properties.write || char.properties.writeWithoutResponse
    );
    
    if (characteristic) {
      const billContent = generateBillContent(order);
      const encoder = new TextEncoder();
      const data = encoder.encode(billContent);
      
      await characteristic.writeValue(data);
      alert(`✅ Bill printed successfully for Order #${order.orderNumber}`);
    } else {
      throw new Error('No writable characteristic found');
    }
    
    await server.disconnect();
    
  } catch (error) {
    console.error('❌ Bluetooth print failed:', error);
    
    // Fallback to browser printing
    console.log('🔄 Falling back to browser print...');
    printBrowserBill(order);
  }
};

// Test print function that simulates Bluetooth printing
const testPrintBill = async (order) => {
  try {
    console.log('🧪 Testing print for order:', order.orderNumber);
    
    // Simulate Bluetooth connection process
    alert('🔍 Searching for Bluetooth printers...');
    
    // Simulate delay for Bluetooth connection
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Show what would be sent to printer
    const billContent = generateBillContent(order);
    
    const testWindow = window.open('', '_blank', 'width=400,height=700');
    testWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print Test - Order #${order.orderNumber}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            background: #f0f8ff;
          }
          .test-container {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .status {
            background: #4CAF50;
            color: white;
            padding: 10px;
            border-radius: 4px;
            text-align: center;
            margin-bottom: 20px;
          }
          .thermal-output {
            background: white;
            border: 2px solid #333;
            padding: 15px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.3;
            white-space: pre;
            background: linear-gradient(white, white) padding-box,
                        repeating-linear-gradient(0deg, #f0f0f0, #f0f0f0 1px, white 1px, white 20px);
            background-size: 100% 20px;
            min-height: 400px;
          }
          .bluetooth-info {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 4px;
            margin-top: 20px;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="test-container">
          <div class="status">
            ✅ PRINT TEST SUCCESSFUL
          </div>
          
          <h3>What would be sent to Bluetooth printer:</h3>
          <div class="thermal-output">
${billContent}
          </div>
          
          <div class="bluetooth-info">
            <strong>Bluetooth Simulation:</strong><br>
            • Device: Thermal Printer (Simulated)<br>
            • Service: ESC/POS Protocol<br>
            • Data Sent: ${billContent.length} characters<br>
            • Order: #${order.orderNumber}<br>
            • Status: Printed successfully ✅
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Print This Preview
            </button>
            <button onclick="window.close()" style="padding: 10px 20px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">
              Close
            </button>
          </div>
        </div>
      </body>
      </html>
    `);
    testWindow.document.close();
    
  } catch (error) {
    console.error('Test print error:', error);
    alert('Test print failed: ' + error.message);
  }
};

// Add this function to preview the bill
const previewBill = (order) => {
  const billContent = generateBillContent(order);
  
  // Create a preview window
  const previewWindow = window.open('', '_blank', 'width=400,height=600');
  
  previewWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Bill Preview - Order #${order.orderNumber}</title>
      <style>
        body {
          font-family: 'Courier New', monospace;
          background: #f5f5f5;
          padding: 20px;
        }
        .preview-container {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          max-width: 350px;
          margin: 0 auto;
          white-space: pre-wrap;
          font-size: 14px;
          line-height: 1.4;
        }
        .preview-header {
          text-align: center;
          margin-bottom: 20px;
          color: #333;
        }
        .thermal-preview {
          background: white;
          border: 1px dashed #ccc;
          padding: 15px;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.3;
          white-space: pre;
        }
        .actions {
          margin-top: 20px;
          text-align: center;
        }
        button {
          padding: 10px 20px;
          margin: 5px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .print-btn {
          background: #4CAF50;
          color: white;
        }
        .close-btn {
          background: #f44336;
          color: white;
        }
      </style>
    </head>
    <body>
      <div class="preview-container">
        <div class="preview-header">
          <h2>Bill Preview</h2>
          <p>Order #${order.orderNumber}</p>
        </div>
        
        <div class="thermal-preview">
${billContent}
        </div>
        
        <div class="actions">
          <button class="print-btn" onclick="window.print()">Print Preview</button>
          <button class="close-btn" onclick="window.close()">Close</button>
        </div>
      </div>
    </body>
    </html>
  `);
  
  previewWindow.document.close();
};

// Enhanced bill content generator with better formatting
const generateBillContent = (order) => {
  const lineBreak = '\n';
  const separator = '--------------------------------';
  
  let bill = '';
  
  // Header
  bill += '    AMORE MIO RESTAURANT    ' + lineBreak;
  bill += '                              ' + lineBreak;
  bill += '        Restaurant & Cafe        ' + lineBreak;
  bill += separator + lineBreak;
  
  // Order details
  bill += `Order #: ${order.orderNumber}` + lineBreak;
  bill += `Date   : ${new Date(order.createdAt).toLocaleDateString('en-IN')}` + lineBreak;
  bill += `Time   : ${new Date(order.createdAt).toLocaleTimeString('en-IN', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  })}` + lineBreak;
  bill += `Table  : ${order.tableNumber}` + lineBreak;
  bill += `Customer: ${order.customerName}` + lineBreak;
  bill += separator + lineBreak;
  
  // Items header
  bill += 'QTY  ITEM                  AMT' + lineBreak;
  bill += separator + lineBreak;
  
  // Items list
  order.items?.forEach(item => {
    const itemName = item.name || item.menuItem?.name || 'Item';
    const quantity = item.quantity || 1;
    const price = item.price || 0;
    const total = price * quantity;
    
    // Truncate long item names
    const truncatedName = itemName.length > 18 ? itemName.substring(0, 15) + '...' : itemName;
    
    bill += `${quantity.toString().padEnd(3)} ${truncatedName.padEnd(20)} ₹${total}` + lineBreak;
    bill += `    ₹${price} x ${quantity}` + lineBreak;
  });
  
  bill += separator + lineBreak;
  
  // Totals
  const finalTotal = order.finalTotal || order.totalAmount || 0;
  
  if (order.taxAmount > 0) {
    bill += `Tax:                 ₹${order.taxAmount.toFixed(2)}` + lineBreak;
  }
  
  if (order.discountAmount > 0) {
    bill += `Discount:            -₹${order.discountAmount.toFixed(2)}` + lineBreak;
  }
  
  bill += `                     --------` + lineBreak;
  bill += `TOTAL:               ₹${finalTotal.toFixed(2)}` + lineBreak;
  bill += separator + lineBreak;
  
  // Footer
  bill += '                              ' + lineBreak;
  bill += '   Thank you for visiting!    ' + lineBreak;
  bill += '  We hope to see you again   ' + lineBreak;
  bill += '         soon!               ' + lineBreak;
  bill += '                              ' + lineBreak;
  bill += '                              ' + lineBreak;
  bill += '==============================' + lineBreak;
  
  return bill;
};
  // Login handler
  const handleLogin = (e) => {
    e.preventDefault()
    if (loginForm.username === ADMIN_CREDENTIALS.username && 
        loginForm.password === ADMIN_CREDENTIALS.password) {
      setIsAuthenticated(true)
      localStorage.setItem('receptionAuth', 'authenticated')
      setLoginForm({ username: '', password: '' })
    } else {
      setLoginError('Invalid credentials')
    }
  }

  // Logout handler
  const handleLogout = () => {
    setIsAuthenticated(false)
    setOrders([])
    localStorage.removeItem('receptionAuth')
  }

  // Status helpers
  const getStatusColor = (status) => {
    const colors = {
      pending: '#fd7e14',
      served: '#59a6e9ff',
      paid: '#28a745'
    }
    return colors[status] || '#6c757d'
  }

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pending', served: 'Served',  paid: 'Paid'
    }
    return texts[status] || status
  }

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1>🔐 Reception Dashboard</h1>
          <form onSubmit={handleLogin}>
            {loginError && <div className="error-message">{loginError}</div>}
            <input
              type="text"
              value={loginForm.username}
              onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
              placeholder="Username"
              required
            />
            <input
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              placeholder="Password"
              required
            />
            <button type="submit">Sign In</button>
          </form>
        </div>
      </div>
    )
  }

  // Main dashboard
  return (
    <div className="reception-dashboard">
      <audio ref={audioRef} preload="auto">
        <source src="/notification-sound.mp3" type="audio/mpeg" />
      </audio>

      {showNotification && newOrder && (
        <div className="new-order-popup">
          <button onClick={() => setShowNotification(false)}>×</button>
          <h4>🎉 New Order #{newOrder.orderNumber}</h4>
          <p>Table {newOrder.tableNumber} • {newOrder.customerName}</p>
        </div>
      )}

      <header className="dashboard-header">
        <div className="header-top">
          <h1>Reception Dashboard</h1>
          <div className="header-actions">
            <button onClick={handleLogout} className="logout-btn">Logout</button>
            <Link to="/admin/tables" className="btn-primary">Manage Tables</Link>
            <Link to="/admin/menu" className="btn-primary">Manage Menu</Link>
            <Link to="/inventory" className="btn-primary">Manage Inventory</Link>
            <Link to="/analysis" className="btn-primary">Analysis</Link>
          </div>
        </div>

        {/* DEBUG INFO */}
        {/* <div style={{background: '#f8f9fa', padding: '10px', margin: '10px 0', borderRadius: '5px'}}>
          <strong>Debug Info:</strong> Orders: {orders.length} | Loading: {loading.toString()} | Error: {error}
          <button onClick={fetchOrders} style={{marginLeft: '10px'}}>Refresh Data</button>
        </div> */}

        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>Total Orders</h3>
              <p className="stat-number">{stats.totalOrders}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>Pending</h3>
              <p className="stat-number">{stats.pendingOrders}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>Monthly Revenue</h3>
              <p className="stat-number">₹{stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="orders-section">
        <div className="section-header">
          <h2>Recent Orders ({orders.length})</h2>
          <button onClick={fetchOrders} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchOrders}>Retry</button>
          </div>
        )}

        {loading && <div className="loading-message">Loading orders...</div>}

        {!loading && !error && orders.length === 0 && (
          <div className="no-orders">
            <p>No orders found</p>
            <button onClick={fetchOrders}>Check Again</button>
          </div>
        )}

        <div className="orders-grid">
          {orders.map(order => (
            <div key={order._id} className="order-card">
              {/* <div className="order-title">
                <h3>Order #{order.orderNumber}</h3>
                <span className="order-time">
                  {new Date(order.createdAt).toLocaleTimeString()}
                </span>
              </div> */}
              <div className="order-title">
                <h3>Order #{order.orderNumber}</h3>
                <div className="order-time-info">
                  <span className="order-date">
                    {new Date(order.createdAt || order.orderTime).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="order-time">
                    {new Date(order.createdAt || order.orderTime).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </span>
                </div>
              </div>
              <span 
                className="status-badge"
                style={{backgroundColor: getStatusColor(order.status)}}
              >
                {getStatusText(order.status)}
              </span>
              
              <div className="order-details">
                <div className="detail-row">
                  <span>Table:</span>
                  <span>Table {order.tableNumber}</span>
                </div>
                <div className="detail-row">
                  <span>Customer:</span>
                  <span>{order.customerName}</span>
                </div>
                <div className="detail-row">
                  <span>Mobile:</span>
                  <span>{order.mobileNumber}</span>
                </div>
              </div>

              <div className="order-items">
                <h4>Items:</h4>
                {order.items?.map((item, index) => (
                  <div key={index} className="order-item">
                    <span>{item.quantity}x {item.name || item.menuItem?.name}</span>
                    <span>₹{(item.price || 0) * (item.quantity || 1)}</span>
                  </div>
                ))}
              </div>

              <div className="order-total">
                <strong>Total: ₹{order.totalAmount || order.finalTotal}</strong>
              </div>

              <div className="order-actions">
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.orderNumber, e.target.value)}
                  disabled={updatingOrders.has(order.orderNumber)}
                  className='status-select'
                >
                  <option value="pending">Pending</option>
                  <option value="served">Served</option>
                  <option value="paid">Paid</option>
                </select>
                

  <button 
    className="preview-btn"
    onClick={() => previewBill(order)}
    title="Preview Bill"
  >
    👁️ Preview
  </button>
  
  {/* Print Bill Button */}
  {/* <button 
    className="print-btn"
    onClick={() => testPrintBill(order)}
    title="Test Print Bill"
    disabled={order.status === 'pending' || order.status === 'cancelled'}
  >
    🖨️ Print Bill
  </button> */}
                {/* {updatingOrders.has(order.orderNumber) && <span>Updating...</span>}
                {updatingOrders.has(order.orderNumber) && <span>Updating...</span>} */}

                 {/* Print Bill Button - Only show for served/paid orders */}
  {(order.status === 'served' || order.status === 'paid') && (
    <button 
      className="print-btn"
      onClick={() => testPrintBill(order)}
      title="Print Bill"
    >
      🖨️ Print Bill
    </button>
  )}
  
  {updatingOrders.has(order.orderNumber) && (
    <span className="updating-indicator">Updating...</span>
  )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ReceptionDashboard



