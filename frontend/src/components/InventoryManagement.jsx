import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './InventoryManagement.css';

// const API_BASE_URL = 'https://orderflow-backend-v964.onrender.com/api';
const API_BASE_URL = 'https://the-tea-cartel-1.onrender.com/api';
const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [lowStockFilter, setLowStockFilter] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: 0,
    unit: '',
    minStock: 0,
    price: 0,
    supplier: '',
    location: ''
  });

  const categories = [
    'Vegetables',
    'Fruits',
    'Dairy',
    'Meat',
    'Seafood',
    'Grains',
    'Spices',
    'Beverages',
    'Cleaning Supplies',
    'Paper Goods',
    'Other'
  ];

  const units = ['kg', 'g', 'lb', 'oz', 'L', 'ml', 'pieces', 'pack', 'bottle', 'can'];

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/inventory`);
      setInventory(response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      alert('Error loading inventory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      alert('Please enter item name');
      return false;
    }
    if (!formData.category) {
      alert('Please select a category');
      return false;
    }
    if (formData.quantity < 0) {
      alert('Quantity cannot be negative');
      return false;
    }
    if (formData.minStock < 0) {
      alert('Minimum stock cannot be negative');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      if (editingItem) {
        // Update existing item
        await axios.put(`${API_BASE_URL}/inventory/${editingItem._id}`, formData);
        alert('Item updated successfully!');
      } else {
        // Add new item
        await axios.post(`${API_BASE_URL}/inventory`, formData);
        alert('Item added successfully!');
      }
      
      resetForm();
      fetchInventory();
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Error saving item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      quantity: 0,
      unit: '',
      minStock: 0,
      price: 0,
      supplier: '',
      location: ''
    });
    setEditingItem(null);
    setShowAddForm(false);
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      minStock: item.minStock,
      price: item.price,
      supplier: item.supplier,
      location: item.location
    });
    setEditingItem(item);
    setShowAddForm(true);
  };

  const handleDelete = async (itemId, itemName) => {
    if (!window.confirm(`Are you sure you want to delete "${itemName}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/inventory/${itemId}`);
      alert('Item deleted successfully!');
      fetchInventory();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStockUpdate = async (itemId, newQuantity) => {
    if (newQuantity < 0) {
      alert('Quantity cannot be negative');
      return;
    }

    try {
      await axios.patch(`${API_BASE_URL}/inventory/${itemId}/stock`, {
        quantity: newQuantity
      });
      fetchInventory();
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Error updating stock. Please try again.');
    }
  };

  // Filter inventory based on search and filters
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesLowStock = !lowStockFilter || item.quantity <= item.minStock;
    
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  // Calculate inventory statistics
  const inventoryStats = {
    totalItems: inventory.length,
    lowStockItems: inventory.filter(item => item.quantity <= item.minStock).length,
    outOfStockItems: inventory.filter(item => item.quantity === 0).length,
    totalValue: inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  };

  return (
    <div className="inventory-management">
      <header className="management-header">
        <div className="header-content">
          <Link to="/reception" className="back-button">
            ← Back to Dashboard
          </Link>
          <h1>Inventory Management</h1>
        </div>
      </header>

      <div className="management-content">
        {/* Inventory Statistics */}
        <div className="inventory-stats">
          <div className="stat-card">
            <h3>Total Items</h3>
            <p className="stat-number">{inventoryStats.totalItems}</p>
          </div>
          <div className="stat-card low-stock">
            <h3>Low Stock</h3>
            <p className="stat-number">{inventoryStats.lowStockItems}</p>
          </div>
          <div className="stat-card out-of-stock">
            <h3>Out of Stock</h3>
            <p className="stat-number">{inventoryStats.outOfStockItems}</p>
          </div>
          {/* <div className="stat-card value">
            <h3>Total Value</h3>
            <p className="stat-number">${inventoryStats.totalValue.toFixed(2)}</p>
          </div> */}
        </div>

        {/* Search and Filters */}
        <div className="inventory-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search items by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filters">
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <label className="checkbox-filter">
              <input
                type="checkbox"
                checked={lowStockFilter}
                onChange={(e) => setLowStockFilter(e.target.checked)}
              />
              Show Low Stock Only
            </label>
          </div>

          <button 
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            + Add New Item
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="form-modal">
            <div className="form-content">
              <div className="form-header">
                <h2>{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
                <button onClick={resetForm} className="close-btn">&times;</button>
              </div>
              
              <form onSubmit={handleSubmit} className="inventory-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Item Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Current Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Unit</label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Unit</option>
                      {units.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Minimum Stock</label>
                    <input
                      type="number"
                      name="minStock"
                      value={formData.minStock}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Price per Unit (Rs)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Supplier</label>
                    <input
                      type="text"
                      name="supplier"
                      value={formData.supplier}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Storage Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Fridge A, Shelf 2"
                  />
                </div>

                <div className="form-actions">
                  <button type="button" onClick={resetForm} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? 'Saving...' : (editingItem ? 'Update Item' : 'Add Item')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Inventory Table */}
        <div className="inventory-table-container">
          {loading ? (
            <div className="loading-message">Loading inventory...</div>
          ) : (
            <>
              {filteredInventory.length === 0 ? (
                <div className="no-items">
                  <p>No inventory items found</p>
                  <small>
                    {searchTerm || categoryFilter !== 'all' || lowStockFilter 
                      ? 'Try changing your search or filters' 
                      : 'Add your first inventory item using the button above'
                    }
                  </small>
                </div>
              ) : (
                <table className="inventory-table">
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Category</th>
                      <th>Quantity</th>
                      <th>Unit</th>
                      <th>Min Stock</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Supplier</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map(item => (
                      <tr key={item._id} className={item.quantity <= item.minStock ? 'low-stock-row' : ''}>
                        <td className="item-name">{item.name}</td>
                        <td>{item.category}</td>
                        <td>
                          <div className="quantity-controls">
                            {/* <button 
                              onClick={() => handleStockUpdate(item._id, item.quantity - 1)}
                              disabled={item.quantity <= 0}
                              className="qty-btn"
                            >
                              -
                            </button> */}
                            <span className="quantity-display">{item.quantity}</span>
                            {/* <button 
                              onClick={() => handleStockUpdate(item._id, item.quantity + 1)}
                              className="qty-btn"
                            >
                              +
                            </button> */}
                          </div>
                        </td>
                        <td>{item.unit}</td>
                        <td>{item.minStock}</td>
                        <td>{item.price?.toFixed(2)}</td>
                        <td>
                          <span className={`stock-status ${
                            item.quantity === 0 ? 'out-of-stock' :
                            item.quantity <= item.minStock ? 'low-stock' : 'in-stock'
                          }`}>
                            {item.quantity === 0 ? 'Out of Stock' :
                             item.quantity <= item.minStock ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>
                        <td>{item.supplier || '-'}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              onClick={() => handleEdit(item)}
                              className="btn-edit"
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button 
                              onClick={() => handleDelete(item._id, item.name)}
                              className="btn-delete"
                              title="Delete"
                            >
                              ❌
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;