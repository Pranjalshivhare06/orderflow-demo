


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Analysis.css';

const API_BASE_URL = 'https://orderflow-backend-v964.onrender.com/api';

const Analysis = () => {
  const [analytics, setAnalytics] = useState({
    todayOrders: 0,
    monthlyOrders: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
    dailyRevenue: [],
    popularItems: [],
    hourlyOrders: [],
    categoryRevenue: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allOrders, setAllOrders] = useState([]);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    fetchAllOrders();
  }, []);

  // First, fetch all orders and calculate everything from them
  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('📊 Fetching all orders for analytics...');
      
      const response = await axios.get(`${API_BASE_URL}/orders`);
      console.log('✅ Orders fetched:', response.data);
      
      let ordersData = [];
      
      // Handle different response formats
      if (Array.isArray(response.data)) {
        ordersData = response.data;
      } else if (response.data.orders && Array.isArray(response.data.orders)) {
        ordersData = response.data.orders;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        ordersData = response.data.data;
      } else {
        // Try to find any array in the response
        const possibleArrays = Object.values(response.data).filter(val => Array.isArray(val));
        if (possibleArrays.length > 0) {
          ordersData = possibleArrays[0];
        }
      }
      
      setAllOrders(ordersData);
      setDebugInfo(`Loaded ${ordersData.length} orders for analysis`);
      console.log(`📈 Processing ${ordersData.length} orders for analytics`);
      
      // Calculate all analytics from the orders data
      calculateAllAnalytics(ordersData);
      
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      setError('Failed to load orders data for analytics');
      setLoading(false);
    }
  };

  const calculateAllAnalytics = (orders) => {
    try {
      console.log('🧮 Calculating analytics from orders...');
      
      if (!orders || orders.length === 0) {
        console.warn('⚠️ No orders found for analytics');
        setAnalytics({
          todayOrders: 0,
          monthlyOrders: 0,
          todayRevenue: 0,
          monthlyRevenue: 0,
          dailyRevenue: [],
          popularItems: [],
          hourlyOrders: [],
          categoryRevenue: []
        });
        setLoading(false);
        return;
      }

      // Debug: Show sample order structure
      if (orders.length > 0) {
        console.log('📝 Sample order structure:', {
          orderNumber: orders[0].orderNumber,
          status: orders[0].status,
          totalAmount: orders[0].totalAmount,
          finalTotal: orders[0].finalTotal,
          createdAt: orders[0].createdAt,
          items: orders[0].items
        });
      }

      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      console.log('📅 Date ranges:', {
        today: today.toDateString(),
        todayStart: todayStart.toDateString(),
        monthStart: monthStart.toDateString()
      });

      // Filter today's orders
      const todayOrders = orders.filter(order => {
        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        return orderDate >= todayStart && order.status !== 'cancelled';
      });

      // Filter this month's orders
      const monthlyOrders = orders.filter(order => {
        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        return orderDate >= monthStart && order.status !== 'cancelled';
      });

      console.log('📊 Order counts:', {
        total: orders.length,
        today: todayOrders.length,
        monthly: monthlyOrders.length
      });

      // Calculate revenues
      const todayRevenue = todayOrders.reduce((sum, order) => {
        const amount = order.finalTotal || order.totalAmount || 0;
        return sum + amount;
      }, 0);

      const monthlyRevenue = monthlyOrders.reduce((sum, order) => {
        const amount = order.finalTotal || order.totalAmount || 0;
        return sum + amount;
      }, 0);

      console.log('💰 Revenue calculations:', {
        todayRevenue,
        monthlyRevenue
      });

      // Calculate daily revenue for last 7 days
      const dailyRevenue = calculateLast7DaysRevenue(orders);
      
      // Calculate popular items
      const popularItems = calculatePopularItems(orders);
      
      // Calculate hourly distribution
      const hourlyOrders = calculateHourlyOrders(orders);

      setAnalytics({
        todayOrders: todayOrders.length,
        monthlyOrders: monthlyOrders.length,
        todayRevenue,
        monthlyRevenue,
        dailyRevenue,
        popularItems,
        hourlyOrders,
        categoryRevenue: []
      });

      console.log('✅ Analytics calculated successfully');
      
    } catch (error) {
      console.error('❌ Error calculating analytics:', error);
      setError('Error calculating analytics data');
    } finally {
      setLoading(false);
    }
  };

  const calculateLast7DaysRevenue = (orders) => {
    const result = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dateEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
      
      const dayOrders = orders.filter(order => {
        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        return orderDate >= dateStart && orderDate < dateEnd && order.status !== 'cancelled';
      });
      
      const revenue = dayOrders.reduce((sum, order) => {
        return sum + (order.finalTotal || order.totalAmount || 0);
      }, 0);
      
      result.push({
        date: date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
        revenue,
        orders: dayOrders.length
      });
    }
    
    console.log('📅 Daily revenue:', result);
    return result;
  };

  const calculatePopularItems = (orders) => {
    const itemCount = {};
    
    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const itemName = item.name || item.menuItem?.name || 'Unknown Item';
          const quantity = item.quantity || 1;
          itemCount[itemName] = (itemCount[itemName] || 0) + quantity;
        });
      }
    });
    
    const popular = Object.entries(itemCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
    
    console.log('🏆 Popular items:', popular);
    return popular;
  };

  const calculateHourlyOrders = (orders) => {
    const hourlyCount = Array(24).fill(0);
    
    orders.forEach(order => {
      if (order.createdAt && order.status !== 'cancelled') {
        const hour = new Date(order.createdAt).getHours();
        hourlyCount[hour]++;
      }
    });
    
    const result = hourlyCount.map((count, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      orders: count
    }));
    
    console.log('🕒 Hourly orders:', result);
    return result;
  };

  // Calculate max values for chart scaling
  const maxDailyRevenue = Math.max(...analytics.dailyRevenue.map(d => d.revenue), 1);
  const maxHourlyOrders = Math.max(...analytics.hourlyOrders.map(h => h.orders), 1);

  if (loading) {
    return (
      <div className="analysis-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          Loading analytics data...
          {debugInfo && <div className="debug-info">{debugInfo}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="analysis-container">
      <header className="analysis-header">
        <div className="header-top">
          <h1>📊 Business Analytics</h1>
          <div className="header-actions">
            <Link to="/reception" className="btn-primary">← Back to Dashboard</Link>
            <button onClick={fetchAllOrders} className="refresh-btn">
              🔄 Refresh
            </button>
          </div>
        </div>
        
        {debugInfo && (
          <div className="debug-info">
            {debugInfo} • {allOrders.length} total orders
          </div>
        )}
      </header>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">📦</div>
          <div className="metric-info">
            <h3>Today's Orders</h3>
            <p className="metric-number">{analytics.todayOrders}</p>
            <span className="metric-label">Total orders today</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📈</div>
          <div className="metric-info">
            <h3>Monthly Orders</h3>
            <p className="metric-number">{analytics.monthlyOrders}</p>
            <span className="metric-label">Orders this month</span>
          </div>
        </div>

        <div className="metric-card revenue">
          <div className="metric-icon">💰</div>
          <div className="metric-info">
            <h3>Today's Revenue</h3>
            <p className="metric-number">₹{analytics.todayRevenue.toFixed(2)}</p>
            <span className="metric-label">Revenue generated today</span>
          </div>
        </div>

        <div className="metric-card revenue">
          <div className="metric-icon">💵</div>
          <div className="metric-info">
            <h3>Monthly Revenue</h3>
            <p className="metric-number">₹{analytics.monthlyRevenue.toFixed(2)}</p>
            <span className="metric-label">Revenue this month</span>
          </div>
        </div>
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="analytics-grid">
        {/* Daily Revenue Chart */}
        <div className="analytics-card">
          <h3>📅 Daily Revenue (Last 7 Days)</h3>
          {analytics.dailyRevenue.length > 0 ? (
            <div className="revenue-bars">
              {analytics.dailyRevenue.map((day, index) => (
                <div key={index} className="revenue-bar-container">
                  <div className="revenue-bar-label">{day.date}</div>
                  <div className="revenue-bar">
                    <div 
                      className="revenue-fill"
                      style={{ 
                        height: `${Math.max((day.revenue / maxDailyRevenue) * 100, 5)}%` 
                      }}
                    ></div>
                  </div>
                  <div className="revenue-amount">₹{day.revenue.toFixed(2)}</div>
                  <div className="revenue-orders">{day.orders} orders</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">No revenue data available</div>
          )}
        </div>

        {/* Popular Items */}
        <div className="analytics-card">
          <h3>🏆 Most Popular Items</h3>
          {analytics.popularItems.length > 0 ? (
            <div className="popular-items">
              {analytics.popularItems.map((item, index) => (
                <div key={index} className="popular-item">
                  <span className="item-rank">#{index + 1}</span>
                  <span className="item-name">{item.name}</span>
                  <span className="item-count">{item.count} sold</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">No popular items data</div>
          )}
        </div>

        {/* Hourly Distribution */}
        <div className="analytics-card">
          <h3>🕒 Order Distribution by Hour</h3>
          {analytics.hourlyOrders.some(hour => hour.orders > 0) ? (
            <div className="hourly-chart">
              {analytics.hourlyOrders.map((hourData, index) => (
                <div key={index} className="hour-bar-container">
                  <div className="hour-label">{hourData.hour}</div>
                  <div className="hour-bar">
                    <div 
                      className="hour-fill"
                      style={{ 
                        width: `${Math.max((hourData.orders / maxHourlyOrders) * 100, 5)}%` 
                      }}
                    ></div>
                  </div>
                  <div className="hour-count">{hourData.orders}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">No hourly data available</div>
          )}
        </div>

        {/* Additional Metrics */}
        <div className="analytics-card">
          <h3>📋 Performance Insights</h3>
          <div className="insights">
            <div className="insight-item">
              <span className="insight-label">Average Order Value:</span>
              <span className="insight-value">
                ₹{analytics.todayOrders > 0 ? (analytics.todayRevenue / analytics.todayOrders).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="insight-item">
              <span className="insight-label">Busiest Hour:</span>
              <span className="insight-value">
                {analytics.hourlyOrders.length > 0 ? 
                  analytics.hourlyOrders.reduce((max, hour, index, arr) => 
                    hour.orders > arr[max].orders ? index : max, 0
                  ).toString().padStart(2, '0') + ':00' 
                  : 'N/A'
                }
              </span>
            </div>
            <div className="insight-item">
              <span className="insight-label">Orders per Day (Avg):</span>
              <span className="insight-value">
                {analytics.monthlyOrders > 0 ? (analytics.monthlyOrders / new Date().getDate()).toFixed(1) : '0.0'}
              </span>
            </div>
            <div className="insight-item">
              <span className="insight-label">Total Orders Analyzed:</span>
              <span className="insight-value">{allOrders.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Information */}
      {/* <div className="debug-section">
        <details>
          <summary>Debug Information</summary>
          <pre>{JSON.stringify({
            totalOrders: allOrders.length,
            todayOrders: analytics.todayOrders,
            monthlyOrders: analytics.monthlyOrders,
            todayRevenue: analytics.todayRevenue,
            monthlyRevenue: analytics.monthlyRevenue,
            sampleOrder: allOrders[0] || 'No orders'
          }, null, 2)}</pre>
        </details>
      </div> */}
    </div>
  );
};

export default Analysis;