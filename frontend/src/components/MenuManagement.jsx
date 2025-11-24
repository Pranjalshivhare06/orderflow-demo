
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import './MenuManagement.css'

const API_BASE_URL = 'https://orderflow-backend-v964.onrender.com/api'

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [categories] = useState([
    'Starters',
    'Main Course',
    'Biryani',
    'Chinese',
    'Italian',
    'Desserts',
    'Beverages',
    'Specials'
  ])

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    isVeg: true,
    isAvailable: true,
    image: '',
    preparationTime: 15
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const fetchMenuItems = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/menu`)
      if (response.data.success) {
        setMenuItems(response.data.data || [])
      } else {
        alert('Failed to load menu items')
      }
    } catch (error) {
      console.error('❌ Error fetching menu items:', error)
      alert('Error loading menu items. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required'
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        preparationTime: parseInt(formData.preparationTime) || 15
      }

      if (editingItem) {
        // Update existing item
        const response = await axios.put(`${API_BASE_URL}/menu/${editingItem._id}`, submitData)
        if (response.data.success) {
          setMenuItems(prev => prev.map(item => 
            item._id === editingItem._id ? response.data.data : item
          ))
          alert('Menu item updated successfully!')
        }
      } else {
        // Create new item
        const response = await axios.post(`${API_BASE_URL}/menu`, submitData)
        if (response.data.success) {
          setMenuItems(prev => [response.data.data, ...prev])
          alert('Menu item added successfully!')
        }
      }

      resetForm()
      setShowAddModal(false)
    } catch (error) {
      console.error('❌ Error saving menu item:', error)
      const errorMessage = error.response?.data?.message || 'Error saving menu item. Please try again.'
      alert(errorMessage)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      isVeg: true,
      isAvailable: true,
      image: '',
      preparationTime: 15
    })
    setEditingItem(null)
    setErrors({})
  }

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category: item.category,
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      image: item.image || '',
      preparationTime: item.preparationTime || 15
    })
    setEditingItem(item)
    setShowAddModal(true)
  }

  const handleDelete = async (itemId, itemName) => {
    if (!confirm(`Are you sure you want to delete "${itemName}"?`)) {
      return
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/menu/${itemId}`)
      if (response.data.success) {
        setMenuItems(prev => prev.filter(item => item._id !== itemId))
        alert('Menu item deleted successfully!')
      }
    } catch (error) {
      console.error('❌ Error deleting menu item:', error)
      alert('Error deleting menu item. Please try again.')
    }
  }

  const toggleAvailability = async (item) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/menu/${item._id}/availability`)
      if (response.data.success) {
        setMenuItems(prev => prev.map(menuItem => 
          menuItem._id === item._id ? response.data.data : menuItem
        ))
      }
    } catch (error) {
      console.error('❌ Error toggling availability:', error)
      alert('Error updating availability. Please try again.')
    }
  }

  const getItemsByCategory = () => {
    const categorized = {}
    categories.forEach(category => {
      categorized[category] = menuItems.filter(item => item.category === category)
    })
    return categorized
  }

  const categorizedItems = getItemsByCategory()

  return (
    <div className="menu-management">
      <header className="management-header">
        <div className="header-content">
          <Link to="/reception" className="back-button">
            ← Back to Dashboard
          </Link>
          <h1>Menu Management</h1>
        </div>
      </header>

      <div className="management-content">
        {/* Stats and Actions */}
        <div className="stats-actions-section">
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon">🍽️</div>
              <div className="stat-info">
                <h3>Total Items</h3>
                <p className="stat-number">{menuItems.length}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>Available</h3>
                <p className="stat-number">
                  {menuItems.filter(item => item.isAvailable).length}
                </p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🌱</div>
              <div className="stat-info">
                <h3>Veg Items</h3>
                <p className="stat-number">
                  {menuItems.filter(item => item.isVeg).length}
                </p>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <button 
              onClick={() => {
                resetForm()
                setShowAddModal(true)
              }}
              className="btn-primary"
            >
              + Add New Item
            </button>
            <button onClick={fetchMenuItems} className="btn-secondary" disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh Menu'}
            </button>
          </div>
        </div>

        {/* Menu Items by Category */}
        <div className="menu-categories">
          {categories.map(category => (
            <div key={category} className="category-section">
              <h2 className="category-title">
                {category} 
                <span className="item-count">
                  ({categorizedItems[category]?.length || 0} items)
                </span>
              </h2>
              
              {categorizedItems[category]?.length > 0 ? (
                <div className="menu-items-grid">
                  {categorizedItems[category].map(item => (
                    <div key={item._id} className={`menu-item-card ${!item.isAvailable ? 'disabled' : ''}`}>
                      <div className="item-header">
                        <div className="item-title">
                          <h3>{item.name}</h3>
                          <div className="item-badges">
                            {item.isVeg ? (
                              <span className="badge veg">🌱 Veg</span>
                            ) : (
                              <span className="badge non-veg">🍗 Non-Veg</span>
                            )}
                            {!item.isAvailable && (
                              <span className="badge unavailable">🚫 Unavailable</span>
                            )}
                          </div>
                        </div>
                        <div className="item-price">₹{item.price}</div>
                      </div>
                      
                      {item.description && (
                        <p className="item-description">{item.description}</p>
                      )}
                      
                      <div className="item-meta">
                        <span className="prep-time">⏱️ {item.preparationTime} min</span>
                        <span className="category-tag">{item.category}</span>
                      </div>

                      <div className="item-actions">
                        <button 
                          onClick={() => toggleAvailability(item)}
                          className={`btn-sm ${item.isAvailable ? 'btn-warning' : 'btn-success'}`}
                        >
                          {item.isAvailable ? 'Disable' : 'Enable'}
                        </button>
                        <button 
                          onClick={() => handleEdit(item)}
                          className="btn-sm btn-primary"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(item._id, item.name)}
                          className="btn-sm btn-danger"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-items">
                  <p>No items in this category</p>
                  <button 
                    onClick={() => {
                      setFormData(prev => ({ ...prev, category }))
                      setShowAddModal(true)
                    }}
                    className="btn-primary btn-sm"
                  >
                    Add Item to {category}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
                <button 
                  onClick={() => {
                    setShowAddModal(false)
                    resetForm()
                  }}
                  className="close-btn"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="name">Item Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter item name"
                      className={errors.name ? 'error' : ''}
                    />
                    {errors.name && <span className="error-text">{errors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="price">Price (₹) *</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className={errors.price ? 'error' : ''}
                    />
                    {errors.price && <span className="error-text">{errors.price}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="category">Category *</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={errors.category ? 'error' : ''}
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {errors.category && <span className="error-text">{errors.category}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="preparationTime">Preparation Time (minutes)</label>
                    <input
                      type="number"
                      id="preparationTime"
                      name="preparationTime"
                      value={formData.preparationTime}
                      onChange={handleInputChange}
                      placeholder="15"
                      min="1"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter item description"
                      rows="3"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="image">Image URL</label>
                    <input
                      type="url"
                      id="image"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="isVeg"
                        checked={formData.isVeg}
                        onChange={handleInputChange}
                      />
                      <span className="checkmark"></span>
                      Vegetarian Item
                    </label>
                  </div>

                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="isAvailable"
                        checked={formData.isAvailable}
                        onChange={handleInputChange}
                      />
                      <span className="checkmark"></span>
                      Available for Order
                    </label>
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => {
                    setShowAddModal(false)
                    resetForm()
                  }} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MenuManagement


// import React, { useState, useEffect } from 'react';
// import menuItems from '../data/menuItems';
// import axios from 'axios';
// import './MenuManagement.css';

// const API_BASE_URL = 'http://localhost:5000/api';

// const MenuManagement = () => {
//   const [items, setItems] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState('All');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   // Fetch availability from backend on component mount
//   useEffect(() => {
//     fetchMenuAvailability();
//   }, []);

//   const fetchMenuAvailability = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${API_BASE_URL}/menu-availability`);
      
