// const express = require('express');
// const router = express.Router();
// const MenuItem = require('../models/MenuItem');

// // Get all menu items
// router.get('/', async (req, res) => {
//   try {
//     const { category } = req.query;
//     let query = { isAvailable: true };
    
//     if (category && category !== 'all') {
//       query.category = category;
//     }
    
//     const menuItems = await MenuItem.find(query);
//     res.json(menuItems);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Get menu item by ID
// router.get('/:id', async (req, res) => {
//   try {
//     const menuItem = await MenuItem.findById(req.params.id);
//     if (!menuItem) {
//       return res.status(404).json({ message: 'Menu item not found' });
//     }
//     res.json(menuItem);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Create menu item (admin only)
// router.post('/', async (req, res) => {
//   try {
//     const menuItem = new MenuItem(req.body);
//     await menuItem.save();
//     res.status(201).json(menuItem);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// // Update menu item
// router.put('/:id', async (req, res) => {
//   try {
//     const menuItem = await MenuItem.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     );
//     res.json(menuItem);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// // Delete menu item
// router.delete('/:id', async (req, res) => {
//   try {
//     await MenuItem.findByIdAndDelete(req.params.id);
//     res.json({ message: 'Menu item deleted' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// module.exports = router;

// const express = require('express');
// const router = express.Router();
// const MenuItem = require('../models/MenuItem'); // We'll create this model

// // Get all menu items
// router.get('/', async (req, res) => {
//   try {
//     const menuItems = await MenuItem.find().sort({ category: 1, name: 1 });
//     res.json({
//       success: true,
//       data: menuItems
//     });
//   } catch (error) {
//     console.error('Error fetching menu items:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching menu items',
//       error: error.message
//     });
//   }
// });

// // Update menu item availability
// router.patch('/:id/availability', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { isAvailable } = req.body;

//     const menuItem = await MenuItem.findByIdAndUpdate(
//       id,
//       { isAvailable },
//       { new: true, runValidators: true }
//     );

//     if (!menuItem) {
//       return res.status(404).json({
//         success: false,
//         message: 'Menu item not found'
//       });
//     }

//     // Emit socket event for real-time updates
//     req.app.get('io').emit('menu-item-updated', menuItem);

//     res.json({
//       success: true,
//       message: `Menu item ${isAvailable ? 'enabled' : 'disabled'}`,
//       data: menuItem
//     });

//   } catch (error) {
//     console.error('Error updating menu item:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error updating menu item',
//       error: error.message
//     });
//   }
// });

// // Update multiple menu items (bulk update)
// router.patch('/bulk-availability', async (req, res) => {
//   try {
//     const { itemIds, isAvailable } = req.body;

//     const result = await MenuItem.updateMany(
//       { _id: { $in: itemIds } },
//       { isAvailable }
//     );

//     // Fetch updated items
//     const updatedItems = await MenuItem.find({ _id: { $in: itemIds } });

//     // Emit socket event for all updated items
//     req.app.get('io').emit('menu-bulk-update', updatedItems);

//     res.json({
//       success: true,
//       message: `${result.modifiedCount} items updated`,
//       data: updatedItems
//     });

//   } catch (error) {
//     console.error('Error bulk updating menu items:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error updating menu items',
//       error: error.message
//     });
//   }
// });

// module.exports = router;


// const express = require('express');
// const router = express.Router();
// const MenuItem = require('../models/MenuItem');

// // Get all menu items (for admin - shows all items)
// router.get('/', async (req, res) => {
//   try {
//     const menuItems = await MenuItem.find().sort({ category: 1, name: 1 });
//     res.json({
//       success: true,
//       data: menuItems
//     });
//   } catch (error) {
//     console.error('Error fetching menu items:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching menu items',
//       error: error.message
//     });
//   }
// });

// // Get available menu items (for customers - only available items)
// router.get('/available', async (req, res) => {
//   try {
//     const menuItems = await MenuItem.find({ isAvailable: true }).sort({ category: 1, name: 1 });
//     res.json({
//       success: true,
//       data: menuItems
//     });
//   } catch (error) {
//     console.error('Error fetching available menu items:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching menu items',
//       error: error.message
//     });
//   }
// });

