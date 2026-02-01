import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useAuthRedirect } from "../utils/authUtils";
import { db, auth } from '../firebase/config';
import { 
  getActiveCart, 
  createActiveCart, 
  updateCart, 
  saveCartHistory, 
  clearCart 
} from '../firebase/firestore';
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { requireAuth } = useAuthRedirect();
  const [cart, setCart] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartId, setCartId] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log('Auth state changed:', user?.email);
      if (user) {
        try {
          setLoading(true);
          // Get the active cart using firestore.js function
          const activeCart = await getActiveCart(user.email);
          console.log('Active cart result:', activeCart);
          
          if (activeCart) {
            // User has an active cart
            console.log('Found existing cart:', activeCart);
            setCart(activeCart.items || []);
            setCartId(activeCart.id);
            
            // Initially select all items
            setSelectedItems(activeCart.items || []);
          } else {
            // Create new cart document if it doesn't exist
            console.log('No active cart found, creating new cart');
            const newCart = await createActiveCart(user.email);
            console.log('Created new cart:', newCart);
            setCart([]);
            setSelectedItems([]);
            setCartId(newCart.id);
          }
        } catch (error) {
          console.error('Error loading cart:', error);
          setCart([]);
          setSelectedItems([]);
        } finally {
          setLoading(false);
        }
      } else {
        console.log('No user, clearing cart state');
        setCart([]);
        setSelectedItems([]);
        setCartId(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Save cart to Firestore
  const saveCartToFirestore = async (newCart) => {
    const user = auth.currentUser;
    if (!user?.email || !cartId) {
      console.log('Cannot save to Firestore: Missing user email or cartId', {
        userEmail: user?.email,
        cartId
      });
      return;
    }

    try {
      console.log('Saving to Firestore:', {
        cartId,
        userEmail: user.email,
        cartItems: newCart.length
      });

      // Update the active cart
      await updateCart(cartId, newCart);
      console.log('Successfully updated cart in Firestore');
      
      // Also save cart as a "saved cart" for historical reference
      await saveCartHistory(user.email, newCart);
      console.log('Successfully saved cart history');
    } catch (error) {
      console.error('Error saving cart to Firestore:', error);
      throw error;
    }
  };

  const addToCart = async (product, size = "default", quantity = 1, navigate) => {
    const user = auth.currentUser;
    console.log('CartContext: Starting addToCart with:', {
      product,
      size,
      quantity,
      userEmail: user?.email,
      cartId
    });
    
    if (!user) {
      console.log('CartContext: No authenticated user found');
      if (navigate) {
        navigate('/login');
      }
      return;
    }
    
    if (!cartId) {
      console.log('CartContext: No cartId found, creating new cart');
      try {
        const newCart = await createActiveCart(user.email);
        setCartId(newCart.id);
      } catch (error) {
        console.error('CartContext: Error creating new cart:', error);
        return;
      }
    }
    
    if (!product || !product.id) {
      console.error('CartContext: Invalid product data:', product);
      return;
    }

    try {
      // Update the cart state
      const newCart = [...cart];
      const existingItemIndex = newCart.findIndex(
        item => item.id === product.id && item.size === size
      );
      
      if (existingItemIndex >= 0) {
        // Update existing item
        newCart[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        const newItem = {
          id: product.id,
          name: product.name || product.product_name,
          price: product.price || product.mrp,
          discount: product.discount || 0,
          image: product.image || '/placeholder-image.jpg',
          category: product.category,
          size: size,
          quantity: quantity || 1,
          color: product.color || 'Default',
          selected: true,
          addedAt: new Date().toISOString()
        };
        newCart.push(newItem);
        
        // Also add to selected items
        setSelectedItems(prev => [...prev, newItem]);
      }
      
      // Update state
      setCart(newCart);
      
      // Save to Firestore
      await saveCartToFirestore(newCart);
      console.log('CartContext: Successfully added item to cart');
    } catch (error) {
      console.error('CartContext: Error in addToCart:', error);
      throw error;
    }
  };

  const removeFromCart = async (productId, navigate) => {
    if (!requireAuth('remove items from cart', navigate)) return;
    
    try {
      // Remove from cart state
      const newCart = cart.filter(item => item.id !== productId);
      setCart(newCart);
      
      // Also remove from selected items
      setSelectedItems(prev => prev.filter(item => item.id !== productId));
      
      // Save to Firestore
      await saveCartToFirestore(newCart);
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  const updateQuantity = async (productId, newQuantity, navigate) => {
    if (!requireAuth('update cart quantity', navigate) || newQuantity < 1) return;

    try {
      // Update in cart state
      const newCart = cart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
      setCart(newCart);
      
      // Also update in selected items if it exists there
      setSelectedItems(prev => 
        prev.map(item =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
      
      // Save to Firestore
      await saveCartToFirestore(newCart);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const toggleItemSelection = async (productId) => {
    try {
      // Find if the item is currently selected
      const isCurrentlySelected = selectedItems.some(item => item.id === productId);
      
      if (isCurrentlySelected) {
        // Remove from selected items
        setSelectedItems(prev => prev.filter(item => item.id !== productId));
      } else {
        // Add to selected items
        const itemToAdd = cart.find(item => item.id === productId);
        if (itemToAdd) {
          setSelectedItems(prev => [...prev, itemToAdd]);
        }
      }
    } catch (error) {
      console.error('Error toggling item selection:', error);
    }
  };

  const selectAllItems = () => {
    setSelectedItems([...cart]);
  };

  const unselectAllItems = () => {
    setSelectedItems([]);
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.discount
        ? item.price * (1 - item.discount / 100)
        : item.price;
      return total + price * item.quantity;
    }, 0);
  };

  const getSelectedItemsTotal = () => {
    return selectedItems.reduce((total, item) => {
      const price = item.discount
        ? item.price * (1 - item.discount / 100)
        : item.price;
      return total + price * item.quantity;
    }, 0);
  };

  const clearCartItems = async (navigate) => {
    if (!requireAuth('clear cart', navigate)) return;
    
    try {
      // Save current cart items to history before clearing
      await saveCartHistory(currentUser.email, cart);
      
      // Clear state
      setCart([]);
      setSelectedItems([]);
      
      // Clear in Firestore
      if (currentUser?.email && cartId) {
        await clearCart(cartId);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const removeSelectedItems = async () => {
    try {
      // Get IDs of selected items
      const selectedIds = selectedItems.map(item => item.id);
      
      // Filter out selected items from cart
      const newCart = cart.filter(item => !selectedIds.includes(item.id));
      
      // Update state
      setCart(newCart);
      setSelectedItems([]);
      
      // Save to Firestore
      await saveCartToFirestore(newCart);
    } catch (error) {
      console.error('Error removing selected items:', error);
    }
  };

  const value = {
    cart,
    loading,
    selectedItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    toggleItemSelection,
    selectAllItems,
    unselectAllItems,
    getCartCount,
    getCartTotal,
    getSelectedItemsTotal,
    clearCart: clearCartItems,
    removeSelectedItems
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
