import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BillingManagement.css';

const API_BASE_URL = 'https://orderflow-backend-v964.onrender.com/api';

const BillingManagement = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [unpaidOrders, setUnpaidOrders] = useState([]);
  const [mergedBill, setMergedBill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all tables with unpaid orders
  const fetchTablesWithUnpaidOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`${API_BASE_URL}/orders/unpaid-tables`);
      
      if (response.data.success) {
        setTables(response.data.data);
        console.log(`✅ Found ${response.data.data.length} tables with unpaid orders`);
      } else {
        throw new Error('Failed to fetch tables');
      }
    } catch (error) {
      console.error('❌ Error fetching tables:', error);
      setError('Failed to load tables with unpaid orders');
    } finally {
      setLoading(false);
    }
  };

  // Fetch unpaid orders for a specific table
  const fetchUnpaidOrdersForTable = async (tableNumber) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`${API_BASE_URL}/orders/table/${tableNumber}/unpaid`);
      
      if (response.data.success) {
        setUnpaidOrders(response.data.data);
        setSelectedTable(tableNumber);
        setMergedBill(null);
        console.log(`✅ Found ${response.data.data.length} unpaid orders for table ${tableNumber}`);
      } else {
        throw new Error('Failed to fetch unpaid orders');
      }
    } catch (error) {
      console.error('❌ Error fetching unpaid orders:', error);
      setError(`Failed to load orders for table ${tableNumber}`);
    } finally {
      setLoading(false);
    }
  };

  // Merge unpaid orders and calculate total
  const mergeAndCalculateBill = () => {
    if (unpaidOrders.length === 0) return;

    const mergedItems = [];
    let subtotal = 0;

    // Merge items from all unpaid orders
    unpaidOrders.forEach(order => {
      order.items.forEach(item => {
        const existingItem = mergedItems.find(mergedItem => 
          mergedItem.name === item.name && mergedItem.price === item.price
        );

        if (existingItem) {
          existingItem.quantity += item.quantity;
          existingItem.totalPrice += item.price * item.quantity;
        } else {
          mergedItems.push({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            totalPrice: item.price * item.quantity
          });
        }
      });
      subtotal += order.totalAmount;
    });

    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + tax;

    const bill = {
      tableNumber: selectedTable,
      orders: unpaidOrders,
      mergedItems,
      subtotal,
      tax,
      total,
      customerName: unpaidOrders[0]?.customerName || 'Customer',
      mobileNumber: unpaidOrders[0]?.mobileNumber || 'N/A',
      orderCount: unpaidOrders.length
    };

    setMergedBill(bill);
  };

  // Mark orders as paid
  const markAsPaid = async () => {
    if (!mergedBill || unpaidOrders.length === 0) return;

    try {
      setLoading(true);
      
      const orderIds = unpaidOrders.map(order => order._id);
      
      const response = await axios.post(`${API_BASE_URL}/orders/mark-paid`, {
        orderIds,
        tableNumber: selectedTable
      });

      if (response.data.success) {
        alert(`✅ ${response.data.message}`);
        
        // Reset state
        setUnpaidOrders([]);
        setMergedBill(null);
        setSelectedTable(null);
        
        // Refresh tables list
        fetchTablesWithUnpaidOrders();
      } else {
        throw new Error('Failed to mark orders as paid');
      }
    } catch (error) {
      console.error('❌ Error marking orders as paid:', error);
      alert('Failed to mark orders as paid. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Print bill
  const printBill = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Bill - Table ${mergedBill.tableNumber} - Amore Mio</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .restaurant-name { font-size: 24px; font-weight: bold; color: #333; }
            .bill-info { margin: 15px 0; }
            .bill-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            .bill-table th, .bill-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .bill-table th { background-color: #f5f5f5; }
            .totals { margin-top: 20px; text-align: right; }
            .footer { margin-top: 30px; text-align: center; color: #666; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="restaurant-name">Amore Mio</div>
            <div>Restaurant & Cafe</div>
          </div>
          
          <div class="bill-info">
            <div><strong>Table:</strong> ${mergedBill.tableNumber}</div>
            <div><strong>Customer:</strong> ${mergedBill.customerName}</div>
            <div><strong>Mobile:</strong> ${mergedBill.mobileNumber}</div>
            <div><strong>Orders Merged:</strong> ${mergedBill.orderCount}</div>
            <div><strong>Date:</strong> ${new Date().toLocaleString()}</div>
          </div>

          <table class="bill-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${mergedBill.mergedItems.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>₹${item.price}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.totalPrice}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div><strong>Subtotal:</strong> ₹${mergedBill.subtotal.toFixed(2)}</div>
            <div><strong>Tax (5%):</strong> ₹${mergedBill.tax.toFixed(2)}</div>
            <div><strong>Grand Total:</strong> ₹${mergedBill.total.toFixed(2)}</div>
          </div>

          <div class="footer">
            <div>Thank you for dining with us!</div>
            <div>Visit again</div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  useEffect(() => {
    fetchTablesWithUnpaidOrders();
  }, []);

  return (
    <div className="billing-management">
      <header className="billing-header">
        <h1>💰 Billing Management</h1>
        <p>Manage table bills and process payments</p>
        
        {error && (
          <div className="error-message">
            {error}
            <button onClick={fetchTablesWithUnpaidOrders}>Try Again</button>
          </div>
        )}
        
        <button onClick={fetchTablesWithUnpaidOrders} className="refresh-btn">
          🔄 Refresh
        </button>
      </header>

      <div className="billing-container">
        {/* Tables Section */}
        <div className="tables-section">
          <h2>Tables with Unpaid Orders</h2>
          
          {loading && !selectedTable ? (
            <div className="loading">Loading tables...</div>
          ) : tables.length === 0 ? (
            <div className="no-tables">
              <p>No tables with unpaid orders found.</p>
            </div>
          ) : (
            <div className="tables-grid">
              {tables.map(table => (
                <div 
                  key={table._id} 
                  className={`table-card ${selectedTable === table.tableNumber ? 'selected' : ''}`}
                  onClick={() => fetchUnpaidOrdersForTable(table.tableNumber)}
                >
                  <div className="table-number">Table {table.tableNumber}</div>
                  <div className="table-info">
                    <span className="order-count">{table.unpaidCount} unpaid order(s)</span>
                    <span className="total-amount">₹{table.totalAmount}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Orders Section */}
        {selectedTable && (
          <div className="orders-section">
            <h2>Table {selectedTable} - Unpaid Orders</h2>
            
            {loading ? (
              <div className="loading">Loading orders...</div>
            ) : unpaidOrders.length === 0 ? (
              <div className="no-orders">
                <p>No unpaid orders found for this table.</p>
                <button onClick={() => setSelectedTable(null)}>Back to Tables</button>
              </div>
            ) : (
              <>
                <div className="orders-list">
                  {unpaidOrders.map(order => (
                    <div key={order._id} className="order-card">
                      <div className="order-header">
                        <span className="order-number">Order #{order.orderNumber}</span>
                        <span className="order-time">
                          {new Date(order.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="order-customer">
                        {order.customerName} • {order.mobileNumber}
                      </div>
                      <div className="order-items">
                        {order.items.map((item, index) => (
                          <div key={index} className="order-item">
                            <span className="item-name">{item.name}</span>
                            <span className="item-quantity">×{item.quantity}</span>
                            <span className="item-price">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      <div className="order-total">
                        Total: ₹{order.totalAmount}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Merge and Bill Actions */}
                <div className="bill-actions">
                  {!mergedBill ? (
                    <button 
                      onClick={mergeAndCalculateBill}
                      className="merge-btn"
                    >
                      📊 Merge & Calculate Total Bill
                    </button>
                  ) : (
                    <div className="merged-bill">
                      <div className="bill-summary">
                        <h3>Merged Bill Summary</h3>
                        <div className="bill-details">
                          <div className="bill-row">
                            <span>Orders Merged:</span>
                            <span>{mergedBill.orderCount}</span>
                          </div>
                          <div className="bill-row">
                            <span>Subtotal:</span>
                            <span>₹{mergedBill.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="bill-row">
                            <span>Tax (5%):</span>
                            <span>₹{mergedBill.tax.toFixed(2)}</span>
                          </div>
                          <div className="bill-row grand-total">
                            <span>Grand Total:</span>
                            <span>₹{mergedBill.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bill-buttons">
                        <button 
                          onClick={printBill}
                          className="print-btn"
                        >
                          🖨️ Print Bill
                        </button>
                        <button 
                          onClick={markAsPaid}
                          disabled={loading}
                          className="pay-btn"
                        >
                          {loading ? 'Processing...' : '✅ Mark as Paid'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingManagement;