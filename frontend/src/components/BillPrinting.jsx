// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import axios from 'axios';
// import './BillPrinting.css';

// const API_BASE_URL = 'https://orderflow-backend-v964.onrender.com/api';

// const BillPrinting = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [showPrintPreview, setShowPrintPreview] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [restaurantInfo, setRestaurantInfo] = useState({
//     name: 'Delicious Restaurant',
//     address: '123 Main Street, City, State 12345',
//     phone: '(555) 123-4567',
//     email: 'info@deliciousrestaurant.com',
//     taxRate: 8.5,
//     logo: ''
//   });

//   // Sample orders data (you can replace with API call)
//   const sampleOrders = [
//     {
//       _id: '1',
//       orderNumber: 'ORD-001',
//       tableNumber: 5,
//       customerName: 'John Smith',
//       items: [
//         { name: 'Margherita Pizza', quantity: 1, price: 12.99 },
//         { name: 'Caesar Salad', quantity: 1, price: 8.99 },
//         { name: 'Coke', quantity: 2, price: 2.50 }
//       ],
//       total: 26.98,
//       tax: 2.29,
//       finalTotal: 29.27,
//       orderDate: new Date().toISOString(),
//       status: 'completed',
//       paymentMethod: 'Credit Card'
//     },
//     {
//       _id: '2',
//       orderNumber: 'ORD-002',
//       tableNumber: 3,
//       customerName: 'Sarah Johnson',
//       items: [
//         { name: 'Pasta Carbonara', quantity: 1, price: 14.99 },
//         { name: 'Garlic Bread', quantity: 1, price: 4.99 },
//         { name: 'Red Wine', quantity: 1, price: 6.99 }
//       ],
//       total: 26.97,
//       tax: 2.29,
//       finalTotal: 29.26,
//       orderDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
//       status: 'completed',
//       paymentMethod: 'Cash'
//     }
//   ];

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//     try {
//       setLoading(true);
//       // Try to fetch from API first
//       const response = await axios.get(`${API_BASE_URL}/orders`);
//       setOrders(response.data);
//     } catch (error) {
//       console.error('Error fetching orders, using sample data:', error);
//       // Use sample data if API fails
//       setOrders(sampleOrders);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePrint = (order) => {
//     setSelectedOrder(order);
//     setShowPrintPreview(true);
//   };

//   const executePrint = () => {
//     const printContent = document.getElementById('printable-bill').innerHTML;
//     const originalContent = document.body.innerHTML;
    
//     document.body.innerHTML = printContent;
//     window.print();
//     document.body.innerHTML = originalContent;
    
//     // Reload the component to restore functionality
//     window.location.reload();
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const filteredOrders = orders.filter(order =>
//     order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     order.tableNumber.toString().includes(searchTerm)
//   );

//   return (
//     <div className="bill-printing">
//       <header className="management-header">
//         <div className="header-content">
//           <Link to="/reception" className="back-button">
//             ← Back to Dashboard
//           </Link>
//           <h1>Bill Printing</h1>
//           <p>Generate and print professional invoices and bills</p>
//         </div>
//       </header>

//       <div className="management-content">
//         {/* Search and Controls */}
//         <div className="bill-controls">
//           <div className="search-bar">
//             <input
//               type="text"
//               placeholder="Search by order number, customer name, or table..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="search-input"
//             />
//           </div>
//           <button onClick={fetchOrders} className="btn-secondary" disabled={loading}>
//             {loading ? 'Refreshing...' : 'Refresh Orders'}
//           </button>
//         </div>

//         {/* Orders List */}
//         <div className="orders-list">
//           {loading ? (
//             <div className="loading-message">Loading orders...</div>
//           ) : filteredOrders.length === 0 ? (
//             <div className="no-orders">
//               <p>No orders found</p>
//               <small>Try changing your search term</small>
//             </div>
//           ) : (
//             <div className="orders-grid">
//               {filteredOrders.map(order => (
//                 <div key={order._id} className="order-card">
//                   <div className="order-header">
//                     <h3>{order.orderNumber}</h3>
//                     <span className={`status ${order.status}`}>
//                       {order.status}
//                     </span>
//                   </div>
//                   <div className="order-details">
//                     <p><strong>Customer:</strong> {order.customerName}</p>
//                     <p><strong>Table:</strong> {order.tableNumber}</p>
//                     <p><strong>Date:</strong> {formatDate(order.orderDate)}</p>
//                     <p><strong>Total:</strong> ${order.finalTotal?.toFixed(2)}</p>
//                     <p><strong>Payment:</strong> {order.paymentMethod}</p>
//                   </div>
//                   <div className="order-actions">
//                     <button 
//                       onClick={() => handlePrint(order)}
//                       className="btn-primary"
//                     >
//                       Print Bill
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Print Preview Modal */}
//         {showPrintPreview && selectedOrder && (
//           <div className="print-modal">
//             <div className="print-content">
//               <div className="print-header">
//                 <h2>Print Preview - {selectedOrder.orderNumber}</h2>
//                 <div className="print-actions">
//                   <button onClick={executePrint} className="btn-primary">
//                     🖨️ Print Now
//                   </button>
//                   <button 
//                     onClick={() => setShowPrintPreview(false)}
//                     className="btn-secondary"
//                   >
//                     Close
//                   </button>
//                 </div>
//               </div>
              
