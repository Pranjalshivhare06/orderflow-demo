

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import './MenuManagement.css';

// const API_BASE_URL = 'https://orderflow-backend-v964.onrender.com/api';

// const MenuManagement = () => {
//   const [menuItems, setMenuItems] = useState([]);
//   const [newItem, setNewItem] = useState({
//     name: '',
//     description: '',
//     price: '',
//     category: '',
//     preparationTime: 15,
//     image: ''
//   });
//   const [loading, setLoading] = useState(false); // Only this loading state

//   useEffect(() => {
//     fetchMenuItems();
//   }, []);

//   const fetchMenuItems = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${API_BASE_URL}/menu`);
//       setMenuItems(response.data);
//     } catch (error) {
//       console.error('Error fetching menu:', error);
//       alert('Error loading menu items');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const addMenuItem = async (e) => {
//     e.preventDefault();
//     try {
//       setLoading(true);
//       await axios.post(`${API_BASE_URL}/menu`, {
//         ...newItem,
//         price: parseFloat(newItem.price),
//         preparationTime: parseInt(newItem.preparationTime)
//         // Image is already a URL string - no processing needed
//       });
      
//       // Reset form
//       setNewItem({ 
//         name: '', 
//         description: '', 
//         price: '', 
//         category: '', 
//         preparationTime: 15,
//         image: '' 
//       });
      
//       fetchMenuItems();
//       alert('Menu item added successfully!');
//     } catch (error) {
//       console.error('Error adding menu item:', error);
//       alert('Error adding menu item');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="menu-management">
//       <h1>Menu Management</h1>
      
//       <form onSubmit={addMenuItem} className="add-menu-form">
//         <h2>Add New Menu Item</h2>
        
//         {/* SIMPLE IMAGE URL INPUT - NO UPLOAD */}
//         <div className="image-url-section">
//           <label>🖼️ Image URL (Optional):</label>
//           <input
//             type="url"
//             placeholder="Paste image URL from Unsplash, Imgur, etc."
//             value={newItem.image}
//             onChange={(e) => setNewItem({...newItem, image: e.target.value})}
//           />
          
//           {/* Quick image suggestions */}
//           <div className="image-suggestions">
//             <small>💡 Quick suggestions:</small>
//             <div className="suggestion-buttons">
//               {[
//                 {
//                   url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&auto=format&fit=crop',
//                   name: 'Pizza'
//                 },
//                 {
//                   url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop', 
//                   name: 'Burger'
//                 },
//                 {
//                   url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop',
//                   name: 'Salad'
//                 },
//                 {
//                   url: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&auto=format&fit=crop',
//                   name: 'Dessert'
//                 },
//               ].map((item, index) => (
//                 <button 
//                   key={index}
//                   type="button"
//                   onClick={() => setNewItem({...newItem, image: item.url})}
//                   className="suggestion-btn"
//                 >
//                   {item.name}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Image preview */}
//           {newItem.image && (
//             <div className="image-preview">
//               <img 
//                 src={newItem.image} 
//                 alt="Preview" 
//                 onError={(e) => {
//                   console.error('Image failed to load:', newItem.image);
//                   e.target.style.display = 'none';
//                   alert('❌ Image failed to load. Please check the URL.');
//                 }}
//               />
//               <small>Image Preview</small>
//             </div>
//           )}
//         </div>

//         {/* Other form inputs */}
//         <input
//           type="text"
//           placeholder="Item Name"
//           value={newItem.name}
//           onChange={(e) => setNewItem({...newItem, name: e.target.value})}
//           required
//         />
        
//         <input
//           type="text"
//           placeholder="Description"
//           value={newItem.description}
//           onChange={(e) => setNewItem({...newItem, description: e.target.value})}
//         />
        
//         <input
//           type="number"
//           placeholder="Price"
//           step="0.01"
//           value={newItem.price}
//           onChange={(e) => setNewItem({...newItem, price: e.target.value})}
//           required
//         />
        
//         <select
//           value={newItem.category}
//           onChange={(e) => setNewItem({...newItem, category: e.target.value})}
//           required
//         >
//           <option value="">Select Category</option>
//           <option value="Appetizers">Appetizers</option>
//           <option value="Main Course">Main Course</option>
//           <option value="Desserts">Desserts</option>
//           <option value="Drinks">Drinks</option>
//           <option value="Sides">Sides</option>
//         </select>
        