//       if (response.data.success) {
//         const availabilityData = response.data.data;
        
//         // Merge hardcoded menu items with backend availability data
//         const mergedItems = menuItems.map(item => ({
//           ...item,
//           isAvailable: availabilityData[item.id] !== undefined ? availabilityData[item.id] : item.isAvailable
//         }));
        
//         setItems(mergedItems);
//       }
//     } catch (error) {
//       console.error('Error fetching menu availability:', error);
//       setError('Failed to load menu availability data');
//       // Fallback: use local menu items as is
//       setItems(menuItems);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Toggle availability with backend API call
//   const toggleAvailability = async (id) => {
//     try {
//       const item = items.find(item => item.id === id);
//       const newStatus = !item.isAvailable;

//       // Optimistically update UI
//       setItems(prevItems => 
//         prevItems.map(item => 
//           item.id === id ? { ...item, isAvailable: newStatus } : item
//         )
//       );

//       // Send update to backend
//       const response = await axios.post(`${API_BASE_URL}/menu-availability/${id}`, {
//         isAvailable: newStatus
//       });

//       if (!response.data.success) {
//         throw new Error('Backend update failed');
//       }

//       console.log(`✅ Item ${id} ${newStatus ? 'enabled' : 'disabled'}`);

//     } catch (error) {
//       console.error('Error updating availability:', error);
      