//               {/* Printable Bill */}
//               <div id="printable-bill" className="printable-bill">
//                 <div className="bill-header">
//                   <div className="restaurant-logo">
//                     <h1>{restaurantInfo.name}</h1>
//                     {restaurantInfo.logo && (
//                       <img src={restaurantInfo.logo} alt="Restaurant Logo" />
//                     )}
//                   </div>
//                   <div className="restaurant-info">
//                     <p>{restaurantInfo.address}</p>
//                     <p>Phone: {restaurantInfo.phone}</p>
//                     <p>Email: {restaurantInfo.email}</p>
//                   </div>
//                 </div>

//                 <div className="bill-details">
//                   <div className="bill-meta">
//                     <div className="meta-left">
//                       <p><strong>Order Number:</strong> {selectedOrder.orderNumber}</p>
//                       <p><strong>Customer:</strong> {selectedOrder.customerName}</p>
//                       <p><strong>Table:</strong> {selectedOrder.tableNumber}</p>
//                     </div>
//                     <div className="meta-right">
//                       <p><strong>Date:</strong> {formatDate(selectedOrder.orderDate)}</p>
//                       <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p>
//                     </div>
//                   </div>

//                   <table className="bill-items">
//                     <thead>
//                       <tr>
//                         <th>Item</th>
//                         <th>Qty</th>
//                         <th>Price</th>
//                         <th>Total</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {selectedOrder.items.map((item, index) => (
//                         <tr key={index}>
//                           <td>{item.name}</td>
//                           <td>{item.quantity}</td>
//                           <td>${item.price.toFixed(2)}</td>
//                           <td>${(item.quantity * item.price).toFixed(2)}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>

//                   <div className="bill-totals">
//                     <div className="total-row">
//                       <span>Subtotal:</span>
//                       <span>${selectedOrder.total?.toFixed(2)}</span>
//                     </div>
//                     <div className="total-row">
//                       <span>Tax ({restaurantInfo.taxRate}%):</span>
//                       <span>${selectedOrder.tax?.toFixed(2)}</span>
//                     </div>
//                     <div className="total-row grand-total">
//                       <span>Total:</span>
//                       <span>${selectedOrder.finalTotal?.toFixed(2)}</span>
//                     </div>
//                   </div>

//                   <div className="bill-footer">
//                     <p className="thank-you">Thank you for dining with us!</p>
//                     <p className="footer-note">
//                       For any queries, please contact {restaurantInfo.phone}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default BillPrinting;

// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import axios from 'axios';
// import './BillPrinting.css';

// const API_BASE_URL = 'https://orderflow-backend-v964.onrender.com/api';