//         <input
//           type="number"
//           placeholder="Preparation Time (minutes)"
//           value={newItem.preparationTime}
//           onChange={(e) => setNewItem({...newItem, preparationTime: e.target.value})}
//         />
        
//         <button type="submit" disabled={loading}>
//           {loading ? 'Adding...' : 'Add Menu Item'}
//         </button>
//       </form>

//       {/* Menu items list */}
//       <div className="menu-items-list">
//         <h2>Current Menu Items ({menuItems.length})</h2>
//         {loading ? (
//           <div className="loading-message">Loading menu items...</div>
//         ) : (
//           <div className="menu-items-grid">
//             {menuItems.map(item => (
//               <div key={item._id} className="menu-item-card">
//                 {item.image && (
//                   <div className="menu-item-image">
//                     <img 
//                       src={item.image} 
//                       alt={item.name}
//                       onError={(e) => {
//                         e.target.style.display = 'none';
//                       }}
//                     />
//                   </div>
//                 )}
//                 <h3>{item.name}</h3>
//                 <p className="menu-item-description">{item.description}</p>
//                 <div className="menu-item-details">
//                   <span className="menu-item-price">₹{item.price}</span>
//                   <span className="menu-item-category">{item.category}</span>
//                 </div>
//                 <div className="menu-item-time">
//                   ⏱️ {item.preparationTime} min
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MenuManagement;


//2
// src/components/MenuManagement.jsx
// import React, { useState } from 'react';
// import menuItems from '../data/menuItems';
// import './MenuManagement.css';


// const MenuManagement = () => {
//   const [items, setItems] = useState(menuItems);
//   const [selectedCategory, setSelectedCategory] = useState('All');
//   const [searchTerm, setSearchTerm] = useState('');

//   // Get unique categories
//   const categories = ['All', ...new Set(menuItems.map(item => item.category))];

//   // Filter items based on category and search
//   const filteredItems = items.filter(item => {
//     const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
//     const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
//     return matchesCategory && matchesSearch;
//   });

//   const toggleAvailability = (id) => {
//     setItems(prevItems => 
//       prevItems.map(item => 
//         item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
//       )
//     );
//   };

//   return (
//     <div className="menu-management">
//       <header className="menu-header">
//         <h1>🍽️ Menu Management</h1>
//         <p>Manage your restaurant menu items</p>
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

//       {/* Menu Items Grid */}
//       <div className="menu-grid">
//         {filteredItems.map(item => (
//           <div key={item.id} className={`menu-card ${!item.isAvailable ? 'unavailable' : ''}`}>
//             <div className="menu-card-image">
//               <img 
//                 src={item.image} 
//                 alt={item.name}
//                 onError={(e) => {
//                   e.target.src = '/menu-images/placeholder.jpg'; // Fallback image
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
// import axios from 'axios';
// import './MenuManagement.css';

// // const API_BASE_URL = 'http://localhost:5000/api';
// const API_BASE_URL = 'https://orderflow-backend-v964.onrender.com/api'

// const MenuManagement = () => {
//   const [items, setItems] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState('All');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   // Fetch menu items from MongoDB
//   const fetchMenuItems = async () => {
//     try {
//       setLoading(true);
//       setError('');
      
//       const response = await axios.get(`${API_BASE_URL}/menu`);
      
//       if (response.data.success) {
//         setItems(response.data.data);
//         console.log(`✅ Loaded ${response.data.data.length} menu items from MongoDB`);
//       } else {
//         throw new Error('Failed to load menu items');
//       }
//     } catch (error) {
//       console.error('❌ Error fetching menu items:', error);
//       setError('Failed to load menu items from database');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchMenuItems();
//     setupSocketConnection();
//   }, []);

//   // Real-time updates
//   const setupSocketConnection = () => {
//     // You'll need to set up socket.io client
//     // This allows real-time updates across all admin panels
//   };

//   // Toggle availability
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

//       // Update in MongoDB
//       const response = await axios.patch(
//         `${API_BASE_URL}/menu/${id}/availability`,
//         { isAvailable: newStatus }
//       );

//       if (response.data.success) {
//         console.log(`✅ ${response.data.message}`);
//       } else {
//         throw new Error('Update failed');
//       }

//     } catch (error) {
//       console.error('❌ Error updating availability:', error);
      
//       // Revert on error
//       setItems(prevItems => 
//         prevItems.map(item => 
//           item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
//         )
//       );
      
//       alert('Failed to update menu item availability');
//     }
//   };

