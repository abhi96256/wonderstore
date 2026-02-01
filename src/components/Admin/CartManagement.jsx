import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaSearch, FaUser } from 'react-icons/fa';
import { db } from '../../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import './CartManagement.css';

const CartManagement = () => {
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    console.log('CartManagement: Component mounted');
    fetchActiveCarts();
  }, []);

  const fetchActiveCarts = async () => {
    try {
      console.log('CartManagement: Fetching active carts...');
      setLoading(true);
      
      // Query only active carts
      const cartsRef = collection(db, 'userCarts');
      const activeCartsQuery = query(cartsRef, where('status', '==', 'active'));
      const snapshot = await getDocs(activeCartsQuery);
      
      console.log('CartManagement: Found', snapshot.size, 'active carts');
      
      const cartsList = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('CartManagement: Processing cart for user:', data.userId);
        console.log('CartManagement: Cart items:', data.items?.length || 0);
        
        return {
          id: doc.id,
          ...data,
          lastModified: data.lastModified?.toDate?.() || new Date(),
          createdAt: data.createdAt?.toDate?.() || new Date()
        };
      });

      setCarts(cartsList);
      setError(null);
      console.log('CartManagement: Successfully loaded carts');
    } catch (err) {
      console.error('CartManagement: Error fetching carts:', err);
      setError('Failed to fetch active carts');
    } finally {
      setLoading(false);
    }
  };

  const filteredCarts = carts.filter(cart => {
    const searchLower = searchTerm.toLowerCase();
    const matchesUser = cart.userId?.toLowerCase().includes(searchLower);
    const matchesItems = cart.items?.some(item => 
      item.name?.toLowerCase().includes(searchLower) ||
      item.product_name?.toLowerCase().includes(searchLower)
    );
    
    return matchesUser || matchesItems;
  });

  const calculateItemTotal = (item) => {
    try {
      const price = Number(item.price) || 0;
      const discount = Number(item.discount) || 0;
      const quantity = item.quantity || 1;
      return ((price * (1 - discount / 100)) * quantity).toFixed(2);
    } catch (err) {
      console.error('CartManagement: Error calculating item total:', err);
      return '0.00';
    }
  };

  if (loading) {
    console.log('CartManagement: Rendering loading state');
    return <div className="loading">Loading active cart data...</div>;
  }
  
  if (error) {
    console.log('CartManagement: Rendering error state:', error);
    return <div className="error">{error}</div>;
  }

  console.log('CartManagement: Rendering', filteredCarts.length, 'filtered carts');

  return (
    <div className="cart-management">
      <div className="cart-management-header">
        <h2><FaShoppingCart /> Active User Carts</h2>
        <div className="search-bar">
          <FaSearch />
          <input
            type="text"
            placeholder="Search by user email or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="user-carts-list">
        {filteredCarts.length === 0 ? (
          <div className="no-carts">
            <p>No active carts found</p>
          </div>
        ) : (
          filteredCarts.map(cart => (
            <div key={cart.id} className="user-cart-card">
              <div className="user-info">
                <FaUser className="user-icon" />
                <div>
                  <h3>{cart.userId || 'Unknown User'}</h3>
                  <p className="cart-date">
                    Last Modified: {cart.lastModified.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="cart-items">
                {cart.items?.length > 0 ? (
                  <div className="cart-items-container">
                    {cart.items.map(item => (
                      <div key={`${cart.id}-${item.id}`} className="cart-item">
                        <div className="cart-item-image">
                          <img
                            src={item.image ? '/' + item.image.split(',')[0].trim() : ''}
                            alt={item.name || item.product_name || 'Product'}
                            onError={(e) => {
                              console.log('CartManagement: Image load error for item:', item.id);
                              e.target.onerror = null;
                              e.target.src = 'https://placehold.co/100x100?text=Product';
                            }}
                          />
                        </div>

                        <div className="cart-item-details">
                          <h4 className="cart-item-name">
                            {item.name || item.product_name || 'Product'}
                          </h4>
                          <span className="cart-item-category">{item.category}</span>
                          <div className="cart-item-price">
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

                        <div className="cart-item-quantity">
                          <span className="quantity-label">Quantity:</span>
                          <span className="quantity-value">{item.quantity}</span>
                        </div>

                        <div className="cart-item-total">
                          <span className="total-label">Total:</span>
                          <span className="total-value">₹{calculateItemTotal(item)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-items">No items in cart</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CartManagement; 