// // Update menu item availability
// router.patch('/:id/availability', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { isAvailable } = req.body;

//     console.log(`🔄 Updating availability for item ${id} to:`, isAvailable);

//     const menuItem = await MenuItem.findOneAndUpdate(
//       { id: id },
//       { isAvailable },
//       { new: true, runValidators: true }
//     );

//     if (!menuItem) {
//       return res.status(404).json({
//         success: false,
//         message: 'Menu item not found'
//       });
//     }

//     console.log(`✅ Menu item ${menuItem.name} availability updated to: ${isAvailable}`);

//     // Emit socket event for real-time updates
//     if (req.app.get('io')) {
//       req.app.get('io').emit('menu-item-updated', menuItem);
//     }

//     res.json({
//       success: true,
//       message: `"${menuItem.name}" ${isAvailable ? 'is now available' : 'is now unavailable'}`,
//       data: menuItem
//     });

//   } catch (error) {
//     console.error('❌ Error updating menu item:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error updating menu item',
//       error: error.message
//     });
//   }
// });

// module.exports = router;


// routes/menu.js


// const express = require('express');
// const router = express.Router();
// const MenuItem = require('../models/MenuItem');

// // GET all menu items
// router.get('/', async (req, res) => {
//   try {
//     const menuItems = await MenuItem.find().sort({ category: 1, name: 1 });
//     res.json({
//       success: true,
//       data: menuItems,
//       message: `Found ${menuItems.length} menu items`
//     });
//   } catch (error) {
//     console.error('Error fetching menu items:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching menu items',
//       error: error.message
//     });
//   }
// });

// // GET available menu items (for customer ordering page)
// router.get('/available', async (req, res) => {
//   try {
//     const menuItems = await MenuItem.find({ isAvailable: true }).sort({ category: 1, name: 1 });
//     res.json({
//       success: true,
//       data: menuItems,
//       message: `Found ${menuItems.length} available menu items`
//     });
//   } catch (error) {
//     console.error('Error fetching available menu items:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching available menu items',
//       error: error.message
//     });
//   }
// });

// // UPDATE item availability
// router.patch('/:id/availability', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { isAvailable } = req.body;

//     const updatedItem = await MenuItem.findByIdAndUpdate(
//       id,
//       { isAvailable },
//       { new: true, runValidators: true }
//     );

//     if (!updatedItem) {
//       return res.status(404).json({
//         success: false,
//         message: 'Menu item not found'
//       });
//     }

//     res.json({
//       success: true,
//       data: updatedItem,
//       message: `Item ${isAvailable ? 'activated' : 'deactivated'} successfully`
//     });
//   } catch (error) {
//     console.error('Error updating availability:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error updating item availability',
//       error: error.message
//     });
//   }
// });

// // UPDATE entire menu item
// router.put('/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateData = req.body;

//     const updatedItem = await MenuItem.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true, runValidators: true }
//     );

//     if (!updatedItem) {
//       return res.status(404).json({
//         success: false,
//         message: 'Menu item not found'
//       });
//     }

//     res.json({
//       success: true,
//       data: updatedItem,
//       message: 'Menu item updated successfully'
//     });
//   } catch (error) {
//     console.error('Error updating menu item:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error updating menu item',
//       error: error.message
//     });
//   }
// });

// module.exports = router;


// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import './MenuManagement.css';

// const API_BASE_URL = 'https://orderflow-backend-v964.onrender.com/api';

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
//       console.log('🔄 Fetching menu items from:', `${API_BASE_URL}/menu`);
      
//       const response = await axios.get(`${API_BASE_URL}/menu`, {
//         timeout: 10000,
//       });
      
//       console.log('📦 API Response:', response.data);
      
//       if (response.data.success && Array.isArray(response.data.data)) {
//         setItems(response.data.data);
//         console.log(`✅ Loaded ${response.data.data.length} menu items from MongoDB`);
//       } else {
//         throw new Error('Invalid response format from server');
//       }
      
//     } catch (error) {
//       console.error('❌ Error fetching menu items:', error);
      
//       let errorMessage = 'Failed to load menu items';
      
//       if (error.response) {
//         errorMessage = `Server error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`;
//       } else if (error.request) {
//         errorMessage = 'No response from server - backend may be down';
//       } else {
//         errorMessage = error.message;
//       }
      