//   // Get unique categories
//   const categories = ['All', ...new Set(items.map(item => item.category))];

//   // Filter items
//   const filteredItems = items.filter(item => {
//     const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
//     const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
//     return matchesCategory && matchesSearch;
//   });

//   if (loading) {
//     return (
//       <div className="menu-management">
//         <div className="loading">Loading menu items from database...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="menu-management">
//       <header className="menu-header">
//         <h1>🍽️ Menu Management</h1>
//         <p>Manage your restaurant menu items</p>
        
//         {error && (
//           <div className="error-message">
//             {error}
//             <button onClick={fetchMenuItems}>Try Again</button>
//           </div>
//         )}
        
//         <button onClick={fetchMenuItems} className="refresh-btn">
//           🔄 Refresh
//         </button>
//       </header>

//       {/* Stats */}
//       <div className="menu-stats">
//         <div className="stat-item">
//           <span>Total: {items.length}</span>
//         </div>
//         <div className="stat-item">
//           <span>Available: {items.filter(item => item.isAvailable).length}</span>
//         </div>
//         <div className="stat-item">
//           <span>Unavailable: {items.filter(item => !item.isAvailable).length}</span>
//         </div>
//       </div>

//       {/* Filters */}
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

//       {/* Menu Grid */}
//       <div className="menu-grid">
//         {filteredItems.map(item => (
//           <div key={item.id} className={`menu-card ${!item.isAvailable ? 'unavailable' : ''}`}>
//             <div className="menu-card-image">
//               <img src={item.image} alt={item.name} />
//               {!item.isAvailable && <div className="unavailable-overlay">Unavailable</div>}
//             </div>
            
//             <div className="menu-card-content">
//               <div className="menu-card-header">
//                 <h3>{item.name}</h3>
//                 <span className="price">₹{item.price}</span>
//               </div>
              
//               <p className="category">{item.category}</p>
//               <p className="description">{item.description}</p>
              
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
//           <p>No menu items found.</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MenuManagement;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MenuManagement.css';

// const API_BASE_URL = 'http://localhost:5000/api';
const API_BASE_URL = 'https://orderflow-backend-v964.onrender.com/api'

