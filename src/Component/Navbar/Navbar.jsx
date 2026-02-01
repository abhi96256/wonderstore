import React, { useState, useRef, useEffect } from "react";
import "./Navbar.css";
import { FaSearch, FaShoppingCart, FaHeart, FaBars, FaTimes } from "react-icons/fa";
import { FiShoppingBag } from "react-icons/fi";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext.jsx";
import { useWishlist } from "../../context/WishlistContext.jsx";
import UserDashboard from "../UserDashboard/UserDashboard";
import { useAuthRedirect } from '../../utils/authUtils';
import LoginPrompt from "../../components/LoginPrompt/LoginPrompt";
import { db } from '../../firebase/config';
import { collection, getDocs } from 'firebase/firestore';

function Navbar() {
  const { getCartCount } = useCart();
  const { wishlist } = useWishlist();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const { requireAuth, showLoginPrompt, setShowLoginPrompt } = useAuthRedirect();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(1550);
  const [promptMsg, setPromptMsg] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 480);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const products = [];
        querySnapshot.forEach((doc) => {
          products.push({ id: doc.id, ...doc.data() });
        });
        setAllProducts(products);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };
    fetchProducts();
  }, []);

  // Filter products based on search query
  const filteredProducts = allProducts.filter(
    (product) =>
      searchQuery &&
      (product.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase()))
  ).slice(0, 5); // Limit to 5 results

  const words = ["Search Products", "Explore Collections"];

  useEffect(() => {
    let timeout;
    const currentWord = words[currentWordIndex];

    if (isDeleting) {
      setTypingText(currentWord.substring(0, typingText.length - 1));
      setTypingSpeed(1150);
    } else {
      setTypingText(currentWord.substring(0, typingText.length + 1));
      setTypingSpeed(1150);
    }

    if (!isDeleting && typingText === currentWord) {
      timeout = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && typingText === "") {
      setIsDeleting(false);
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
    }

    timeout = setTimeout(() => {
      if (isDeleting) {
        setTypingText(currentWord.substring(0, typingText.length - 1));
      } else {
        setTypingText(currentWord.substring(0, typingText.length + 1));
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [typingText, isDeleting, currentWordIndex]);

  // Handle click outside to close dropdown and mobile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu when clicking on a link
  const handleMobileNavClick = () => {
    setIsMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/all-products?search=${encodeURIComponent(searchQuery)}`);
      setShowDropdown(false);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    if (!requireAuth('view wishlist')) {
      setShowLoginPrompt(true);
      return;
    }
    navigate('/wishlist');
    setIsMenuOpen(false);
  };

  const handleCartClick = (e) => {
    e.preventDefault();
    if (!requireAuth('view cart')) {
      setShowLoginPrompt(true);
      return;
    }
    navigate('/cart');
    setIsMenuOpen(false);
  };

  const handleCloseLoginPrompt = () => {
    setShowLoginPrompt(false);
  };

  const showActionPrompt = (msg) => {
    setPromptMsg(msg);
    setShowPrompt(true);
    setTimeout(() => setShowPrompt(false), 2000);
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.detail && e.detail.msg) showActionPrompt(e.detail.msg);
    };
    window.addEventListener('show-action-prompt', handler);
    return () => window.removeEventListener('show-action-prompt', handler);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <>
      <div className="navbar">
        <div className="navbar-container">
          {/* Mobile Hamburger Menu */}
          {isMobile && (
            <button
              className="mobile-menu-toggle"
              aria-label="Toggle menu"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          )}

          {/* Desktop Navigation Links */}
          {!isMobile && (
            <div className="navbar-left">
              <NavLink to="/new-arrivals" className="nav-link">New Arrivals</NavLink>
              <NavLink to="/all-products" className="nav-link">All Products</NavLink>
              <NavLink to="/featured-stories" className="nav-link">Featured Stories</NavLink>
              <NavLink to="/contact" className="nav-link">Contact Us</NavLink>
            </div>
          )}

          <div className="navbar-center">
            <Link
              to="/"
              className="logo"
              onClick={async (e) => {
                handleMobileNavClick();

                // Hidden Logic: 4 consecutive clicks to become admin if email starts with 'admin'
                const now = Date.now();
                const clicks = window.logoClicks || [];
                // Remove clicks older than 2 seconds
                const recentClicks = clicks.filter(t => now - t < 2000);
                recentClicks.push(now);
                window.logoClicks = recentClicks;

                if (recentClicks.length >= 4) {
                  const { getAuth } = await import('firebase/auth');
                  const auth = getAuth();
                  const user = auth.currentUser;

                  if (user && user.email && user.email.toLowerCase().startsWith('admin')) {
                    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
                    const db = getFirestore();

                    if (confirm("Developer Mode: Promote current user to Admin?")) {
                      try {
                        await updateDoc(doc(db, 'users', user.uid), { isAdmin: true });
                        alert("Success! You are now an Admin. Reloading...");
                        window.location.reload();
                      } catch (err) {
                        alert("Error promoting user: " + err.message);
                      }
                    }
                    // Reset clicks
                    window.logoClicks = [];
                  }
                }
              }}
            >
              <img src="/logo.png" alt="UniqueStore" className="navbar-logo-image" style={{ height: '84px', width: 'auto' }} />
            </Link>
          </div>

          <div className="navbar-right">
            {/* Mobile Search Toggle */}
            {isMobile && (
              <button
                className="mobile-search-toggle"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label="Toggle search"
              >
                <FaSearch />
              </button>
            )}

            {/* Desktop Search Bar */}
            {!isMobile && (
              <div className="search-bar" ref={searchRef}>
                <form onSubmit={handleSearch}>
                  <input
                    type="text"
                    placeholder={typingText}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => {
                      if (searchQuery) setShowDropdown(true);
                    }}
                  />
                  <button type="submit" className="search-btn">
                    <FaSearch size={14} />
                  </button>
                </form>

                {/* Search Results Dropdown */}
                {showDropdown && searchQuery && (
                  <div className="search-results-dropdown">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="search-result-item"
                        onClick={() => {
                          navigate(`/product/${product.id}`);
                          setShowDropdown(false);
                          setSearchQuery("");
                        }}
                      >
                        <img
                          src={product.image ? '/' + product.image.split(',')[0].trim() : ''}
                          alt={product.name}
                          className="search-result-image"
                        />
                        <div className="search-result-info">
                          <div className="search-result-name">{product.product_name}</div>
                          <div className="search-result-price">₹{product.mrp}</div>
                        </div>
                      </div>
                    ))}

                    {filteredProducts.length === 0 && (
                      <div className="no-results">No products found</div>
                    )}
                  </div>
                )}
              </div>
            )}

            <span className="icon-wrapper">
              <Link to="/wishlist" className="" aria-label="Wishlist" onClick={handleWishlistClick}>
                <FaHeart style={{ color: '#333' }} />
                {wishlist.length > 0 && (
                  <span className="badge wishlist-badge">{wishlist.length}</span>
                )}
              </Link>
            </span>
            <span className="icon-wrapper">
              <Link to="/cart" className="" aria-label="Shopping Cart" onClick={handleCartClick}>
                <FiShoppingBag style={{ color: '#333' }} />
                {getCartCount() > 0 && (
                  <span className="badge cart-badge">{getCartCount()}</span>
                )}
              </Link>
            </span>
            <UserDashboard />
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isMobile && isSearchOpen && (
          <div className="mobile-search-container">
            <button
              className="mobile-search-close"
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery("");
                setShowDropdown(false);
              }}
              aria-label="Close search"
            >
              <FaTimes />
            </button>
            <div className="search-bar mobile-search" ref={searchRef}>
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => {
                    if (searchQuery) setShowDropdown(true);
                  }}
                  autoFocus
                />
                <button type="submit" className="search-btn">
                  <FaSearch size={14} />
                </button>
              </form>

              {/* Mobile Search Results Dropdown */}
              {showDropdown && searchQuery && (
                <div className="search-results-dropdown mobile-search-dropdown">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="search-result-item"
                      onClick={() => {
                        navigate(`/product/${product.id}`);
                        setShowDropdown(false);
                        setSearchQuery("");
                        setIsSearchOpen(false);
                      }}
                    >
                      <img
                        src={product.image ? '/' + product.image.split(',')[0].trim() : ''}
                        alt={product.name}
                        className="search-result-image"
                      />
                      <div className="search-result-info">
                        <div className="search-result-name">{product.product_name}</div>
                        <div className="search-result-price">₹{product.mrp}</div>
                      </div>
                    </div>
                  ))}

                  {filteredProducts.length === 0 && (
                    <div className="no-results">No products found</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Menu Overlay */}
        {isMobile && isMenuOpen && (
          <div className="mobile-menu-overlay" onClick={() => setIsMenuOpen(false)}>
            <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
              <div className="mobile-menu-header">
                <h3>Menu</h3>
                <button
                  className="mobile-menu-close"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <FaTimes />
                </button>
              </div>
              <nav className="mobile-nav">
                <NavLink to="/new-arrivals" className="mobile-nav-link" onClick={handleMobileNavClick}>
                  New Arrivals
                </NavLink>
                <NavLink to="/all-products" className="mobile-nav-link" onClick={handleMobileNavClick}>
                  All Products
                </NavLink>
                <NavLink to="/featured-stories" className="mobile-nav-link" onClick={handleMobileNavClick}>
                  Featured Stories
                </NavLink>
                <NavLink to="/contact" className="mobile-nav-link" onClick={handleMobileNavClick}>
                  Contact Us
                </NavLink>
              </nav>
            </div>
          </div>
        )}
      </div>

      {showLoginPrompt && (
        <div className="login-prompt-overlay" onClick={handleCloseLoginPrompt}>
          <div className="login-prompt-wrapper" onClick={(e) => e.stopPropagation()}>
            <LoginPrompt message="Please login to access your cart and wishlist items." />
          </div>
        </div>
      )}
      {showPrompt && (
        <div className="action-prompt">
          {promptMsg}
        </div>
      )}
    </>
  );
}

export default Navbar;
