


import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import menuItems from '../data/menuItems'
import './CustomerOrder.css'
import background from '../assets/inside.jpeg';

// const API_BASE_URL = 'https://the-tea-cartel-1.onrender.com/api';
const API_BASE_URL = 'https://demo-orderflow.onrender.com/api';

import logo from '../assets/logo.png';

const EXTRA_CHEESE_PRICE = 45; // Define the extra cheese price

const CustomerOrder = () => {
  const { tableNumber } = useParams()
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    mobileNumber: ''
  })
  const [menu, setMenu] = useState([])
  const [cart, setCart] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [isInfoSubmitted, setIsInfoSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const [extraCheeseSelections, setExtraCheeseSelections] = useState({}) // Track extra cheese selection before adding to cart
  const menuRef = useRef(null);

  useEffect(() => {
    loadMenuFromFile()
  }, [])

  // Load menu from hardcoded file instead of API
  const loadMenuFromFile = () => {
    try {
      setLoading(true);
      
      console.log('📋 Loading menu from file...');
      
      // Filter only available items
      const availableItems = menuItems.filter(item => item.isAvailable);
      
      if (availableItems.length === 0) {
        console.warn('⚠️ No available menu items found');
        setMenu([]);
        setCategories([]);
        return;
      }
      
      // Transform the data to match your existing structure
      const transformedMenu = availableItems.map(item => ({
        _id: item.id.toString(),
        name: item.name,
        price: item.price,
        description: item.description,
        category: item.category,
        image: item.image,
        isVeg: item.isVegetarian,
        isAvailable: item.isAvailable,
        preparationTime: item.preparationTime,
        canAddExtraCheese: item.category.toLowerCase() === 'pizza' // Add flag for pizzas (case-insensitive)
      }));
      
      console.log('✅ Transformed menu:', transformedMenu);
      setMenu(transformedMenu);
      
      // Initialize extra cheese selections for pizza items
      const initialSelections = {};
      transformedMenu.forEach(item => {
        if (item.canAddExtraCheese) {
          initialSelections[item._id] = false;
        }
      });
      setExtraCheeseSelections(initialSelections);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(transformedMenu.map(item => item.category))];
      console.log('📂 Categories:', uniqueCategories);
      setCategories(uniqueCategories);
      
    } catch (error) {
      console.error('❌ Error loading menu from file:', error);
      alert('Error loading menu. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInfoSubmit = (e) => {
    e.preventDefault()
    if (customerInfo.name && customerInfo.mobileNumber) {
      if (customerInfo.mobileNumber.length !== 10) {
        alert('Please enter a valid 10-digit mobile number')
        return
      }
      setIsInfoSubmitted(true)
    } else {
      alert('Please fill in all fields')
    }
  }

  // const addToCart = (item) => {
  //   console.log('➕ Adding to cart:', item);
    
  //   // Check if extra cheese is selected for this item
  //   const hasExtraCheese = extraCheeseSelections[item._id] || false;
    
  //   const cartItem = {
  //     _id: item._id,
  //     name: item.name,
  //     price: item.price,
  //     quantity: 1,
  //     isVeg: item.isVeg,
  //     canAddExtraCheese: item.canAddExtraCheese,
  //     extraCheese: hasExtraCheese,
  //     extraCheesePrice: hasExtraCheese ? EXTRA_CHEESE_PRICE : 0
  //   };

  //   const existingItem = cart.find(cartItem => cartItem._id === item._id);
    
  //   if (existingItem) {
  //     // If item already exists in cart, update quantity and recalculate extra cheese price
  //     setCart(cart.map(cartItem =>
  //       cartItem._id === item._id
  //         ? { 
  //             ...cartItem, 
  //             quantity: cartItem.quantity + 1,
  //             extraCheesePrice: cartItem.extraCheese ? EXTRA_CHEESE_PRICE * (cartItem.quantity + 1) : 0
  //           }
  //         : cartItem
  //     ));
  //   } else {
  //     // Add new item to cart
  //     setCart([...cart, cartItem]);
  //   }
    
  //   // Reset extra cheese selection for this item
  //   if (item.canAddExtraCheese) {
  //     setExtraCheeseSelections({
  //       ...extraCheeseSelections,
  //       [item._id]: false
  //     });
  //   }
  // };

  const addToCart = (item) => {
  console.log('➕ Adding to cart:', item);
  console.log('🧀 Extra cheese selection for this item:', extraCheeseSelections[item._id]);
  
  // Check if extra cheese is selected for this item
  const hasExtraCheese = extraCheeseSelections[item._id] || false;
  
  console.log('🧀 Has extra cheese?', hasExtraCheese);
  
  const cartItem = {
    _id: item._id,
    name: item.name,
    price: item.price,
    quantity: 1,
    isVeg: item.isVeg,
    canAddExtraCheese: item.canAddExtraCheese,
    extraCheese: hasExtraCheese,
    extraCheesePrice: hasExtraCheese ? EXTRA_CHEESE_PRICE : 0,
    itemTotal: item.price + (hasExtraCheese ? EXTRA_CHEESE_PRICE : 0)
  };

  const existingItem = cart.find(cartItem => cartItem._id === item._id);
  
  if (existingItem) {
    // If item already exists in cart, check if extra cheese preference is the same
    const sameExtraCheese = existingItem.extraCheese === hasExtraCheese;
    
    if (sameExtraCheese) {
      // Same extra cheese preference, just update quantity
      setCart(cart.map(cartItem =>
        cartItem._id === item._id
          ? { 
              ...cartItem, 
              quantity: cartItem.quantity + 1,
              extraCheesePrice: cartItem.extraCheese ? EXTRA_CHEESE_PRICE * (cartItem.quantity + 1) : 0,
              itemTotal: (cartItem.price * (cartItem.quantity + 1)) + (cartItem.extraCheese ? EXTRA_CHEESE_PRICE * (cartItem.quantity + 1) : 0)
            }
          : cartItem
      ));
    } else {
      // Different extra cheese preference, treat as new item with unique ID
      const newItemId = `${item._id}-${Date.now()}`;
      const newCartItem = {
        ...cartItem,
        _id: newItemId,
        name: hasExtraCheese ? `${item.name} (Extra Cheese)` : item.name
      };
      setCart([...cart, newCartItem]);
    }
  } else {
    // Add new item to cart
    const newCartItem = {
      ...cartItem,
      name: hasExtraCheese ? `${item.name} (Extra Cheese)` : item.name
    };
    setCart([...cart, newCartItem]);
  }
  
  // Reset extra cheese selection for this item
  if (item.canAddExtraCheese) {
    setExtraCheeseSelections({
      ...extraCheeseSelections,
      [item._id]: false
    });
  }
};

  const toggleExtraCheeseSelection = (itemId) => {
    setExtraCheeseSelections({
      ...extraCheeseSelections,
      [itemId]: !extraCheeseSelections[itemId]
    });
  };

  // const toggleExtraCheeseInCart = (itemId) => {
  //   setCart(cart.map(item => {
  //     if (item._id === itemId && item.canAddExtraCheese) {
  //       const newExtraCheeseState = !item.extraCheese;
  //       return {
  //         ...item,
  //         extraCheese: newExtraCheeseState,
  //         extraCheesePrice: newExtraCheeseState ? EXTRA_CHEESE_PRICE * item.quantity : 0
  //       };
  //     }
  //     return item;
  //   }));
  // };


  const toggleExtraCheeseInCart = (itemId) => {
  setCart(cart.map(item => {
    if (item._id === itemId && item.canAddExtraCheese) {
      const newExtraCheeseState = !item.extraCheese;
      const newName = newExtraCheeseState ? `${item.name.replace(' (Extra Cheese)', '')} (Extra Cheese)` : item.name.replace(' (Extra Cheese)', '');
      
      return {
        ...item,
        name: newName,
        extraCheese: newExtraCheeseState,
        extraCheesePrice: newExtraCheeseState ? EXTRA_CHEESE_PRICE * item.quantity : 0,
        itemTotal: (item.price * item.quantity) + (newExtraCheeseState ? EXTRA_CHEESE_PRICE * item.quantity : 0)
      };
    }
    return item;
  }));
};
  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item._id !== itemId))
  }

  // const updateQuantity = (itemId, newQuantity) => {
  //   if (newQuantity < 1) {
  //     removeFromCart(itemId)
  //     return
  //   }
    
  //   setCart(cart.map(item => {
  //     if (item._id === itemId) {
  //       const updatedItem = {
  //         ...item,
  //         quantity: newQuantity,
  //         extraCheesePrice: item.extraCheese ? EXTRA_CHEESE_PRICE * newQuantity : 0
  //       };
  //       return updatedItem;
  //     }
  //     return item;
  //   }));
  // }

  const updateQuantity = (itemId, newQuantity) => {
  if (newQuantity < 1) {
    removeFromCart(itemId)
    return
  }
  
  setCart(cart.map(item => {
    if (item._id === itemId) {
      const updatedItem = {
        ...item,
        quantity: newQuantity,
        extraCheesePrice: item.extraCheese ? EXTRA_CHEESE_PRICE * newQuantity : 0,
        itemTotal: (item.price * newQuantity) + (item.extraCheese ? EXTRA_CHEESE_PRICE * newQuantity : 0)
      };
      return updatedItem;
    }
    return item;
  }));
}
  const getCartQuantity = (itemId) => {
    const cartItem = cart.find(item => item._id === itemId);
    return cartItem ? cartItem.quantity : 0;
  }

  const getTotalAmount = () => {
    return cart.reduce((total, item) => {
      const itemTotal = item.price * item.quantity;
      const extraCheeseTotal = item.extraCheese ? EXTRA_CHEESE_PRICE * item.quantity : 0;
      return total + itemTotal + extraCheeseTotal;
    }, 0);
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const getExtraCheeseTotal = () => {
    return cart.reduce((total, item) => {
      return total + (item.extraCheese ? EXTRA_CHEESE_PRICE * item.quantity : 0);
    }, 0);
  }

  const getItemTotalWithoutExtraCheese = () => {
    return cart.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  // const placeOrder = async () => {
  //   if (cart.length === 0) {
  //     alert('Your cart is empty. Please add items before placing an order.');
  //     return;
  //   }

  //   try {
  //     setLoading(true);
      
  //     console.log('🛒 Cart items:', cart);
      
  //     // Create proper order data structure
  //     const orderData = {
  //       tableNumber: parseInt(tableNumber),
  //       customerName: customerInfo.name.trim(),
  //       mobileNumber: customerInfo.mobileNumber.trim(),
  //       items: cart.map(item => ({
  //         menuItem: item._id,
  //         name: item.name,
  //         price: parseFloat(item.price),
  //         quantity: parseInt(item.quantity),
  //         isVeg: Boolean(item.isVeg),
  //         extraCheese: item.extraCheese || false,
  //         extraCheesePrice: item.extraCheese ? parseFloat(EXTRA_CHEESE_PRICE * item.quantity) : 0
  //       }))
  //     };

  //     console.log('📦 Order data being sent:', JSON.stringify(orderData, null, 2));

  //     const response = await axios.post(`${API_BASE_URL}/orders`, orderData);
      
  //     console.log('✅ Order response:', response.data);
      
  //     if (response.data.success) {
  //       const order = response.data.data || response.data.order;
  //       alert("Order Placed Successfully✅")
  //       // Clear cart and close modal
  //       setCart([]);
  //       setShowCart(false);
        
  //       // Reset all extra cheese selections
  //       const resetSelections = {};
  //       menu.forEach(item => {
  //         if (item.canAddExtraCheese) {
  //           resetSelections[item._id] = false;
  //         }
  //       });
  //       setExtraCheeseSelections(resetSelections);
  //     } else {
  //       alert('Order failed: ' + (response.data.message || 'Unknown error'));
  //     }
      
  //   } catch (error) {
  //     console.error('❌ Order error:', error);
      
  //     if (error.response?.data) {
  //       console.error('❌ Backend error response:', error.response.data);
        
  //       if (error.response.data.errors) {
  //         const errorMessages = error.response.data.errors.map(err => 
  //           `• ${err.path}: ${err.message}`
  //         ).join('\n');
  //         alert(`Validation errors:\n${errorMessages}`);
  //       } else {
  //         alert(`Error: ${error.response.data.message || error.response.data.error}`);
  //       }
  //     } else if (error.request) {
  //       alert('Network error: Could not connect to server. Please check your connection.');
  //     } else {
  //       alert('Error: ' + error.message);
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // }


//   const placeOrder = async () => {
//   if (cart.length === 0) {
//     alert('Your cart is empty. Please add items before placing an order.');
//     return;
//   }

//   try {
//     setLoading(true);
    
//     console.log('🛒 Cart items:', cart);
    
//     // Create proper order data structure
//     const orderData = {
//       tableNumber: parseInt(tableNumber),
//       customerName: customerInfo.name.trim(),
//       mobileNumber: customerInfo.mobileNumber.trim(),
//       items: cart.map(item => ({
//         menuItem: item._id,
//         name: item.extraCheese ? `${item.name} (Extra Cheese)` : item.name, // Add extra cheese to name
//         price: parseFloat(item.price),
//         quantity: parseInt(item.quantity),
//         isVeg: Boolean(item.isVeg),
//         extraCheese: item.extraCheese || false,
//         extraCheesePrice: item.extraCheese ? parseFloat(EXTRA_CHEESE_PRICE * item.quantity) : 0,
//         itemTotal: parseFloat((item.price * item.quantity) + (item.extraCheese ? EXTRA_CHEESE_PRICE * item.quantity : 0))
//       })),
//       // Add extra cheese total to order
//       extraCheeseTotal: getExtraCheeseTotal(),
//       totalAmount: getTotalAmount()
//     };

//     console.log('📦 Order data being sent:', JSON.stringify(orderData, null, 2));

//     const response = await axios.post(`${API_BASE_URL}/orders`, orderData);
    
//     console.log('✅ Order response:', response.data);
    
//     if (response.data.success) {
//       const order = response.data.data || response.data.order;
//       alert("Order Placed Successfully✅")
//       // Clear cart and close modal
//       setCart([]);
//       setShowCart(false);
      
//       // Reset all extra cheese selections
//       const resetSelections = {};
//       menu.forEach(item => {
//         if (item.canAddExtraCheese) {
//           resetSelections[item._id] = false;
//         }
//       });
//       setExtraCheeseSelections(resetSelections);
//     } else {
//       alert('Order failed: ' + (response.data.message || 'Unknown error'));
//     }
    
//   } catch (error) {
//     console.error('❌ Order error:', error);
    
//     if (error.response?.data) {
//       console.error('❌ Backend error response:', error.response.data);
      
//       if (error.response.data.errors) {
//         const errorMessages = error.response.data.errors.map(err => 
//           `• ${err.path}: ${err.message}`
//         ).join('\n');
//         alert(`Validation errors:\n${errorMessages}`);
//       } else {
//         alert(`Error: ${error.response.data.message || error.response.data.error}`);
//       }
//     } else if (error.request) {
//       alert('Network error: Could not connect to server. Please check your connection.');
//     } else {
//       alert('Error: ' + error.message);
//     }
//   } finally {
//     setLoading(false);
//   }
// }


// const placeOrder = async () => {
//   if (cart.length === 0) {
//     alert('Your cart is empty. Please add items before placing an order.');
//     return;
//   }

//   try {
//     setLoading(true);
    
//     console.log('🛒 Cart items before sending:', cart);
    
//     // Create proper order data structure
//     const orderData = {
//       tableNumber: parseInt(tableNumber),
//       customerName: customerInfo.name.trim(),
//       mobileNumber: customerInfo.mobileNumber.trim(),
//       items: cart.map(item => ({
//         menuItem: item._id,
//         name: item.name, // This already includes "(Extra Cheese)" if selected
//         price: parseFloat(item.price),
//         quantity: parseInt(item.quantity),
//         isVeg: Boolean(item.isVeg),
//         extraCheese: item.extraCheese || false,
//         extraCheesePrice: item.extraCheese ? parseFloat(item.extraCheesePrice) : 0,
//         itemTotal: parseFloat(item.itemTotal) || parseFloat((item.price * item.quantity) + (item.extraCheese ? item.extraCheesePrice : 0))
//       })),
//       // Add extra cheese total to order
//       extraCheeseTotal: getExtraCheeseTotal(),
//       totalAmount: getTotalAmount()
//     };

//     console.log('📦 Order data being sent:', JSON.stringify(orderData, null, 2));

//     const response = await axios.post(`${API_BASE_URL}/orders`, orderData);
    
//     console.log('✅ Order response:', response.data);
    
//     if (response.data.success || response.data.orderNumber) {
//       alert("Order Placed Successfully✅")
//       // Clear cart and close modal
//       setCart([]);
//       setShowCart(false);
      
//       // Reset all extra cheese selections
//       const resetSelections = {};
//       menu.forEach(item => {
//         if (item.canAddExtraCheese) {
//           resetSelections[item._id] = false;
//         }
//       });
//       setExtraCheeseSelections(resetSelections);
//     } else {
//       alert('Order failed: ' + (response.data.message || 'Unknown error'));
//     }
    
//   } catch (error) {
//     console.error('❌ Order error:', error);
    
//     if (error.response?.data) {
//       console.error('❌ Backend error response:', error.response.data);
      
//       if (error.response.data.errors) {
//         const errorMessages = error.response.data.errors.map(err => 
//           `• ${err.path}: ${err.message}`
//         ).join('\n');
//         alert(`Validation errors:\n${errorMessages}`);
//       } else {
//         alert(`Error: ${error.response.data.message || error.response.data.error}`);
//       }
//     } else if (error.request) {
//       alert('Network error: Could not connect to server. Please check your connection.');
//     } else {
//       alert('Error: ' + error.message);
//     }
//   } finally {
//     setLoading(false);
//   }
// }

const placeOrder = async () => {
  if (cart.length === 0) {
    alert('Your cart is empty. Please add items before placing an order.');
    return;
  }

  try {
    setLoading(true);
    
    console.log('🛒 Cart items before sending:', cart);
    
    // Create proper order data structure
    const orderData = {
      tableNumber: parseInt(tableNumber),
      customerName: customerInfo.name.trim(),
      mobileNumber: customerInfo.mobileNumber.trim(),
      items: cart.map(item => ({
        menuItem: item._id,
        name: item.name,
        price: parseFloat(item.price),
        quantity: parseInt(item.quantity),
        isVeg: Boolean(item.isVeg),
        extraCheese: item.extraCheese || false,
        extraCheesePrice: item.extraCheese ? parseFloat(EXTRA_CHEESE_PRICE * item.quantity) : 0,
        itemTotal: parseFloat(item.price * item.quantity + (item.extraCheese ? EXTRA_CHEESE_PRICE * item.quantity : 0))
      })),
      // Add extra cheese total to order
      extraCheeseTotal: getExtraCheeseTotal(),
      totalAmount: getTotalAmount()
    };

    // DEBUG: Log each item's extra cheese data
    console.log('🧀 DEBUG - Extra cheese data in order:');
    orderData.items.forEach((item, index) => {
      console.log(`   Item ${index + 1}: ${item.name}`);
      console.log(`     extraCheese: ${item.extraCheese}`);
      console.log(`     extraCheesePrice: ${item.extraCheesePrice}`);
      console.log(`     itemTotal: ${item.itemTotal}`);
    });
    
    console.log('📦 Order data being sent:', JSON.stringify(orderData, null, 2));

    const response = await axios.post(`${API_BASE_URL}/orders`, orderData);
    
    console.log('✅ Order response:', response.data);
    console.log('🧀 Response extra cheese check:');
    console.log('   extraCheeseTotal:', response.data.data?.extraCheeseTotal || response.data.order?.extraCheeseTotal);
    
    if (response.data.success || response.data.orderNumber) {
      alert("Order Placed Successfully✅")
      // Clear cart and close modal
      setCart([]);
      setShowCart(false);
      
      // Reset all extra cheese selections
      const resetSelections = {};
      menu.forEach(item => {
        if (item.canAddExtraCheese) {
          resetSelections[item._id] = false;
        }
      });
      setExtraCheeseSelections(resetSelections);
    } else {
      alert('Order failed: ' + (response.data.message || 'Unknown error'));
    }
    
  } catch (error) {
    console.error('❌ Order error:', error);
    
    if (error.response?.data) {
      console.error('❌ Backend error response:', error.response.data);
      
      if (error.response.data.errors) {
        const errorMessages = error.response.data.errors.map(err => 
          `• ${err.path}: ${err.message}`
        ).join('\n');
        alert(`Validation errors:\n${errorMessages}`);
      } else {
        alert(`Error: ${error.response.data.message || error.response.data.error}`);
      }
    } else if (error.request) {
      alert('Network error: Could not connect to server. Please check your connection.');
    } else {
      alert('Error: ' + error.message);
    }
  } finally {
    setLoading(false);
  }
}
  const filteredMenu = activeCategory === 'all' 
    ? menu 
    : menu.filter(item => item.category === activeCategory)

  if (!isInfoSubmitted) {
    return (
      <div className="customer-info-container">
        <div className="customer-info-form">
          <div className="restaurant-header">
            <h3>Orderflow Demo</h3>
            <p>Table {tableNumber}</p>
          </div>
          <form onSubmit={handleInfoSubmit}>
            <div className="form-group">
              <label>Your Name:</label>
              <input
                type="text"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                required
                placeholder="Enter your name"
              />
            </div>
            <div className="form-group">
              <label>Mobile Number:</label>
              <input
                type="tel"
                value={customerInfo.mobileNumber}
                onChange={(e) => setCustomerInfo({...customerInfo, mobileNumber: e.target.value})}
                required
                placeholder="Enter 10-digit mobile number"
                pattern="[0-9]{10}"
                maxLength="10"
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <div className="loading-spinner"></div> : 'Start Ordering'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="customer-order">
      <div className='cafe-name-overlay'>
        <img src={background} alt='cafe-img'/>
        <div className='cafe-name'>Orderflow Demo</div>
        
        <button className='btn-primary'
          onClick={() => {
            if (menuRef.current) {
              menuRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}>Start Ordering</button>
      </div>
      <header className="order-header">
        <div className="header-content">
          <div className="header-right">
            <button 
              className="cart-icon-btn"
              onClick={() => setShowCart(true)}
            >
              <span className="cart-icon">🛒</span>
              {getTotalItems() > 0 && (
                <span className="cart-count">{getTotalItems()}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="order-container">
        <div className="menu-section" ref={menuRef}> 
          <div className="section-header">
            <div className="category-tabs">
              <button
                className={activeCategory === 'all' ? 'active' : ''}
                onClick={() => setActiveCategory('all')}
              >
                All Items
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  className={activeCategory === category ? 'active' : ''}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="loading-message">Loading menu...</div>
          ) : (
            <div className="menu-grid">
              {filteredMenu.map(item => {
                const cartQuantity = getCartQuantity(item._id);
                return (
                  <div key={item._id} className="menu-item-card">
                    <div className="menu-item-image">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          onError={(e) => {
                            console.error('❌ Image failed to load:', item.image);
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="image-placeholder">☕</div>
                      )}
                    </div>
                    
                    <div className="item-details">
                      <div className="item-header">
                        <h3 className="item-left">{item.name}</h3>
                      </div>
                      
                      <div className="item-meta">
                        <span className="item-price">₹{item.price}</span>
                      </div>
                      {/* <div>
                      {category=="Pizza" ? <p className="item-description">{item.description}</p>:0}
                      </div>                       */}
<div>
  {item.category === "Pizza" && <p className="item-description">{item.description}</p>}
</div>
                      
                      {/* Extra Cheese Option for Pizzas - Available before adding to cart */}
                      {item.canAddExtraCheese && cartQuantity === 0 && (
                        <div className="extra-cheese-option">
                          <label className="extra-cheese-label">
                            <input
                              type="checkbox"
                              checked={extraCheeseSelections[item._id] || false}
                              onChange={() => toggleExtraCheeseSelection(item._id)}
                            />
                            <span>Add Extra Cheese (+₹{EXTRA_CHEESE_PRICE})</span>
                          </label>
                        </div>
                      )}
                      
                      <div className="item-actions">
                        {cartQuantity > 0 ? (
                          <div className="quantity-controls">
                            <button
                              className="quantity-btn minus"
                              onClick={() => updateQuantity(item._id, cartQuantity - 1)}
                            >
                              −
                            </button>
                            <span className="quantity-display">{cartQuantity}</span>
                            <button
                              className="quantity-btn plus"
                              onClick={() => updateQuantity(item._id, cartQuantity + 1)}
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            className="add-to-cart-btn"
                            onClick={() => addToCart(item)}
                            disabled={!item.isAvailable}
                          >
                            {item.isAvailable ? 'Add' : 'Unavailable'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cart Modal */}
      {showCart && (
        <div className="cart-modal-overlay">
          <div className="cart-modal">
            <div className="cart-modal-header">
              <h2>Your Order 🛒</h2>
              <button 
                className="close-cart-btn"
                onClick={() => setShowCart(false)}
              >
                ×
              </button>
            </div>
            
            <div className="cart-modal-content">
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <div className="empty-cart-icon">🛒</div>
                  <p>Your cart is empty</p>
                  <small>Add items from the menu to get started</small>
                </div>
              ) : (
                <>
                  <div className="cart-items-list">
                    {cart.map(item => (
                      <div key={item._id} className="cart-item">
                        <div className="cart-item-header">
                          <div className="cart-item-details">
                            <h4>{item.name}</h4>
                            <p className="item-price">₹{item.price} × {item.quantity}</p>
                            {item.canAddExtraCheese && (
                              <div className="extra-cheese-toggle">
                                <label className="extra-cheese-label">
                                  <input
                                    type="checkbox"
                                    checked={item.extraCheese || false}
                                    onChange={() => toggleExtraCheeseInCart(item._id)}
                                  />
                                  <span>Extra Cheese (+₹{EXTRA_CHEESE_PRICE} per item)</span>
                                </label>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="cart-quantity-controls">
                          <button 
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            className="quantity-btn"
                          >
                            −
                          </button>
                          <span className="quantity-display">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="quantity-btn"
                          >
                            +
                          </button>
                        </div>
                        <div className="cart-item-total">
                          ₹{(item.price * item.quantity) + (item.extraCheese ? EXTRA_CHEESE_PRICE * item.quantity : 0)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="cart-total">
                    <div className="total-line">
                      <span>Subtotal:</span>
                      <span>₹{getItemTotalWithoutExtraCheese()}</span>
                    </div>
                    
                    {getExtraCheeseTotal() > 0 && (
                      <div className="total-line extra-cheese-total">
                        <span>Extra Cheese:</span>
                        <span>+ ₹{getExtraCheeseTotal()}</span>
                      </div>
                    )}
                    
                    <div className="total-line grand-total">
                      <span>Total:</span>
                      <span>₹{getTotalAmount()}</span>
                    </div>
                  </div>
                  
                  <button 
                    className="place-order-btn"
                    onClick={placeOrder}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="loading-spinner"></div>
                    ) : (
                      `Place Order • ₹${getTotalAmount().toFixed(2)}`
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerOrder