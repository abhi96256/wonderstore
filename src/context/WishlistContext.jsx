import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { getUserWishlist, addToWishlist as addToWishlistFirestore, removeFromWishlist as removeFromWishlistFirestore, isInWishlist as checkWishlistStatusFirestore } from "../firebase/firestore";

const WishlistContext = createContext();

export const useWishlist = () => {
  return useContext(WishlistContext);
};

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  // Load wishlist when user changes
  useEffect(() => {
    const fetchWishlist = async () => {
      if (user?.email) {
        try {
          console.log('[WishlistContext] Fetching wishlist for:', user.email);
          const wishlistItems = await getUserWishlist(user.email);
          console.log('[WishlistContext] Fetched wishlist items:', wishlistItems);
          setWishlist(wishlistItems);
        } catch (error) {
          console.error('[WishlistContext] Error fetching wishlist:', error);
          setWishlist([]);
        }
      } else {
        setWishlist([]);
      }
    };

    fetchWishlist();
  }, [user]);

  const addToWishlist = async (product) => {
    if (!user?.email) {
      console.log('[WishlistContext] No user logged in, cannot add to wishlist');
      return;
    }

    try {
      console.log('[WishlistContext] Adding product to wishlist:', {
        userEmail: user.email,
        productId: product.id,
        productName: product.product_name
      });

      const wishlistItem = await addToWishlistFirestore(user.email, product);
      console.log('[WishlistContext] Added to wishlist:', wishlistItem);
      setWishlist(prev => [...prev, wishlistItem]);
    } catch (error) {
      console.error('[WishlistContext] Error adding to wishlist:', error);
      throw error;
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!user?.email) {
      console.log('[WishlistContext] No user logged in, cannot remove from wishlist');
      return;
    }

    try {
      console.log('[WishlistContext] Removing from wishlist:', {
        userEmail: user.email,
        productId
      });

      await removeFromWishlistFirestore(user.email, productId);
      console.log('[WishlistContext] Removed from wishlist successfully');
      setWishlist(prev => prev.filter(item => item.productId !== productId));
    } catch (error) {
      console.error('[WishlistContext] Error removing from wishlist:', error);
      throw error;
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.productId === productId);
  };

  const value = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