//       // Revert optimistic update on error
//       setItems(prevItems => 
//         prevItems.map(item => 
//           item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
//         )
//       );
      
//       alert('Failed to update menu item availability. Please try again.');
//     }
//   };

//   // Get unique categories
//   const categories = ['All', ...new Set(menuItems.map(item => item.category))];

//   // Filter items based on category and search
//   const filteredItems = items.filter(item => {
//     const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
//     const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
//     return matchesCategory && matchesSearch;
//   });

//   if (loading) {
//     return (
//       <div className="menu-management">
//         <div className="loading">Loading menu items...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="menu-management">
//       <header className="menu-header">
//         <h1>🍽️ Menu Management</h1>
//         <p>Manage your restaurant menu items</p>
//         {error && <div className="error-message">{error}</div>}
        
//         {/* Refresh button */}
//         <button 
//           onClick={fetchMenuAvailability}
//           className="refresh-btn"
//           style={{
//             marginTop: '10px',
//             padding: '8px 16px',
//             backgroundColor: '#007bff',
//             color: 'white',
//             border: 'none',
//             borderRadius: '5px',
//             cursor: 'pointer'
//           }}
//         >
//           🔄 Refresh Availability
//         </button>
//       </header>

//       {/* Filters and Search */}
//       <div className="menu-filters">
//         <div className="search-box">
//           <input
//             type="text"
//             placeholder="Search menu items..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="search-input"
//           />
//         </div>
//         <div className="category-filters">
//           {categories.map(category => (
//             <button
//               key={category}
//               className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
//               onClick={() => setSelectedCategory(category)}
//             >
//               {category}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Stats Summary */}
//       <div className="menu-stats">
//         <div className="stat-item">
//           <span className="stat-label">Total Items:</span>
//           <span className="stat-value">{items.length}</span>
//         </div>
//         <div className="stat-item">
//           <span className="stat-label">Available:</span>
//           <span className="stat-value available-count">
//             {items.filter(item => item.isAvailable).length}
//           </span>
//         </div>
//         <div className="stat-item">
//           <span className="stat-label">Unavailable:</span>
//           <span className="stat-value unavailable-count">
//             {items.filter(item => !item.isAvailable).length}
//           </span>
//         </div>
//       </div>

//       {/* Menu Items Grid */}
//       <div className="menu-grid">
//         {filteredItems.map(item => (
//           <div key={item.id} className={`menu-card ${!item.isAvailable ? 'unavailable' : ''}`}>
//             <div className="menu-card-image">
//               <img 
//                 src={item.image} 
//                 alt={item.name}
//                 onError={(e) => {
//                   e.target.src = '/menu-images/placeholder.jpg';
//                 }}
//               />
//               {!item.isAvailable && <div className="unavailable-overlay">Unavailable</div>}
//             </div>
            
