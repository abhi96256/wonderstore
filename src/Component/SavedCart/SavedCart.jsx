import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getSavedCarts, getActiveCart, removeCartHistory } from '../../firebase/firestore';
import { FaShoppingCart, FaTrash, FaPlus, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { auth } from '../../firebase/config';
import './SavedCart.css';

const SavedCart = () => {
  const [savedCarts, setSavedCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  // Function to fetch both active cart and saved carts
  const fetchAllCartData = async (userEmail) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get active cart
      const activeCart = await getActiveCart(userEmail);
      console.log('Active cart:', activeCart);
      
      // Get saved carts
      const savedCartsData = await getSavedCarts(userEmail);
      console.log('Saved carts:', savedCartsData);
      
      // Combine active cart with saved carts if it exists
      let allCarts = [...savedCartsData];
      if (activeCart && activeCart.items && activeCart.items.length > 0) {
        // Add active cart at the beginning
        allCarts = [{
          ...activeCart,
          isActive: true // Mark as active cart
        }, ...savedCartsData];
      }
      
      console.log('All carts:', allCarts);
      setSavedCarts(allCarts);
    } catch (err) {
      console.error('Error fetching cart data:', err);
      setError('Failed to load saved items. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to remove a cart history
  const handleRemoveHistory = async (cartId) => {
    try {
      if (!cartId) return;
      
      await removeCartHistory(cartId);
      
      // Update local state
      setSavedCarts(prevCarts => prevCarts.filter(cart => cart.id !== cartId));
      
      // Show success message
      alert('Cart history removed successfully');
    } catch (error) {
      console.error('Error removing cart history:', error);
      alert('Failed to remove cart history. Please try again.');
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    const user = auth.currentUser;
    if (!isAuthenticated || !user?.email) {
      setLoading(false);
      return;
    }
    
    fetchAllCartData(user.email);
  }, [isAuthenticated]);
  
  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchAllCartData(user.email);
      } else {
        setSavedCarts([]);
        setLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      console.log('Cart was updated, refreshing data');
      const user = auth.currentUser;
      if (user?.email) {
        // Wait a bit to ensure Firebase has updated
        setTimeout(() => {
          fetchAllCartData(user.email);
        }, 1000);
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);
  
  const handleAddToCart = async (item) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }
      
      // Ensure the item has consistent format
      const formattedItem = {
        ...item,
        selected: true,
        addedAt: new Date().toISOString()
      };
      
      // Add to cart using the CartContext function
      await addToCart(formattedItem, formattedItem.size || 'default', formattedItem.quantity || 1, navigate);
      
      // Show success message
      alert(`${formattedItem.name || 'Item'} added to cart!`);
      
      // Refresh cart data
      fetchAllCartData(user.email);
    } catch (error) {
      console.error('Error adding item to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    }
  };
  
  const handleAddAllToCart = async (cartItems) => {
    if (!cartItems || cartItems.length === 0) return;
    
    try {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }
      
      // Add each item to cart
      for (const item of cartItems) {
        const formattedItem = {
          ...item,
          selected: true,
          addedAt: new Date().toISOString()
        };
        
        await addToCart(formattedItem, formattedItem.size || 'default', formattedItem.quantity || 1, navigate);
      }
      
      // Show success message
      alert(`${cartItems.length} items added to cart!`);
      
      // Refresh cart data
      fetchAllCartData(user.email);
      
      // Navigate to cart page
      navigate('/cart');
    } catch (error) {
      console.error('Error adding items to cart:', error);
      alert('Failed to add items to cart. Please try again.');
    }
  };
  
  const getFormattedDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return 'Unknown date';
    }
  };
  
  if (!isAuthenticated) {
    return (
      <div className="saved-cart-container">
        <div className="saved-cart-not-logged-in">
          <h2>Please Login</h2>
          <p>You need to be logged in to view your saved items.</p>
          <Link to="/login" className="login-button">Login</Link>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="saved-cart-container">
        <div className="saved-cart-loading">
          <FaSpinner className="spinner" />
          <p>Loading your saved items...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="saved-cart-container">
        <div className="saved-cart-error">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">Retry</button>
        </div>
      </div>
    );
  }
  
  if (savedCarts.length === 0) {
    return (
      <div className="saved-cart-container">
        <div className="saved-cart-header">
          <Link to="/" className="back-link"><FaArrowLeft /> Back to Shopping</Link>
          <h1><FaShoppingCart /> Saved Items</h1>
        </div>
        <div className="saved-cart-empty">
          <div className="empty-cart-icon">
            <FaShoppingCart />
          </div>
          <h2>You don't have any saved items</h2>
          <p>Items added to your cart are automatically saved for later.</p>
          <Link to="/all-products" className="start-shopping-button">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="saved-cart-container">
      <div className="saved-cart-header">
        <Link to="/" className="back-link"><FaArrowLeft /> Back to Shopping</Link>
        <h1><FaShoppingCart /> Saved Items</h1>
      </div>
      
      {savedCarts.map(cart => (
        <div key={cart.id} className={`saved-cart-box ${cart.isActive ? 'active-cart' : ''}`}>
          <div className="saved-cart-box-header">
            <div className="saved-cart-box-info">
              <h3>
                {cart.isActive ? 'Current Cart' : `Cart from ${getFormattedDate(cart.lastModified || cart.updatedAt)}`}
              </h3>
              <p>{cart.items?.length || 0} item{(cart.items?.length || 0) !== 1 ? 's' : ''}</p>
            </div>
            
            <div className="saved-cart-box-actions">
              {!cart.isActive && (
                <>
                  <button 
                    className="add-all-to-cart-button"
                    onClick={() => handleAddAllToCart(cart.items)}
                    disabled={!cart.items || cart.items.length === 0}
                  >
                    <FaPlus /> Add All to Cart
                  </button>
                  <button 
                    className="remove-history-button"
                    onClick={() => handleRemoveHistory(cart.id)}
                  >
                    <FaTrash /> Remove History
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="saved-cart-items">
            {cart.items?.map(item => (
              <div key={`${cart.id}-${item.id}-${item.size || 'default'}`} className="saved-cart-item">
                <div className="saved-cart-item-image">
                  <img 
                    src={item.image ? '/' + item.image.split(',')[0].trim() : ''}
                    alt={item.name || 'Product'}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/100x100?text=Product';
                    }}
                  />
                </div>
                
                <div className="saved-cart-item-details">
                  <div className="saved-cart-item-header">
                    <Link to={`/product/${item.id}`} className="saved-cart-item-name">
                      {item.name}
                    </Link>
                    {item.addedAt && (
                      <span className="saved-cart-item-date">
                        Added on {getFormattedDate(item.addedAt)}
                      </span>
                    )}
                  </div>
                  
                  <div className="saved-cart-item-meta">
                    {item.size && item.size !== 'default' && (
                      <span className="saved-cart-item-size">Size: {item.size}</span>
                    )}
                    <span className="saved-cart-item-quantity">Quantity: {item.quantity}</span>
                  </div>
                  
                  <div className="saved-cart-item-price">
                    {item.discount ? (
                      <>
                        <span className="discounted-price">
                          ₹{((Number(item.price) || 0) * (1 - (Number(item.discount) || 0) / 100)).toFixed(2)}
                        </span>
                        <span className="original-price">
                          ₹{(Number(item.price) || 0).toFixed(2)}
                        </span>
                        <span className="discount-badge">-{item.discount}%</span>
                      </>
                    ) : (
                      `₹${(Number(item.price) || 0).toFixed(2)}`
                    )}
                  </div>
                </div>
                
                <div className="saved-cart-item-actions">
                  <button 
                    className="add-to-cart-button"
                    onClick={() => handleAddToCart(item)}
                  >
                    <FaPlus /> Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SavedCart; 