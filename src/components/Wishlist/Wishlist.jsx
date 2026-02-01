import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaArrowRight, FaShoppingCart, FaTrash, FaEye, FaShare, FaSpinner } from "react-icons/fa";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import LoginPrompt from "../LoginPrompt/LoginPrompt";
import "./Wishlist.css";

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to get the first image from a comma-separated list
  const getFirstImage = (imageField) => {
    if (!imageField) return '/placeholder-image.webp';
    const imagesArr = imageField.split(',').map(img => img.trim()).filter(Boolean);
    if (imagesArr.length > 0) {
      return imagesArr[0].startsWith('/') ? imagesArr[0] : `/${imagesArr[0]}`;
    }
    return '/placeholder-image.webp';
  };

  // Function to count images in a comma-separated string
  const countImages = (imageUrl) => {
    if (!imageUrl) return 0;
    return imageUrl.includes(',') ? imageUrl.split(',').length : 1;
  };

  useEffect(() => {
    console.log('[Wishlist Component] Current wishlist state:', wishlist);
    console.log('[Wishlist Component] User authentication state:', { isAuthenticated, userEmail: user?.email });
  }, [wishlist, isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div className="wishlist-container">
        <LoginPrompt message="Please login to view your wishlist items." />
      </div>
    );
  }

  const handleAddToCart = async (product) => {
    try {
      setLoading(true);
      setError(null);
      console.log('[Wishlist Component] Adding to cart:', product);
      await addToCart(product);
      console.log('[Wishlist Component] Successfully added to cart, removing from wishlist');
      await removeFromWishlist(product.productId);
    } catch (error) {
      console.error('[Wishlist Component] Error in handleAddToCart:', error);
      setError('Failed to add item to cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (product) => {
    setSelectedProduct(product);
    setShowShareModal(true);
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      setLoading(true);
      setError(null);
      await removeFromWishlist(productId);
    } catch (error) {
      console.error('[Wishlist Component] Error removing from wishlist:', error);
      setError('Failed to remove item from wishlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (wishlist.length === 0) {
    return (
      <div className="wishlist-empty">
        <div className="empty-wishlist-icon">
          <FaHeart />
        </div>
        <h2>Your Wishlist is Empty</h2>
        <p>Save items you love and come back to them later!</p>
        <Link to="/all-products" className="continue-shopping-btn">
          EXPLORE PRODUCTS <FaArrowRight />
        </Link>
      </div>
    );
  }

  return (
    <div className="wishlist-container">
      {error && (
        <div className="wishlist-error">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="wishlist-header">
        <h2>
          <FaHeart className="wishlist-title-icon" />
          My Wishlist ({wishlist.length} {wishlist.length === 1 ? "item" : "items"})
        </h2>
        <Link to="/all-products" className="continue-shopping-link">
          <FaArrowRight /> Continue Shopping
        </Link>
      </div>

      <div className="wishlist-items">
        {wishlist.map((item) => {
          const imageUrl = getFirstImage(item.image);
          const totalImages = countImages(item.image);
          
          return (
            <div key={item.id} className="wishlist-item">
              <div className="wishlist-item-image">
                <img 
                  src={imageUrl} 
                  alt={item.productName} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-image.webp';
                  }}
                />
                {totalImages > 1 && (
                  <div className="image-count-badge">
                    +{totalImages - 1}
                  </div>
                )}
                <div className="wishlist-item-actions">
                  <button
                    className="quick-remove-btn"
                    onClick={() => handleRemoveFromWishlist(item.productId)}
                    title="Remove from wishlist"
                    disabled={loading}
                  >
                    {loading ? <FaSpinner className="spinner" /> : <FaTrash />}
                  </button>
                  {/* <button
                    className="quick-view-btn"
                    onClick={() => window.location.href = `/product/${item.id}`}
                    title="Quick view"
                  >
                    <FaEye />
                  </button> */}
                  <button
                    className="share-btn"
                    onClick={() => handleShare(item)}
                    title="Share"
                  >
                    <FaShare />
                  </button>
                </div>
              </div>
              <div className="wishlist-item-details">
                <Link to={`/product/${item.id}`} className="wishlist-item-name">
                  {item.productName}
                </Link>
                <div className="wishlist-item-category">{item.category}</div>
                <div className="wishlist-item-price">
                  <span className="regular-price">
                    ₹{Number(item.price).toFixed(2)}
                  </span>
                  {item.discount > 0 && (
                    <span className="discount-badge">
                      {item.discount}% OFF
                    </span>
                  )}
                </div>
                {/* <div className="wishlist-item-actions">
                  <button
                    className="add-to-cart-btn"
                    onClick={() => handleAddToCart(item)}
                    disabled={loading}
                  >
                    {loading ? <FaSpinner className="spinner" /> : <FaShoppingCart />} 
                    
                  </button>
                  <Link to={`/product/${item.productId}`} className="view-details-btn">
                    
                  </Link>
                </div> */}
              </div>
            </div>
          );
        })}
      </div>

      {showShareModal && selectedProduct && (
        <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal-content" onClick={e => e.stopPropagation()}>
            <h3>Share this product</h3>
            <div className="share-options">
              <button onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/product/${selectedProduct.productId}`);
                alert('Link copied to clipboard!');
                setShowShareModal(false);
              }}>
                Copy Link
              </button>
              <button onClick={() => {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.origin}/product/${selectedProduct.productId}`);
                setShowShareModal(false);
              }}>
                Share on Facebook
              </button>
              <button onClick={() => {
                window.open(`https://twitter.com/intent/tweet?url=${window.location.origin}/product/${selectedProduct.productId}`);
                setShowShareModal(false);
              }}>
                Share on Twitter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