//       setError(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchMenuItems();
//   }, []);

//   // Toggle availability with real-time MongoDB update
//   const toggleAvailability = async (id) => {
//     const item = items.find(item => item._id === id);
//     if (!item) {
//       console.error('❌ Item not found:', id);
//       return;
//     }

//     try {
//       const newStatus = !item.isAvailable;

//       // Optimistically update UI
//       setItems(prevItems => 
//         prevItems.map(item => 
//           item._id === id ? { ...item, isAvailable: newStatus } : item
//         )
//       );

//       // Update in MongoDB
//       const response = await axios.patch(
//         `${API_BASE_URL}/menu/${id}/availability`,
//         { isAvailable: newStatus },
//         { timeout: 5000 }
//       );

//       if (response.data.success) {
//         console.log(`✅ ${response.data.message}`);
//         // Update with server response to ensure sync
//         setItems(prevItems => 
//           prevItems.map(item => 
//             item._id === id ? response.data.data : item
//           )
//         );
//       } else {
//         throw new Error('Update failed on server');
//       }

//     } catch (error) {
//       console.error('❌ Error updating availability:', error);
      
//       // Revert on error
//       setItems(prevItems => 
//         prevItems.map(item => 
//           item._id === id ? { ...item, isAvailable: !item.isAvailable } : item
//         )
//       );
      
//       alert('Failed to update menu item availability. Please try again.');
//     }
//   };

//   // Get unique categories
//   const categories = ['All', ...new Set(items.map(item => item.category).filter(Boolean))];

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
//         <div className="loading">
//           <div>Loading menu items from database...</div>
//           <div style={{ fontSize: '12px', marginTop: '10px', color: '#666' }}>
//             Connected to: {API_BASE_URL}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="menu-management">
//       <header className="menu-header">
//         <h1>🍽️ Menu Management</h1>
//         <p>Real-time menu management with MongoDB sync</p>
        
//         {error && (
//           <div className="error-message">
//             <strong>Error:</strong> {error}
//             <div style={{ marginTop: '10px' }}>
//               <button onClick={fetchMenuItems} className="retry-btn">
//                 🔄 Try Again
//               </button>
//             </div>
//           </div>
//         )}
        
//         <div className="header-actions">
//           <button onClick={fetchMenuItems} className="refresh-btn">
//             🔄 Refresh Menu
//           </button>
//           <span className="db-status">
//             📊 MongoDB: {items.length} items
//           </span>
//         </div>
//       </header>

//       {/* Stats */}
//       <div className="menu-stats">
//         <div className="stat-item">
//           <span>Total: {items.length}</span>
//         </div>
//         <div className="stat-item available">
//           <span>Available: {items.filter(item => item.isAvailable).length}</span>
//         </div>
//         <div className="stat-item unavailable">
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
//           <div key={item._id} className={`menu-card ${!item.isAvailable ? 'unavailable' : ''}`}>
//             <div className="menu-card-image">
//               <img 
//                 src={item.image} 
//                 alt={item.name}
//                 onError={(e) => {
//                   e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
//                 }}
//               />
//               {!item.isAvailable && <div className="unavailable-overlay">Unavailable</div>}
//             </div>
            
//             <div className="menu-card-content">
//               <div className="menu-card-header">
//                 <h3>{item.name}</h3>
//                 <span className="price">${item.price}</span>
//               </div>
              
//               <p className="category">{item.category}</p>
//               <p className="description">{item.description}</p>
              
//               <div className="menu-actions">
//                 <button 
//                   className={`availability-btn ${item.isAvailable ? 'available' : 'unavailable'}`}
//                   onClick={() => toggleAvailability(item._id)}
//                 >
//                   {item.isAvailable ? '🟢 Mark Unavailable' : '🔴 Mark Available'}
//                 </button>
//                 <span className="prep-time">
//                   ⏱️ {item.preparationTime}min
//                 </span>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {filteredItems.length === 0 && !loading && (
//         <div className="no-items">
//           <p>No menu items found matching your criteria.</p>
//           <button onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}>
//             🔄 Clear Filters
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MenuManagement;


const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');