//             <div className="menu-card-content">
//               <div className="menu-card-header">
//                 <h3>{item.name}</h3>
//                 <span className="price">₹{item.price}</span>
//               </div>
              
//               <p className="category">{item.category}</p>
//               <p className="description">{item.description}</p>
              
//               <div className="item-details">
//                 <div className="detail-item">
//                   <span>⏱️ {item.preparationTime} mins</span>
//                 </div>
//                 <div className="detail-item">
//                   <span>{item.isVegetarian ? '🥬 Veg' : '🍗 Non-Veg'}</span>
//                 </div>
//                 <div className="detail-item">
//                   <span className={`status-indicator ${item.isAvailable ? 'available' : 'unavailable'}`}>
//                     {item.isAvailable ? '✅ Available' : '❌ Unavailable'}
//                   </span>
//                 </div>
//               </div>

//               <div className="ingredients">
//                 <strong>Ingredients:</strong>
//                 <div className="ingredients-list">
//                   {item.ingredients.map((ingredient, index) => (
//                     <span key={index} className="ingredient-tag">{ingredient}</span>
//                   ))}
//                 </div>
//               </div>

//               <div className="menu-actions">
//                 <button 
//                   className={`availability-btn ${item.isAvailable ? 'available' : 'unavailable'}`}
//                   onClick={() => toggleAvailability(item.id)}
//                 >
//                   {item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {filteredItems.length === 0 && (
//         <div className="no-items">
//           <p>No menu items found matching your criteria.</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MenuManagement;





// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import axios from 'axios';
// import menuItems from '../data/menuItems'; // Import your JSON data
// import './MenuManagement.css';

// const API_BASE_URL = 'https://orderflow-backend-v964.onrender.com/api';
// // const API_BASE_URL = 'http://localhost:5000/api';
// const MenuManagement = () => {
//   const [menu, setMenu] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [editingItem, setEditingItem] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [categoryFilter, setCategoryFilter] = useState('all');
//   const [availabilityFilter, setAvailabilityFilter] = useState('all');

//   // Form state
//   const [formData, setFormData] = useState({
//     name: '',
//     price: 0,
//     description: '',
//     category: '',
//     image: '',
//     isVegetarian: true,
//     isAvailable: true,
//     preparationTime: 15,
//     ingredients: []
//   });

//   const categories = [
//     'Coffee',
//     'Tea',
//     'Sandwiches',
//     'Salads',
//     'Pastries',
//     'Breakfast',
//     'Lunch',
//     'Dinner',
//     'Desserts',
//     'Beverages'
//   ];

//   useEffect(() => {
//     fetchMenu();
//   }, []);

//   // Fetch menu from MongoDB
//   const fetchMenu = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${API_BASE_URL}/menu`);
//       setMenu(response.data);
//     } catch (error) {
//       console.error('Error fetching menu:', error);
//       // If API fails, use local JSON data
//       setMenu(menuItems);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Sync JSON data to MongoDB
//   const syncToDatabase = async () => {
//     try {
//       setLoading(true);
//       let successCount = 0;
//       let errorCount = 0;

//       for (const item of menuItems) {
//         try {
//           // Check if item already exists
//           const existingItem = menu.find(menuItem => 
//             menuItem.name.toLowerCase() === item.name.toLowerCase()
//           );

//           if (existingItem) {
//             // Update existing item
//             await axios.put(`${API_BASE_URL}/menu/${existingItem._id}`, item);
//           } else {
//             // Create new item
//             await axios.post(`${API_BASE_URL}/menu`, item);
//           }
//           successCount++;
//         } catch (error) {
//           console.error(`Error syncing item ${item.name}:`, error);
//           errorCount++;
//         }
//       }

//       alert(`Sync completed! ${successCount} items synced, ${errorCount} errors.`);
//       fetchMenu(); // Refresh the menu
//     } catch (error) {
//       console.error('Error syncing menu:', error);
//       alert('Error syncing menu to database.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : 
//               type === 'number' ? parseFloat(value) || 0 : value
//     }));
//   };

