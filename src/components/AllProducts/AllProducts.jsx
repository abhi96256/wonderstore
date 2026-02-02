import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext.jsx";
import { useCart } from "../../context/CartContext.jsx";
import { addReferrerToUrl } from "../../utils/navigationUtils.js";
import { FaShoppingBag, FaHeart, FaShoppingCart, FaEye, FaTimes, FaRegHeart, FaTshirt, FaSearch, FaChevronRight, FaStar, FaStarHalfAlt, FaRegStar, FaFilter, FaSort, FaTags, FaArrowRight, FaSlidersH, FaDollarSign, FaSortAmountDown, FaBed, FaCouch, FaGift, FaBoxOpen } from "react-icons/fa";
import { GiLargeDress, GiRunningShoe, GiWatch, GiHeartNecklace, GiTrousers } from "react-icons/gi";
import "./AllProductsStyles.css";
import { db } from '../../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import OptimizedImage from '../../Component/OptimizedImage';


const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [fadeIn, setFadeIn] = useState(false);
  const [quickView, setQuickView] = useState(null);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const [wishlistProductIds, setWishlistProductIds] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null); // 'category', 'sort', 'price', or null

  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';

  // Initialize filter states from URL parameters
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const categoryFromUrl = searchParams.get('category');
    return categoryFromUrl || "All Products";
  });



  const [sortOption, setSortOption] = useState(() => {
    return searchParams.get('sort') || "featured";
  });

  const [visibleItems, setVisibleItems] = useState(12);

  const [priceRange, setPriceRange] = useState(() => {
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    return [
      minPrice ? parseInt(minPrice) : 0,
      maxPrice ? parseInt(maxPrice) : 10000
    ];
  });

  const [minRating, setMinRating] = useState(() => {
    const ratingFromUrl = searchParams.get('rating');
    return ratingFromUrl ? parseInt(ratingFromUrl) : 0;
  });

  const [showDiscounted, setShowDiscounted] = useState(() => {
    const discountedFromUrl = searchParams.get('discounted');
    return discountedFromUrl === 'true';
  });

  const [inStockOnly, setInStockOnly] = useState(() => {
    const inStockFromUrl = searchParams.get('inStock');
    return inStockFromUrl === 'true';
  });

  // Function to update URL with current filter state
  const updateURL = (newFilters) => {
    const params = new URLSearchParams(location.search);

    // Update or remove parameters based on new filters
    if (newFilters.category && newFilters.category !== "All Products") {
      params.set('category', newFilters.category);
    } else {
      params.delete('category');
    }



    if (newFilters.sort && newFilters.sort !== "featured") {
      params.set('sort', newFilters.sort);
    } else {
      params.delete('sort');
    }

    if (newFilters.minPrice !== undefined && newFilters.minPrice > 0) {
      params.set('minPrice', newFilters.minPrice.toString());
    } else {
      params.delete('minPrice');
    }

    if (newFilters.maxPrice !== undefined && newFilters.maxPrice < 10000) {
      params.set('maxPrice', newFilters.maxPrice.toString());
    } else {
      params.delete('maxPrice');
    }

    if (newFilters.rating && newFilters.rating > 0) {
      params.set('rating', newFilters.rating.toString());
    } else {
      params.delete('rating');
    }

    if (newFilters.discounted) {
      params.set('discounted', 'true');
    } else {
      params.delete('discounted');
    }

    if (newFilters.inStock) {
      params.set('inStock', 'true');
    } else {
      params.delete('inStock');
    }

    // Update URL without causing a page reload
    const newURL = `${location.pathname}?${params.toString()}`;
    if (newURL !== location.pathname + location.search) {
      navigate(newURL, { replace: true });
    }
  };

  // Track if we're updating from URL to prevent infinite loops
  const [isUpdatingFromURL, setIsUpdatingFromURL] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Update URL whenever filters change (but only if they're not from URL)
  useEffect(() => {
    if (isInitialized && !isUpdatingFromURL) {
      updateURL({
        category: selectedCategory,
        sort: sortOption,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        rating: minRating,
        discounted: showDiscounted,
        inStock: inStockOnly
      });
    } else if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [selectedCategory, sortOption, priceRange, minRating, showDiscounted, inStockOnly, isInitialized, isUpdatingFromURL]);

  // Handle URL parameter changes (e.g., when navigating back)
  useEffect(() => {
    if (!isInitialized) return; // Skip during initial load

    const newSearchParams = new URLSearchParams(location.search);

    const newCategory = newSearchParams.get('category') || "All Products";

    const newSort = newSearchParams.get('sort') || "featured";
    const newMinPrice = newSearchParams.get('minPrice');
    const newMaxPrice = newSearchParams.get('maxPrice');
    const newRating = newSearchParams.get('rating');
    const newDiscounted = newSearchParams.get('discounted');
    const newInStock = newSearchParams.get('inStock');

    // Check if any values have actually changed
    const hasChanges =
      newCategory !== selectedCategory ||
      newSort !== sortOption ||
      (newMinPrice !== null && parseInt(newMinPrice) !== priceRange[0]) ||
      (newMaxPrice !== null && parseInt(newMaxPrice) !== priceRange[1]) ||
      (newRating !== null && parseInt(newRating) !== minRating) ||
      (newDiscounted !== null && (newDiscounted === 'true') !== showDiscounted) ||
      (newInStock !== null && (newInStock === 'true') !== inStockOnly);

    if (hasChanges) {
      setIsUpdatingFromURL(true);

      // Update all states at once
      setSelectedCategory(newCategory);

      setSortOption(newSort);

      if (newMinPrice !== null || newMaxPrice !== null) {
        setPriceRange([
          newMinPrice ? parseInt(newMinPrice) : 0,
          newMaxPrice ? parseInt(newMaxPrice) : 10000
        ]);
      }

      if (newRating !== null) {
        setMinRating(parseInt(newRating));
      }

      if (newDiscounted !== null) {
        setShowDiscounted(newDiscounted === 'true');
      }

      if (newInStock !== null) {
        setInStockOnly(newInStock === 'true');
      }

      // Reset the flag after a short delay
      setTimeout(() => setIsUpdatingFromURL(false), 100);
    }
  }, [location.search, isInitialized]);

  // Fetch products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsArr = [];
        querySnapshot.forEach((doc) => {
          productsArr.push({ id: doc.id, ...doc.data() });
        });
        setProducts(productsArr);
        setError(null);
      } catch (err) {
        setError('Error fetching products. Please try again later.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  console.log('Products data:', products);



  // Filter products based on selected category
  const filteredProducts = products.filter(product => {
    const matchCategory = selectedCategory === "All Products" || product.category === selectedCategory;
    const matchPrice = Number(product.mrp) >= priceRange[0] && Number(product.mrp) <= priceRange[1];
    const matchStock = !inStockOnly || Number(product.inventory) > 0;
    const hasImage = product.image && product.image.trim() !== '';
    return matchCategory && matchPrice && matchStock && hasImage;
  });

  useEffect(() => {
    setFadeIn(true);

    // Only scroll to top if there are no URL parameters (first visit)
    if (!location.search) {
      window.scrollTo(0, 0);
    }

    // Add click outside listener
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }

      // Close dropdowns when clicking outside
      if (!event.target.closest('.category-dropdown') && !event.target.closest('.filter-dropdown')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [location.search]);

  const categories = [
    { id: "all", name: "All Products", icon: <FaShoppingBag /> },
    { id: "Unique Speaker", name: "Unique Speaker", icon: <FaBoxOpen /> },
    { id: "Lamps", name: "Lamps", icon: <FaCouch /> },
    { id: "Humidifier", name: "Humidifier", icon: <FaGift /> },
  ];

  const sortOptions = [
    { id: "featured", name: "Featured" },
    { id: "newest", name: "Newest" },
    { id: "priceAsc", name: "Price: Low to High" },
    { id: "priceDesc", name: "Price: High to Low" },
    { id: "nameAsc", name: "Name: A-Z" },
    { id: "nameDesc", name: "Name: Z-A" },
  ];

  // Count products per category
  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat.id] = products.filter(
      (product) => {
        const hasImage = product.image && product.image.trim() !== '';
        return (cat.id === 'all' || product.category.toLowerCase() === cat.id.toLowerCase()) && hasImage;
      }
    ).length;
    return acc;
  }, {});

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case "newest":
        const dateA = a.createdAt?.toDate?.() || new Date(a.created_at || 0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.created_at || 0);
        return dateB - dateA; // Newest first
      case "priceAsc":
        return Number(a.mrp) - Number(b.mrp);
      case "priceDesc":
        return Number(b.mrp) - Number(a.mrp);
      case "nameAsc":
        return a.product_name.localeCompare(b.product_name);
      case "nameDesc":
        return b.product_name.localeCompare(a.product_name);
      default:
        return 0;
    }
  });

  const handleLoadMore = () => {
    setVisibleItems((prev) => prev + 8);
  };

  const handleImageClick = (image, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is already being applied through the filteredProducts
  };

  const handleAddToCartClick = (product, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    addToCart(product);
    setToastMessage(`{product.name} added to cart!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleAddToWishlistClick = (product, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleQuickView = (product, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setQuickView(product);
  };

  const closeQuickView = () => {
    setQuickView(null);
  };

  const handlePriceChange = (e, index) => {
    const newRange = [...priceRange];
    newRange[index] = parseInt(e.target.value);
    setPriceRange(newRange);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="star-icon filled" />);
    }

    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="star-icon filled" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="star-icon" />);
    }

    return stars;
  };

  // Update the category click handler
  const handleCategoryClick = (category) => {
    setSelectedCategory(category.name);
    setVisibleItems(12);
  };

  const toggleCategoryDropdown = () => {
    setActiveDropdown(activeDropdown === 'category' ? null : 'category');
  };

  return (
    <section className={`products-section ${fadeIn ? 'fade-in' : ''}`}>
      {loading && (
        <>
          <div className="loading-container">
            {/* <div className="loading-spinner"></div> */}
            <div className="loading-text">Loading Products...</div>
            <div className="loading-subtext">Discovering our latest collection for you</div>
          </div>

          {/* Skeleton Loading Cards */}
          <div className="products-container">
            <div className="products-header" style={{ flexDirection: 'column' }}>
              <div className="animated-title">
                {Array.from("Our Collection").map((letter, index) => (
                  <span key={index} className={letter === ' ' ? 'space' : ''} style={{ animationDelay: `${0.1 * index}s` }}>
                    {letter === ' ' ? '\u00A0' : letter}
                  </span>
                ))}
              </div>
              <div className="products-subtitle">
                Discover our curated selection of premium fashion items designed for style and comfort
              </div>
              <div className="products-divider"></div>
            </div>

            <div className="products-main-content">
              <div className="products-content">
                <div className="products-grid">
                  {[...Array(8)].map((_, index) => (
                    <div key={index} className="skeleton-card">
                      <div className="skeleton skeleton-image"></div>
                      <div className="skeleton skeleton-title"></div>
                      <div className="skeleton skeleton-category"></div>
                      <div className="skeleton skeleton-price"></div>
                      <div className="skeleton skeleton-button"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {error && (
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <div className="error-text">Oops! Something went wrong</div>
          <div className="error-subtext">{error}</div>
          <button
            className="retry-button"
            onClick={() => {
              setError(null);
              setLoading(true);
              // Refetch products
              const fetchProducts = async () => {
                try {
                  const querySnapshot = await getDocs(collection(db, 'products'));
                  const productsArr = [];
                  querySnapshot.forEach((doc) => {
                    productsArr.push({ id: doc.id, ...doc.data() });
                  });
                  setProducts(productsArr);
                  setError(null);
                } catch (err) {
                  setError('Error fetching products. Please try again later.');
                  console.error('Error fetching products:', err);
                } finally {
                  setLoading(false);
                }
              };
              fetchProducts();
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Toast notification */}
      {showToast && (
        <div className="products-toast">
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="products-container">
        {/* Hero Header */}
        <div className="products-header" style={{ flexDirection: 'column' }}>
          <div className="animated-title">
            {Array.from("Our Collection").map((letter, index) => (
              <span key={index} className={letter === ' ' ? 'space' : ''} style={{ animationDelay: `${0.1 * index}s` }}>
                {letter === ' ' ? '\u00A0' : letter}
              </span>
            ))}
          </div>
          <div className="products-subtitle">
            Discover our curated selection of premium fashion items designed for style and comfort
          </div>
          <div className="products-divider"></div>
        </div>

        {/* Category Indicator */}
        <div className="category-indicator">
          <div className="category-breadcrumb">
            <div className="category-dropdown">
              <button
                className="category-dropdown-btn"
                onClick={toggleCategoryDropdown}
              >
                <span className="current-category">
                  {selectedCategory === "All Products" ? "All Products" : selectedCategory}

                </span>
                <FaChevronRight className={`dropdown-arrow ${activeDropdown === 'category' ? 'rotated' : ''}`} />
              </button>
              {activeDropdown === 'category' && (
                <div className="category-dropdown-content">
                  {categories.map((category) => (
                    <button
                      key={category.name}
                      className={`category-dropdown-option ${selectedCategory === category.name ? "active" : ""}`}
                      onClick={() => {
                        handleCategoryClick(category);
                        setActiveDropdown(null);
                      }}
                    >
                      <span className="category-dropdown-icon">{category.icon}</span>
                      <span className="category-dropdown-text">{category.name}</span>
                      {category.name !== "Gifting" && (
                        <span className="category-dropdown-count">({categoryCounts[category.id]})</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="products-main-content">
          {/* Side Filters Panel */}
          <div className={`products-filters ${filtersVisible ? 'visible' : ''}`}>
            <div className="filters-header">
              <h3><FaSlidersH /> Filters</h3>
              <button className="close-filters" onClick={() => setFiltersVisible(false)}>×</button>
            </div>

            {/* Mobile Filter Toggle */}
            <div className="mobile-filter-toggle">
              <button
                className="mobile-filter-btn"
                onClick={() => setFiltersVisible(!filtersVisible)}
              >
                <FaSlidersH />
                <span>Advanced Filters</span>
                <FaChevronRight className={`toggle-arrow ${filtersVisible ? 'rotated' : ''}`} />
              </button>
            </div>

            <div className={`filter-content ${filtersVisible ? 'visible' : ''}`}>
              {/* Show rating filter for all categories */}
              <div className="filter-group">
                <h4><FaStar /> Minimum Rating</h4>
                <div className="rating-options">
                  {[4, 3, 2, 1].map((star) => (
                    <label key={star} className="rating-checkbox">
                      <input
                        style={{ width: "fit-content" }}
                        type="radio"
                        name="minRating"
                        value={star}
                        checked={minRating === star}
                        onChange={() => setMinRating(star)}
                      />
                      {star} stars & up
                    </label>
                  ))}
                  <label className="rating-checkbox">
                    <input
                      style={{ width: "fit-content" }}
                      type="radio"
                      name="minRating"
                      value={0}
                      checked={minRating === 0}
                      onChange={() => setMinRating(0)}
                    />
                    Any
                  </label>
                </div>
              </div>



              {/* On Sale & In Stock Only */}
              <div className="filter-group">
                <div className="filter-checkbox-group">
                  <label className="filter-checkbox-label">
                    <input
                      type="checkbox"
                      checked={showDiscounted}
                      onChange={() => setShowDiscounted((v) => !v)}
                    />
                    <span>On Sale</span>
                  </label>
                  <label className="filter-checkbox-label">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={() => setInStockOnly((v) => !v)}
                    />
                    <span>In Stock Only</span>
                  </label>
                </div>
              </div>

              {/* Price Range */}
              <div className="filter-group">
                <h4>Price Range</h4>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  value={priceRange[1]}
                  onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="price-slider"
                />
                <div className="price-range-display">
                  <span>₹{priceRange[0]}</span>
                  <span>₹{priceRange[1]}</span>
                </div>
              </div>

              {/* Sort By */}
              <div className="filter-group">
                <h4><FaSortAmountDown /> Sort By</h4>
                <select
                  className="sort-select"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  {sortOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear All Filters Button */}
              <button className="reset-filters-btn" style={{ marginTop: 16, width: '100%' }}
                onClick={() => {
                  setSelectedCategory('All Products');

                  setMinRating(0);
                  setShowDiscounted(false);
                  setInStockOnly(false);
                  setPriceRange([0, 10000]);
                  setSortOption('featured');
                  // Clear URL parameters
                  navigate(location.pathname, { replace: true });
                }}
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Main Products Grid */}
          <div className="products-content">
            <div className="products-result-stats">
              <div className="results-count">
                Showing {Math.min(visibleItems, sortedProducts.length)} of {sortedProducts.length} products
              </div>
              <div className="sort-mobile">
                <button className="sort-btn" onClick={() => setFiltersVisible(true)}>
                  <FaSort /> Sort
                </button>
                {filtersVisible && (
                  <div className="mobile-sort-dropdown">
                    <div className="mobile-sort-header">
                      <h4><FaSortAmountDown /> Sort By</h4>
                      <button className="close-sort" onClick={() => setFiltersVisible(false)}>
                        <FaTimes />
                      </button>
                    </div>
                    <div className="mobile-sort-options">
                      {sortOptions.map((option) => (
                        <button
                          key={option.id}
                          className={`mobile-sort-option ${sortOption === option.id ? 'active' : ''}`}
                          onClick={() => {
                            setSortOption(option.id);
                            setFiltersVisible(false);
                          }}
                        >
                          {option.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Filter Button */}
              <div className="mobile-filter-button">
                <button
                  className="mobile-filter-trigger"
                  onClick={() => setFiltersVisible(true)}
                >
                  <FaSlidersH />
                  <span>Filters</span>
                </button>
              </div>
            </div>

            <div className="products-grid">
              {sortedProducts.slice(0, visibleItems).map((product) => {
                // Parse the image field for the first image
                let firstImage = '';
                if (product.image) {
                  const imagesArr = product.image.split(',').map(img => img.trim()).filter(Boolean);
                  if (imagesArr.length > 0) {
                    const firstImg = imagesArr[0];
                    firstImage = firstImg.startsWith('/') || firstImg.startsWith('http') ? firstImg : `/${firstImg}`;
                  }
                }
                return (
                  <div
                    key={product.id}
                    className="product-card"
                    onClick={() => navigate(addReferrerToUrl(`/product/${product.id}`, location.pathname + location.search))}
                  >
                    <div className="product-image-container" style={{ aspectRatio: '3/4' }}>
                      <OptimizedImage
                        src={firstImage}
                        alt={product.product_name}
                        className="product-image"
                      />
                      <div className="views-overlay" title="Views">
                        <img src="/Eye3.png" alt="views" className="views-icon-img" />
                        <span>{product.views || 0}</span>
                      </div>

                      <div className="product-actions">
                        <button
                          className="product-action-btn cart-btn"
                          onClick={(e) => handleAddToCartClick(product, e)}
                          title="Add to Cart"
                          disabled={product.inventory <= 0}
                        >
                          <FaShoppingCart />
                        </button>
                        <button
                          className={`product-action-btn wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`}
                          onClick={(e) => handleAddToWishlistClick(product, e)}
                          title={isInWishlist(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                        >
                          {isInWishlist(product.id) ? <FaHeart /> : <FaRegHeart />}
                        </button>
                        <button
                          className="product-action-btn quickview-btn"
                          onClick={(e) => handleQuickView(product, e)}
                          title="Quick View"
                        >
                          <FaEye />
                        </button>
                      </div>
                    </div>

                    <div className="product-info">
                      <h3 className="product-name">{product.product_name}</h3>
                      <p className="product-category">
                        {product.category}
                      </p>
                      <div className="product-price">
                        <span className="current-price">
                          ₹{Number(product.mrp).toFixed(2)}
                        </span>
                      </div>

                      <button className="shop-now-btn">
                        Shop Now <FaArrowRight className="" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {visibleItems < sortedProducts.length && (
              <div className="load-more-container">
                <button className="load-more-btn" onClick={handleLoadMore}>
                  Load More Products...
                </button>
              </div>
            )}

            {sortedProducts.length === 0 && (
              <div className="no-products-found">
                <div className="empty-state">
                  <FaShoppingBag className="empty-icon" />
                  <h3>No products found</h3>
                  <p>Try adjusting your search or filter criteria</p>
                  <button
                    className="reset-filters-btn"
                    onClick={() => {
                      setSelectedCategory("All Products");

                      setSearchQuery("");
                      setPriceRange([0, 10000]);
                      // Clear URL parameters
                      navigate(location.pathname, { replace: true });
                    }}
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <div className="image-modal" onClick={handleCloseModal}>
            <div className="modal-content">
              <button className="close-modal" onClick={handleCloseModal}>
                ×
              </button>
              <img src={selectedImage} alt="Product Preview" />
            </div>
          </div>
        )}

        {/* Quick View Modal */}
        <div
          className={`quickview-modal ${quickView ? "active" : ""}`}
          onClick={closeQuickView}
        >
          {quickView && (
            <div
              className="quickview-content"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="quickview-close" onClick={closeQuickView}>
                <FaTimes />
              </button>

              <div className="quickview-grid">
                <div className="quickview-image">
                  <img src={quickView.image} alt={quickView.name} />
                  {quickView.discount && (
                    <div className="quickview-badge">-{quickView.discount}%</div>
                  )}
                </div>

                <div className="quickview-details">
                  <h2 className="quickview-name">{quickView.name}</h2>

                  <div className="quickview-category">
                    <FaTags className="category-icon" />
                    {quickView.category.charAt(0).toUpperCase() + quickView.category.slice(1)}
                  </div>

                  <div className="quickview-price">
                    {quickView.discount ? (
                      <>
                        <span className="current-price">
                          ₹{(quickView.price * (1 - quickView.discount / 100)).toFixed(2)}
                        </span>
                        <span className="original-price">
                          ₹{quickView.price.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="current-price">₹{quickView.price.toFixed(2)}</span>
                    )}
                  </div>

                  {quickView.rating && (
                    <div className="quickview-rating">
                      <div className="stars">
                        {renderStars(quickView.rating)}
                      </div>
                      {quickView.reviewsCount && (
                        <span className="reviews-count">({quickView.reviewsCount} reviews)</span>
                      )}
                    </div>
                  )}

                  <div className="quickview-description">
                    {quickView.description ||
                      "This premium product combines style, comfort and durability. Perfect for everyday use and special occasions alike."}
                  </div>

                  {quickView.sizes && (
                    <div className="quickview-sizes">
                      <h4>Available Sizes</h4>
                      <div className="size-options">
                        {quickView.sizes.map((size, index) => (
                          <span key={index} className="size-option">{size}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {quickView.colors && (
                    <div className="quickview-colors">
                      <h4>Available Colors</h4>
                      <div className="color-options">
                        {quickView.colors.map((color, index) => (
                          <div
                            key={index}
                            className="color-option"
                            style={{ backgroundColor: color.toLowerCase() }}
                            title={color}
                          ></div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="quickview-actions">
                    <button
                      className="add-to-cart-btn"
                      onClick={() => {
                        handleAddToCartClick(quickView);
                        closeQuickView();
                      }}
                    >
                      <FaShoppingCart /> Add to Cart
                    </button>

                    <button
                      className={`add-to-wishlist-btn ${isInWishlist(quickView.id) ? 'active' : ''}`}
                      onClick={() => handleAddToWishlistClick(quickView)}
                    >
                      {isInWishlist(quickView.id) ? <FaHeart /> : <FaRegHeart />}
                      {isInWishlist(quickView.id) ? 'In Wishlist' : 'Add to Wishlist'}
                    </button>
                  </div>

                  <Link
                    to={`/product/${quickView.id}`}
                    className="view-details-btn"
                    onClick={closeQuickView}
                  >
                    View Full Details <FaChevronRight className="arrow-icon" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Filter Backdrop */}
        {filtersVisible && (
          <div
            className="mobile-filter-backdrop"
            onClick={() => setFiltersVisible(false)}
          ></div>
        )}
      </div>
    </section>
  );
};

export default AllProducts;