// GET /api/menu - Get all menu items
router.get('/', async (req, res) => {
  try {
    const { category, available, vegetarian } = req.query;
    
    let filter = {};
    
    // Filter by category if provided
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    // Filter by availability if provided
    if (available === 'true') {
      filter.isAvailable = true;
    } else if (available === 'false') {
      filter.isAvailable = false;
    }
    
    // Filter by vegetarian if provided
    if (vegetarian === 'true') {
      filter.isVegetarian = true;
    } else if (vegetarian === 'false') {
      filter.isVegetarian = false;
    }
    
    const menuItems = await MenuItem.find(filter).sort({ category: 1, name: 1 });
    
    res.json({
      success: true,
      data: menuItems,
      message: `Found ${menuItems.length} menu items`
    });
    
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching menu items',
      error: error.message
    });
  }
});

// GET /api/menu/:id - Get single menu item
router.get('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    res.json({
      success: true,
      data: menuItem
    });
    
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching menu item',
      error: error.message
    });
  }
});

// POST /api/menu - Create new menu item
// router.post('/', async (req, res) => {
//   try {
//     console.log('Creating new menu item:', req.body);
    
//     const menuItem = new MenuItem(req.body);
//     const savedItem = await menuItem.save();
    
//     console.log('Menu item created successfully:', savedItem);
    
//     res.status(201).json({
//       success: true,
//       data: savedItem,
//       message: 'Menu item created successfully'
//     });
    
//   } catch (error) {
//     console.error('Error creating menu item:', error);
//     res.status(400).json({
//       success: false,
//       message: 'Error creating menu item',
//       error: error.message
//     });
//   }
// });

// In your backend route (menu.js)
// router.post('/', async (req, res) => {
//   try {
//     console.log('Creating new menu item:', req.body);
    
//     // Handle both isVeg and isVegetarian field names
//     const menuItemData = { ...req.body };
//     if (menuItemData.isVeg !== undefined) {
//       menuItemData.isVegetarian = menuItemData.isVeg;
//       delete menuItemData.isVeg;
//     }
    
//     const menuItem = new MenuItem(menuItemData);
//     const savedItem = await menuItem.save();
    
//     console.log('Menu item created successfully:', savedItem);
    
//     res.status(201).json({
//       success: true,
//       data: savedItem,
//       message: 'Menu item created successfully'
//     });
    
//   } catch (error) {
//     console.error('Error creating menu item:', error);
//     res.status(400).json({
//       success: false,
//       message: 'Error creating menu item',
//       error: error.message
//     });
//   }
// });

// PUT /api/menu/:id - Update menu item
// router.put('/:id', async (req, res) => {
//   try {
//     console.log('Updating menu item:', req.params.id, req.body);
    
//     const menuItem = await MenuItem.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true, runValidators: true }
//     );
    
//     if (!menuItem) {
//       return res.status(404).json({
//         success: false,
//         message: 'Menu item not found'
//       });
//     }
    
//     console.log('Menu item updated successfully:', menuItem);
    
//     res.json({
//       success: true,
//       data: menuItem,
//       message: 'Menu item updated successfully'
//     });
    
//   } catch (error) {
//     console.error('Error updating menu item:', error);
//     res.status(400).json({
//       success: false,
//       message: 'Error updating menu item',
//       error: error.message
//     });
//   }
// });

// POST /api/menu - Create new menu item
router.post('/', async (req, res) => {
  try {
    console.log('🔔 CREATE MENU ITEM - Raw request body:', req.body);
    
    // Transform data to match schema
    const menuItemData = { 
      name: req.body.name?.trim(),
      description: req.body.description?.trim(),
      price: parseFloat(req.body.price),
      category: req.body.category,
      // Handle both field names
      isVegetarian: req.body.isVeg !== undefined ? req.body.isVeg : req.body.isVegetarian,
      isAvailable: req.body.isAvailable !== undefined ? req.body.isAvailable : true,
      image: req.body.image?.trim(),
      preparationTime: parseInt(req.body.preparationTime) || 15
    };

    console.log('📝 Processed menu item data:', menuItemData);

    // Validate required fields
    if (!menuItemData.name || !menuItemData.price || !menuItemData.category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, price, and category are required',
        received: req.body
      });
    }

    const menuItem = new MenuItem(menuItemData);
    const savedItem = await menuItem.save();
    
    console.log('✅ Menu item created successfully:', savedItem._id);
    
    res.status(201).json({
      success: true,
      data: savedItem,
      message: 'Menu item created successfully'
    });
    
  } catch (error) {
    console.error('❌ Error creating menu item:', error);
    
    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors,
        received: req.body
      });
    }
    
    // Duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Menu item with this name already exists',
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating menu item',
      error: error.message,
      received: req.body
    });
  }
});