//   const handleArrayInput = (e) => {
//     const { value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       ingredients: value.split(',').map(item => item.trim()).filter(item => item)
//     }));
//   };

//   const validateForm = () => {
//     if (!formData.name.trim()) {
//       alert('Please enter item name');
//       return false;
//     }
//     if (formData.price <= 0) {
//       alert('Please enter a valid price');
//       return false;
//     }
//     if (!formData.category) {
//       alert('Please select a category');
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     try {
//       setLoading(true);
      
//       if (editingItem) {
//         // Update existing item
//         await axios.put(`${API_BASE_URL}/menu/${editingItem._id}`, formData);
//         alert('Menu item updated successfully!');
//       } else {
//         // Add new item
//         await axios.post(`${API_BASE_URL}/menu`, formData);
//         alert('Menu item added successfully!');
//       }
      
//       resetForm();
//       fetchMenu();
//     } catch (error) {
//       console.error('Error saving menu item:', error);
//       alert('Error saving menu item. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       name: '',
//       price: 0,
//       description: '',
//       category: '',
//       image: '',
//       isVegetarian: true,
//       isAvailable: true,
//       preparationTime: 15,
//       ingredients: []
//     });
//     setEditingItem(null);
//     setShowAddForm(false);
//   };

//   const handleEdit = (item) => {
//     setFormData({
//       name: item.name,
//       price: item.price,
//       description: item.description || '',
//       category: item.category,
//       image: item.image || '',
//       isVegetarian: item.isVegetarian !== undefined ? item.isVegetarian : true,
//       isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
//       preparationTime: item.preparationTime || 15,
//       ingredients: item.ingredients || []
//     });
//     setEditingItem(item);
//     setShowAddForm(true);
//   };

//   const handleDelete = async (itemId, itemName) => {
//     if (!window.confirm(`Are you sure you want to delete "${itemName}"?`)) {
//       return;
//     }

//     try {
//       setLoading(true);
//       await axios.delete(`${API_BASE_URL}/menu/${itemId}`);
//       alert('Menu item deleted successfully!');
//       fetchMenu();
//     } catch (error) {
//       console.error('Error deleting menu item:', error);
//       alert('Error deleting menu item. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleAvailability = async (itemId, currentStatus, itemName) => {
//     try {
//       setLoading(true);
//       await axios.patch(`${API_BASE_URL}/menu/${itemId}`, {
//         isAvailable: !currentStatus
//       });
//       alert(`"${itemName}" is now ${!currentStatus ? 'available' : 'unavailable'}`);
//       fetchMenu();
//     } catch (error) {
//       console.error('Error updating availability:', error);
//       alert('Error updating availability. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Filter menu based on search and filters
//   const filteredMenu = menu.filter(item => {
//     const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
//     const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
//     const matchesAvailability = 
//       availabilityFilter === 'all' ? true :
//       availabilityFilter === 'available' ? item.isAvailable :
//       !item.isAvailable;
    
//     return matchesSearch && matchesCategory && matchesAvailability;
//   });

//   // Calculate menu statistics
//   const menuStats = {
//     totalItems: menu.length,
//     availableItems: menu.filter(item => item.isAvailable).length,
//     unavailableItems: menu.filter(item => !item.isAvailable).length,
//     vegetarianItems: menu.filter(item => item.isVegetarian).length,
//     nonVegetarianItems: menu.filter(item => !item.isVegetarian).length
//   };

//   return (
//     <div className="menu-management">
//       <header className="management-header">
//         <div className="header-content">
//           <Link to="/reception" className="back-button">
//             ← Back to Dashboard
//           </Link>
//           <h1>Menu Management</h1>
//         </div>
//       </header>

//       <div className="management-content">
//         {/* Menu Statistics */}
//         <div className="menu-stats">
//           <div className="stat-card">
//             <h3>Total Items</h3>
//             <p className="stat-number">{menuStats.totalItems}</p>
//           </div>
//           <div className="stat-card available">
//             <h3>Available</h3>
//             <p className="stat-number">{menuStats.availableItems}</p>
//           </div>
//           <div className="stat-card unavailable">
//             <h3>Unavailable</h3>
//             <p className="stat-number">{menuStats.unavailableItems}</p>
//           </div>
//           <div className="stat-card veg">
//             <h3>Vegetarian</h3>
//             <p className="stat-number">{menuStats.vegetarianItems}</p>
//           </div>
//           <div className="stat-card non-veg">
//             <h3>Non-Veg</h3>
//             <p className="stat-number">{menuStats.nonVegetarianItems}</p>
//           </div>
//         </div>

//         {/* Sync and Control Buttons */}
//         <div className="menu-controls">
//           <div className="control-buttons">
//             <button 
//               onClick={syncToDatabase}
//               className="btn-sync"
//               disabled={loading}
//             >
//               {loading ? 'Syncing...' : '🔄 Sync JSON to Database'}
//             </button>
//             <button 
//               onClick={() => setShowAddForm(true)}
//               className="btn-primary"
//             >
//               + Add New Item
//             </button>
//           </div>

//           <div className="search-filters">
//             <div className="search-bar">
//               <input
//                 type="text"
//                 placeholder="Search items by name, description, or category..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="search-input"
//               />
//             </div>
            
//             <div className="filters">
//               <select 
//                 value={categoryFilter} 
//                 onChange={(e) => setCategoryFilter(e.target.value)}
//                 className="filter-select"
//               >
//                 <option value="all">All Categories</option>
//                 {categories.map(category => (
//                   <option key={category} value={category}>{category}</option>
//                 ))}
//               </select>

//               <select 
//                 value={availabilityFilter} 
//                 onChange={(e) => setAvailabilityFilter(e.target.value)}
//                 className="filter-select"
//               >
//                 <option value="all">All Items</option>
//                 <option value="available">Available Only</option>
//                 <option value="unavailable">Unavailable Only</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Add/Edit Form */}
//         {showAddForm && (
//           <div className="form-modal">
//             <div className="form-content">
//               <div className="form-header">
//                 <h2>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
//                 <button onClick={resetForm} className="close-btn">&times;</button>
//               </div>
              
//               <form onSubmit={handleSubmit} className="menu-form">
//                 <div className="form-row">
//                   <div className="form-group">
//                     <label>Item Name *</label>
//                     <input
//                       type="text"
//                       name="name"
//                       value={formData.name}
//                       onChange={handleInputChange}
//                       required
//                     />
//                   </div>
                  
//                   <div className="form-group">
//                     <label>Price *</label>
//                     <input
//                       type="number"
//                       name="price"
//                       value={formData.price}
//                       onChange={handleInputChange}
//                       min="0"
//                       step="0.01"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div className="form-row">
//                   <div className="form-group">
//                     <label>Category *</label>
//                     <select
//                       name="category"
//                       value={formData.category}
//                       onChange={handleInputChange}
//                       required
//                     >
//                       <option value="">Select Category</option>
//                       {categories.map(cat => (
//                         <option key={cat} value={cat}>{cat}</option>
//                       ))}
//                     </select>
//                   </div>
                  
//                   <div className="form-group">
//                     <label>Preparation Time (minutes)</label>
//                     <input
//                       type="number"
//                       name="preparationTime"
//                       value={formData.preparationTime}
//                       onChange={handleInputChange}
//                       min="1"
//                       max="120"
//                     />
//                   </div>
//                 </div>

//                 <div className="form-group">
//                   <label>Description</label>
//                   <textarea
//                     name="description"
//                     value={formData.description}
//                     onChange={handleInputChange}
//                     rows="3"
//                     placeholder="Enter item description..."
//                   />
//                 </div>

//                 <div className="form-group">
//                   <label>Image URL</label>
//                   <input
//                     type="url"
//                     name="image"
//                     value={formData.image}
//                     onChange={handleInputChange}
//                     placeholder="https://example.com/image.jpg"
//                   />
//                 </div>

//                 <div className="form-group">
//                   <label>Ingredients (comma separated)</label>
//                   <input
//                     type="text"
//                     name="ingredients"
//                     value={formData.ingredients.join(', ')}
//                     onChange={handleArrayInput}
//                     placeholder="ingredient1, ingredient2, ingredient3"
//                   />
//                 </div>

//                 <div className="form-row">
//                   <label className="checkbox-label">
//                     <input
//                       type="checkbox"
//                       name="isVegetarian"
//                       checked={formData.isVegetarian}
//                       onChange={handleInputChange}
//                     />
//                     Vegetarian Item
//                   </label>

//                   <label className="checkbox-label">
//                     <input
//                       type="checkbox"
//                       name="isAvailable"
//                       checked={formData.isAvailable}
//                       onChange={handleInputChange}
//                     />
//                     Available for Ordering
//                   </label>
//                 </div>

//                 <div className="form-actions">
//                   <button type="button" onClick={resetForm} className="btn-secondary">
//                     Cancel
//                   </button>
//                   <button type="submit" disabled={loading} className="btn-primary">
//                     {loading ? 'Saving...' : (editingItem ? 'Update Item' : 'Add Item')}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}

//         {/* Menu Items Table */}
//         <div className="menu-table-container">
//           {loading ? (
//             <div className="loading-message">Loading menu...</div>
//           ) : (
//             <>
//               {filteredMenu.length === 0 ? (
//                 <div className="no-items">
//                   <p>No menu items found</p>
//                   <small>
//                     {searchTerm || categoryFilter !== 'all' || availabilityFilter !== 'all' 
//                       ? 'Try changing your search or filters' 
//                       : 'Add your first menu item or sync from JSON data'
//                     }
//                   </small>
//                 </div>
//               ) : (
//                 <table className="menu-table">
//                   <thead>
//                     <tr>
//                       <th>Item Name</th>
//                       <th>Category</th>
//                       <th>Price</th>
//                       <th>Veg/Non-Veg</th>
//                       <th>Prep Time</th>
//                       <th>Status</th>
//                       <th>Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredMenu.map(item => (
//                       <tr key={item._id} className={!item.isAvailable ? 'unavailable-row' : ''}>
//                         <td className="item-name">
//                           <div className="item-name-content">
//                             {item.image && (
//                               <img src={item.image} alt={item.name} className="item-thumbnail" />
//                             )}
//                             <div>
//                               <strong>{item.name}</strong>
//                               {item.description && (
//                                 <small className="item-description">{item.description}</small>
//                               )}
//                             </div>
//                           </div>
//                         </td>
//                         <td>{item.category}</td>
//                         <td>₹{item.price}</td>
//                         <td>
//                           <span className={`veg-indicator ${item.isVegetarian ? 'veg' : 'non-veg'}`}>
//                             {item.isVegetarian ? '🟢 Veg' : '🔴 Non-Veg'}
//                           </span>
//                         </td>
//                         <td>{item.preparationTime} min</td>
//                         <td>
//                           <span className={`availability-status ${item.isAvailable ? 'available' : 'unavailable'}`}>
//                             {item.isAvailable ? 'Available' : 'Unavailable'}
//                           </span>
//                         </td>
//                         <td>
//                           <div className="action-buttons">
//                             <button 
//                               onClick={() => toggleAvailability(item._id, item.isAvailable, item.name)}
//                               className={`btn-availability ${item.isAvailable ? 'make-unavailable' : 'make-available'}`}
//                               title={item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
//                             >
//                               {item.isAvailable ? '❌' : '✅'}
//                             </button>
//                             <button 
//                               onClick={() => handleEdit(item)}
//                               className="btn-edit"
//                               title="Edit"
//                             >
//                               ✏️
//                             </button>
//                             <button 
//                               onClick={() => handleDelete(item._id, item.name)}
//                               className="btn-delete"
//                               title="Delete"
//                             >
//                               🗑️
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MenuManagement;