const MenuManagement = () => {
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch menu items from MongoDB
  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Fetching menu items from:', `${API_BASE_URL}/menu`);
      
      const response = await axios.get(`${API_BASE_URL}/menu`, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('📦 Full API Response:', response);
      console.log('📊 Response data:', response.data);
      
      // Handle different possible response structures
      if (response.data && Array.isArray(response.data)) {
        // If response.data is directly an array
        setItems(response.data);
        console.log(`✅ Loaded ${response.data.length} menu items from MongoDB`);
      } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
        // If response has success flag and data array
        setItems(response.data.data);
        console.log(`✅ Loaded ${response.data.data.length} menu items from MongoDB`);
      } else if (response.data && Array.isArray(response.data.items)) {
        // If response has items array
        setItems(response.data.items);
        console.log(`✅ Loaded ${response.data.items.length} menu items from MongoDB`);
      } else {
        console.warn('⚠️ Unexpected response structure:', response.data);
        // Try to extract items anyway
        if (response.data && typeof response.data === 'object') {
          const possibleArrays = Object.values(response.data).find(val => Array.isArray(val));
          if (possibleArrays) {
            setItems(possibleArrays);
            console.log(`✅ Loaded ${possibleArrays.length} menu items from found array`);
          } else {
            throw new Error('No array found in response data');
          }
        } else {
          throw new Error('Invalid response format - expected array of menu items');
        }
      }
    } catch (error) {
      console.error('❌ Error fetching menu items:', error);
      
      let errorMessage = 'Failed to load menu items from database';
      
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        errorMessage = 'Network error: Cannot connect to server';
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Connection refused: Server may be down';
      } else if (error.response) {
        // Server responded with error status
        errorMessage = `Server error: ${error.response.status} - ${error.response.statusText}`;
        console.error('Server response:', error.response.data);
      } else if (error.request) {
        // Request made but no response received
        errorMessage = 'No response from server - check if backend is running';
      } else {
        errorMessage = error.message || 'Unknown error occurred';
      }
      
      setError(errorMessage);
      
      // Set empty array to prevent further errors
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  // Toggle availability with better error handling
  const toggleAvailability = async (id) => {
    // Check if item exists before proceeding
    const item = items.find(item => item._id === id || item.id === id);
    if (!item) {
      console.error('❌ Item not found:', id);
      alert('Item not found');
      return;
    }

    try {
      const newStatus = !item.isAvailable;

      // Optimistically update UI
      setItems(prevItems => 
        prevItems.map(item => 
          (item._id === id || item.id === id) ? { ...item, isAvailable: newStatus } : item
        )
      );

      // Update in MongoDB - try different endpoint formats
      let response;
      try {
        response = await axios.patch(
          `${API_BASE_URL}/menu/${id}/availability`,
          { isAvailable: newStatus },
          { timeout: 5000 }
        );
      } catch (patchError) {
        console.warn('PATCH failed, trying PUT:', patchError);
        // Try PUT as fallback
        response = await axios.put(
          `${API_BASE_URL}/menu/${id}`,
          { ...item, isAvailable: newStatus },
          { timeout: 5000 }
        );
      }

      console.log('✅ Availability update response:', response.data);
      
      if (response.data && (response.data.success || response.data.message)) {
        console.log(`✅ ${response.data.message || 'Availability updated successfully'}`);
      }

    } catch (error) {
      console.error('❌ Error updating availability:', error);
      
      // Revert on error
      setItems(prevItems => 
        prevItems.map(item => 
          (item._id === id || item.id === id) ? { ...item, isAvailable: item.isAvailable } : item
        )
      );
      
      alert('Failed to update menu item availability. Please try again.');
    }
  };

  // Get unique categories safely
  const categories = ['All', ...new Set(items.map(item => item.category).filter(Boolean))];

  // Filter items safely
  const filteredItems = items.filter(item => {
    if (!item) return false;
    
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="menu-management">
        <div className="loading">
          <div>Loading menu items from database...</div>
          <div style={{ fontSize: '12px', marginTop: '10px', color: '#666' }}>
            Fetching from: {API_BASE_URL}/menu
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-management">
      <header className="menu-header">
        <h1>🍽️ Menu Management</h1>
        <p>Manage your restaurant menu items</p>
        
        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
            <div style={{ marginTop: '10px' }}>
              <button onClick={fetchMenuItems} className="retry-btn">
                🔄 Try Again
              </button>
            </div>
          </div>
        )}
        
        <button onClick={fetchMenuItems} className="refresh-btn">
          🔄 Refresh Menu
        </button>
      </header>

      {/* Stats */}
      <div className="menu-stats">
        <div className="stat-item">
          <span>Total: {items.length}</span>
        </div>
        <div className="stat-item">
          <span>Available: {items.filter(item => item.isAvailable).length}</span>
        </div>
        <div className="stat-item">
          <span>Unavailable: {items.filter(item => !item.isAvailable).length}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="menu-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          background: '#f5f5f5', 
          padding: '10px', 
          margin: '10px 0', 
          borderRadius: '5px',
          fontSize: '12px'
        }}>
          <strong>Debug Info:</strong> Loaded {items.length} items, {filteredItems.length} filtered | 
          API: {API_BASE_URL}
        </div>
      )}

      {/* Menu Grid */}
      <div className="menu-grid">
        {filteredItems.map(item => (
          <div key={item._id || item.id} className={`menu-card ${!item.isAvailable ? 'unavailable' : ''}`}>
            <div className="menu-card-image">
              <img 
                src={item.image || '/placeholder-food.jpg'} 
                alt={item.name} 
                onError={(e) => {
                  e.target.src = '/placeholder-food.jpg';
                }}
              />
              {!item.isAvailable && <div className="unavailable-overlay">Unavailable</div>}
            </div>
            
            <div className="menu-card-content">
              <div className="menu-card-header">
                <h3>{item.name || 'Unnamed Item'}</h3>
                <span className="price">₹{item.price || '0'}</span>
              </div>
              
              <p className="category">{item.category || 'Uncategorized'}</p>
              <p className="description">{item.description || 'No description available'}</p>
              
              <div className="menu-actions">
                <button 
                  className={`availability-btn ${item.isAvailable ? 'available' : 'unavailable'}`}
                  onClick={() => toggleAvailability(item._id || item.id)}
                >
                  {item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && !loading && (
        <div className="no-items">
          <p>No menu items found. {items.length === 0 ? 'The menu might be empty or there might be a connection issue.' : 'Try changing your filters.'}</p>
          <button onClick={fetchMenuItems} className="retry-btn">
            🔄 Reload Menu
          </button>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;