// PUT /api/menu/:id - Update menu item
router.put('/:id', async (req, res) => {
  try {
    console.log('🔔 UPDATE MENU ITEM - ID:', req.params.id, 'Data:', req.body);
    
    // Check if item exists first
    const existingItem = await MenuItem.findById(req.params.id);
    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Transform data to match schema
    const updateData = { 
      name: req.body.name?.trim(),
      description: req.body.description?.trim(),
      price: parseFloat(req.body.price),
      category: req.body.category,
      isVegetarian: req.body.isVeg !== undefined ? req.body.isVeg : req.body.isVegetarian,
      isAvailable: req.body.isAvailable !== undefined ? req.body.isAvailable : existingItem.isAvailable,
      image: req.body.image?.trim(),
      preparationTime: parseInt(req.body.preparationTime) || existingItem.preparationTime
    };

    console.log('📝 Processed update data:', updateData);

    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true, 
        runValidators: true,
        context: 'query'
      }
    );
    
    console.log('✅ Menu item updated successfully:', menuItem);
    
    res.json({
      success: true,
      data: menuItem,
      message: 'Menu item updated successfully'
    });
    
  } catch (error) {
    console.error('❌ Error updating menu item:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid menu item ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating menu item',
      error: error.message
    });
  }
});

// PATCH /api/menu/:id - Partial update (for availability toggle)
router.patch('/:id', async (req, res) => {
  try {
    console.log('Patching menu item:', req.params.id, req.body);
    
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    console.log('Menu item patched successfully:', menuItem);
    
    res.json({
      success: true,
      data: menuItem,
      message: 'Menu item updated successfully'
    });
    
  } catch (error) {
    console.error('Error patching menu item:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating menu item',
      error: error.message
    });
  }
});

// DELETE /api/menu/:id - Delete menu item
router.delete('/:id', async (req, res) => {
  try {
    console.log('Deleting menu item:', req.params.id);
    
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    console.log('Menu item deleted successfully:', menuItem);
    
    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting menu item',
      error: error.message
    });
  }
});

// POST /api/menu/bulk - Create multiple menu items
router.post('/bulk', async (req, res) => {
  try {
    console.log('Bulk creating menu items:', req.body.length);
    
    const menuItems = req.body;
    const results = [];
    const errors = [];
    
    for (const itemData of menuItems) {
      try {
        // Check if item already exists
        const existingItem = await MenuItem.findOne({ 
          name: { $regex: new RegExp(`^${itemData.name}$`, 'i') } 
        });
        
        if (existingItem) {
          // Update existing item
          const updatedItem = await MenuItem.findByIdAndUpdate(
            existingItem._id,
            itemData,
            { new: true, runValidators: true }
          );
          results.push({ action: 'updated', item: updatedItem });
        } else {
          // Create new item
          const newItem = new MenuItem(itemData);
          const savedItem = await newItem.save();
          results.push({ action: 'created', item: savedItem });
        }
      } catch (error) {
        errors.push({ item: itemData.name, error: error.message });
      }
    }
    
    console.log('Bulk operation completed:', {
      processed: results.length,
      errors: errors.length
    });
    
    res.json({
      success: true,
      data: {
        processed: results.length,
        created: results.filter(r => r.action === 'created').length,
        updated: results.filter(r => r.action === 'updated').length,
        errors: errors.length,
        details: results,
        errors: errors
      },
      message: `Bulk operation completed: ${results.length} items processed, ${errors.length} errors`
    });
    
  } catch (error) {
    console.error('Error in bulk operation:', error);
    res.status(400).json({
      success: false,
      message: 'Error in bulk operation',
      error: error.message
    });
  }
});

module.exports = router;