// const BillPrinting = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [showPrintPreview, setShowPrintPreview] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [restaurantInfo, setRestaurantInfo] = useState({
//     name: 'Delicious Restaurant',
//     address: '123 Main Street, City, State 12345',
//     phone: '(555) 123-4567',
//     email: 'info@deliciousrestaurant.com',
//     taxRate: 8.5,
//     logo: ''
//   });

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${API_BASE_URL}/orders`);
//       console.log('Fetched orders:', response.data);
//       setOrders(response.data);
//     } catch (error) {
//       console.error('Error fetching orders:', error);
//       alert('Error loading orders. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePrint = (order) => {
//     setSelectedOrder(order);
//     setShowPrintPreview(true);
//   };

//   const executePrint = () => {
//     const printContent = document.getElementById('printable-bill').innerHTML;
//     const originalContent = document.body.innerHTML;
    
//     document.body.innerHTML = printContent;
//     window.print();
//     document.body.innerHTML = originalContent;
    
//     // Reload the component to restore functionality
//     window.location.reload();
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   // Calculate totals if not provided in the order data
//   const calculateOrderTotals = (order) => {
//     if (order.finalTotal && order.tax && order.total) {
//       return order; // Return as-is if totals already calculated
//     }

//     const subtotal = order.items?.reduce((sum, item) => 
//       sum + (item.quantity * item.price), 0) || 0;
    
//     const taxRate = restaurantInfo.taxRate / 100;
//     const tax = subtotal * taxRate;
//     const finalTotal = subtotal + tax;

//     return {
//       ...order,
//       total: subtotal,
//       tax: tax,
//       finalTotal: finalTotal
//     };
//   };

//   const filteredOrders = orders.filter(order => {
//     const searchLower = searchTerm.toLowerCase();
//     return (
//       order.orderNumber?.toLowerCase().includes(searchLower) ||
//       order.customerName?.toLowerCase().includes(searchLower) ||
//       order.tableNumber?.toString().includes(searchTerm)
//     );
//   });

//   return (
//     <div className="bill-printing">
//       <header className="management-header">
//         <div className="header-content">
//           <Link to="/reception" className="back-button">
//             ← Back to Dashboard
//           </Link>
//           <h1>Bill Printing</h1>
//           <p>Generate and print professional invoices and bills</p>
//           <div className="orders-count">
//             {orders.length} order(s) available for printing
//           </div>
//         </div>
//       </header>

//       <div className="management-content">
//         {/* Search and Controls */}
//         <div className="bill-controls">
//           <div className="search-bar">
//             <input
//               type="text"
//               placeholder="Search by order number, customer name, or table..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="search-input"
//             />
//           </div>
//           <button onClick={fetchOrders} className="btn-secondary" disabled={loading}>
//             {loading ? 'Refreshing...' : 'Refresh Orders'}
//           </button>
//         </div>

//         {/* Orders List */}
//         <div className="orders-list">
//           {loading ? (
//             <div className="loading-message">Loading orders...</div>
//           ) : filteredOrders.length === 0 ? (
//             <div className="no-orders">
//               <p>No orders found</p>
//               <small>
//                 {searchTerm ? 'Try changing your search term' : 'No completed orders available for printing'}
//               </small>
//             </div>
//           ) : (
//             <div className="orders-grid">
//               {filteredOrders.map(order => {
//                 const orderWithTotals = calculateOrderTotals(order);
//                 return (
//                   <div key={order._id} className="order-card">
//                     <div className="order-header">
//                       <h3>{order.orderNumber || `ORD-${order._id.slice(-4)}`}</h3>
//                       <span className={`status ${order.status}`}>
//                         {order.status}
//                       </span>
//                     </div>
//                     <div className="order-details">
//                       <p><strong>Customer:</strong> {order.customerName || 'Walk-in Customer'}</p>
//                       <p><strong>Table:</strong> {order.tableNumber || 'N/A'}</p>
//                       <p><strong>Date:</strong> {formatDate(order.createdAt || order.orderDate)}</p>
//                       <p><strong>Total:</strong> ${orderWithTotals.finalTotal?.toFixed(2)}</p>
//                       <p><strong>Payment:</strong> {order.paymentMethod || 'Not Specified'}</p>
//                       <p><strong>Items:</strong> {order.items?.length || 0} item(s)</p>
//                     </div>
//                     <div className="order-actions">
//                       <button 
//                         onClick={() => handlePrint(orderWithTotals)}
//                         className="btn-primary"
//                         disabled={!order.items || order.items.length === 0}
//                       >
//                         Print Bill
//                       </button>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>

//         {/* Print Preview Modal */}
//         {showPrintPreview && selectedOrder && (
//           <div className="print-modal">
//             <div className="print-content">
//               <div className="print-header">
//                 <h2>Print Preview - {selectedOrder.orderNumber || `ORD-${selectedOrder._id?.slice(-4)}`}</h2>
//                 <div className="print-actions">
//                   <button onClick={executePrint} className="btn-primary">
//                     🖨️ Print Now
//                   </button>
//                   <button 
//                     onClick={() => setShowPrintPreview(false)}
//                     className="btn-secondary"
//                   >
//                     Close
//                   </button>
//                 </div>
//               </div>
              
//               {/* Printable Bill */}
//               <div id="printable-bill" className="printable-bill">
//                 <div className="bill-header">
//                   <div className="restaurant-logo">
//                     <h1>{restaurantInfo.name}</h1>
//                     {restaurantInfo.logo && (
//                       <img src={restaurantInfo.logo} alt="Restaurant Logo" />
//                     )}
//                   </div>
//                   <div className="restaurant-info">
//                     <p>{restaurantInfo.address}</p>
//                     <p>Phone: {restaurantInfo.phone}</p>
//                     <p>Email: {restaurantInfo.email}</p>
//                   </div>
//                 </div>

//                 <div className="bill-details">
//                   <div className="bill-meta">
//                     <div className="meta-left">
//                       <p><strong>Order Number:</strong> {selectedOrder.orderNumber || `ORD-${selectedOrder._id?.slice(-4)}`}</p>
//                       <p><strong>Customer:</strong> {selectedOrder.customerName || 'Walk-in Customer'}</p>
//                       <p><strong>Table:</strong> {selectedOrder.tableNumber || 'N/A'}</p>
//                     </div>
//                     <div className="meta-right">
//                       <p><strong>Date:</strong> {formatDate(selectedOrder.createdAt || selectedOrder.orderDate)}</p>
//                       <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod || 'Not Specified'}</p>
//                     </div>
//                   </div>

//                   <table className="bill-items">
//                     <thead>
//                       <tr>
//                         <th>Item</th>
//                         <th>Qty</th>
//                         <th>Price</th>
//                         <th>Total</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {selectedOrder.items?.map((item, index) => (
//                         <tr key={index}>
//                           <td>{item.name}</td>
//                           <td>{item.quantity}</td>
//                           <td>${item.price?.toFixed(2)}</td>
//                           <td>${((item.quantity || 0) * (item.price || 0)).toFixed(2)}</td>
//                         </tr>
//                       )) || (
//                         <tr>
//                           <td colSpan="4" style={{ textAlign: 'center', color: '#666' }}>
//                             No items in this order
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>

//                   <div className="bill-totals">
//                     <div className="total-row">
//                       <span>Subtotal:</span>
//                       <span>${selectedOrder.total?.toFixed(2)}</span>
//                     </div>
//                     <div className="total-row">
//                       <span>Tax ({restaurantInfo.taxRate}%):</span>
//                       <span>${selectedOrder.tax?.toFixed(2)}</span>
//                     </div>
//                     <div className="total-row grand-total">
//                       <span>Total:</span>
//                       <span>${selectedOrder.finalTotal?.toFixed(2)}</span>
//                     </div>
//                   </div>

//                   <div className="bill-footer">
//                     <p className="thank-you">Thank you for dining with us!</p>
//                     <p className="footer-note">
//                       For any queries, please contact {restaurantInfo.phone}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default BillPrinting;


import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './BillPrinting.css';

const API_BASE_URL = 'https://orderflow-backend-v964.onrender.com/api';

const BillPrinting = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const printRef = useRef();

  const restaurantInfo = {
    name: 'Delicious Restaurant',
    address: '123 Main Street, City, State 12345',
    phone: '(555) 123-4567',
    email: 'info@deliciousrestaurant.com',
    taxRate: 8.5,
    logo: ''
  };

  // Sample data for testing
  const sampleOrders = [
    {
      _id: '1',
      orderNumber: 'ORD-001',
      tableNumber: 5,
      customerName: 'John Smith',
      items: [
        { name: 'Margherita Pizza', quantity: 1, price: 12.99 },
        { name: 'Caesar Salad', quantity: 1, price: 8.99 },
        { name: 'Coke', quantity: 2, price: 2.50 }
      ],
      total: 26.98,
      tax: 2.29,
      finalTotal: 29.27,
      orderDate: new Date().toISOString(),
      status: 'completed',
      paymentMethod: 'Credit Card'
    }
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/orders`);
      console.log('Orders loaded:', response.data);
      setOrders(response.data.length > 0 ? response.data : sampleOrders);
    } catch (error) {
      console.error('Error fetching orders, using sample data:', error);
      setOrders(sampleOrders);
    } finally {
      setLoading(false);
    }
  };

  // Improved print handler
  const handlePrint = (order) => {
    console.log('Print button clicked for order:', order);
    setSelectedOrder(order);
    setShowPrintPreview(true);
  };

  // Reliable print function
  const executePrint = () => {
    console.log('Executing print...');
    alert("Bill printed successfully!");
    // Method 1: Using window.print() directly
    try {
      window.print();
    } catch (error) {
      console.error('Print failed:', error);
      alert('Print failed. Please check your print settings.');
    }
  };

  // Alternative print method
  const executePrintAlternative = () => {
    const printContent = document.getElementById('printable-bill');
    
    if (!printContent) {
      console.error('Print content not found');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Bill - ${selectedOrder.orderNumber}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #000;
            }
            .bill-header { 
              text-align: center; 
              margin-bottom: 20px;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
            .restaurant-name { 
              font-size: 24px; 
              font-weight: bold; 
              margin: 10px 0; 
            }
            .bill-items { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0;
            }
            .bill-items th, .bill-items td { 
              border: 1px solid #000; 
              padding: 8px; 
              text-align: left; 
            }
            .bill-totals { 
              margin-top: 20px; 
              text-align: right; 
            }
            .grand-total { 
              font-weight: bold; 
              font-size: 18px; 
              border-top: 2px solid #000;
              padding-top: 10px;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      // Optional: close window after printing
      // printWindow.close();
    }, 500);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateOrderTotals = (order) => {
    if (order.finalTotal && order.tax && order.total) {
      return order;
    }

    const subtotal = order.items?.reduce((sum, item) => 
      sum + (item.quantity * item.price), 0) || 0;
    
    const taxRate = restaurantInfo.taxRate / 100;
    const tax = subtotal * taxRate;
    const finalTotal = subtotal + tax;

    return {
      ...order,
      total: subtotal,
      tax: tax,
      finalTotal: finalTotal
    };
  };

  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    return (
      order.orderNumber?.toLowerCase().includes(searchLower) ||
      order.customerName?.toLowerCase().includes(searchLower) ||
      order.tableNumber?.toString().includes(searchTerm)
    );
  });

  return (
    <div className="bill-printing">
      <header className="management-header">
        <div className="header-content">
          <Link to="/reception" className="back-button">
            ← Back to Dashboard
          </Link>
          <h1>Bill Printing</h1>
          <p>Generate and print professional invoices and bills</p>
          <div className="orders-count">
            {orders.length} order(s) available • Click "Print Bill" to generate invoices
          </div>
        </div>
      </header>

      <div className="management-content">
        {/* Search and Controls */}
        <div className="bill-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by order number, customer name, or table..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button onClick={fetchOrders} className="btn-secondary" disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh Orders'}
          </button>
        </div>

        {/* Orders List */}
        <div className="orders-list">
          {loading ? (
            <div className="loading-message">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="no-orders">
              <p>No orders found</p>
              <small>
                {searchTerm ? 'Try changing your search term' : 'No orders available'}
              </small>
            </div>
          ) : (
            <div className="orders-grid">
              {filteredOrders.map(order => {
                const orderWithTotals = calculateOrderTotals(order);
                return (
                  <div key={order._id} className="order-card">
                    <div className="order-header">
                      <h3>{order.orderNumber || `ORD-${order._id?.slice(-4)}`}</h3>
                      <span className={`status ${order.status}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="order-details">
                      <p><strong>Customer:</strong> {order.customerName || 'Walk-in Customer'}</p>
                      <p><strong>Table:</strong> {order.tableNumber || 'N/A'}</p>
                      <p><strong>Date:</strong> {formatDate(order.createdAt || order.orderDate)}</p>
                      <p><strong>Total:</strong> ${orderWithTotals.finalTotal?.toFixed(2)}</p>
                      <p><strong>Payment:</strong> {order.paymentMethod || 'Not Specified'}</p>
                    </div>
                    <div className="order-actions">
                      <button 
                        onClick={() => handlePrint(orderWithTotals)}
                        className="btn-primary print-btn"
                      >
                        🖨️ Print Bill
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Print Preview Modal */}
        {showPrintPreview && selectedOrder && (
          <div className="print-modal">
            <div className="print-content">
              <div className="print-header">
                <h2>Print Preview - {selectedOrder.orderNumber || `ORD-${selectedOrder._id?.slice(-4)}`}</h2>
                <div className="print-actions">
                  <button onClick={executePrint} className="btn-primary">
                    🖨️ Print Now (Method 1)
                  </button>
                  <button onClick={executePrintAlternative} className="btn-secondary">
                    🖨️ Print Now (Method 2)
                  </button>
                  <button 
                    onClick={() => setShowPrintPreview(false)}
                    className="btn-secondary"
                  >
                    Close
                  </button>
                </div>
              </div>
              
              {/* Printable Bill */}
              <div id="printable-bill" className="printable-bill" ref={printRef}>
                <div className="bill-header">
                  <div className="restaurant-logo">
                    <h1>{restaurantInfo.name}</h1>
                    {restaurantInfo.logo && (
                      <img src={restaurantInfo.logo} alt="Restaurant Logo" />
                    )}
                  </div>
                  <div className="restaurant-info">
                    <p>{restaurantInfo.address}</p>
                    <p>Phone: {restaurantInfo.phone}</p>
                    <p>Email: {restaurantInfo.email}</p>
                  </div>
                </div>

                <div className="bill-details">
                  <div className="bill-meta">
                    <div className="meta-left">
                      <p><strong>Order Number:</strong> {selectedOrder.orderNumber || `ORD-${selectedOrder._id?.slice(-4)}`}</p>
                      <p><strong>Customer:</strong> {selectedOrder.customerName || 'Walk-in Customer'}</p>
                      <p><strong>Table:</strong> {selectedOrder.tableNumber || 'N/A'}</p>
                    </div>
                    <div className="meta-right">
                      <p><strong>Date:</strong> {formatDate(selectedOrder.createdAt || selectedOrder.orderDate)}</p>
                      <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod || 'Not Specified'}</p>
                    </div>
                  </div>

                  <table className="bill-items">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item, index) => (
                        <tr key={index}>
                          <td>{item.name}</td>
                          <td>{item.quantity}</td>
                          <td>${item.price?.toFixed(2)}</td>
                          <td>${((item.quantity || 0) * (item.price || 0)).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="bill-totals">
                    <div className="total-row">
                      <span>Subtotal:</span>
                      <span>${selectedOrder.total?.toFixed(2)}</span>
                    </div>
                    <div className="total-row">
                      <span>Tax ({restaurantInfo.taxRate}%):</span>
                      <span>${selectedOrder.tax?.toFixed(2)}</span>
                    </div>
                    <div className="total-row grand-total">
                      <span>Total:</span>
                      <span>${selectedOrder.finalTotal?.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="bill-footer">
                    <p className="thank-you">Thank you for dining with us!</p>
                    <p className="footer-note">
                      For any queries, please contact {restaurantInfo.phone}
                    </p>
                  </div>
                </div>
              </div>

              <div className="print-instructions">
                <h4>Printing Instructions:</h4>
                <ul>
                  <li>Click "Print Now (Method 1)" for standard printing</li>
                  <li>If Method 1 doesn't work, try "Print Now (Method 2)"</li>
                  <li>Make sure your printer is connected and turned on</li>
                  <li>Select the correct paper size (80mm for receipt printers)</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillPrinting;