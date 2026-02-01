import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { FiHeart, FiFilter, FiX } from "react-icons/fi";
import { BsGrid, BsList } from "react-icons/bs";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import "./CategoryProducts.css";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { FaHeart } from "react-icons/fa";

const FilterSection = styled.aside`
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-right: 20px;
  width: 280px;

  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;

    h2 {
      font-size: 1.2rem;
      font-weight: 600;
      color: #333;
      margin: 0;
    }

    .clear-all {
      font-size: 0.9rem;
      color: #007bff;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .filter-group {
    margin-bottom: 24px;

    h3 {
      font-size: 1rem;
      color: #555;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .count {
        font-size: 0.8rem;
        color: #777;
        font-weight: normal;
      }
    }
  }

  .price-range {
    .range-inputs {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-top: 12px;

      input {
        width: 100px;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 0.9rem;
      }

      span {
        color: #666;
      }
    }

    .range-slider {
      margin-top: 15px;
      width: 100%;

      input[type="range"] {
        width: 100%;
        height: 4px;
        -webkit-appearance: none;
        background: #e0e0e0;
        border-radius: 2px;
        outline: none;

        &::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          background: #007bff;
          border-radius: 50%;
          cursor: pointer;
          transition: background 0.15s ease-in-out;

          &:hover {
            background: #0056b3;
          }
        }
      }
    }
  }

  .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 200px;
    overflow-y: auto;
    padding-right: 10px;

    label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 6px 8px;
      border-radius: 4px;
      transition: background-color 0.2s;

      &:hover {
        background-color: #f5f5f5;
      }

      input[type="checkbox"] {
        width: 16px;
        height: 16px;
        border: 2px solid #ddd;
        border-radius: 3px;
        cursor: pointer;
      }

      span {
        font-size: 0.9rem;
        color: #444;
      }

      .count {
        margin-left: auto;
        font-size: 0.8rem;
        color: #777;
      }
    }
  }

  &.show {
    transform: translateX(0);
  }

  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.3s ease-in-out;
    margin: 0;
    border-radius: 0;
    width: 85%;
    max-width: 350px;
    overflow-y: auto;
  }
`;

const CategoryProducts = () => {
  const { categoryName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();

  // Initialize filter states from URL parameters
  const [selectedFilters, setSelectedFilters] = useState(() => {
    const priceRangeFromUrl = searchParams.get('priceRange');
    const stylesFromUrl = searchParams.get('styles');
    const materialsFromUrl = searchParams.get('materials');
    const brandsFromUrl = searchParams.get('brands');
    const showDiscountedFromUrl = searchParams.get('showDiscounted');

    return {
      priceRange: priceRangeFromUrl ? JSON.parse(priceRangeFromUrl) : [0, 150000],
      styles: stylesFromUrl ? JSON.parse(stylesFromUrl) : [],
      materials: materialsFromUrl ? JSON.parse(materialsFromUrl) : [],
      brands: brandsFromUrl ? JSON.parse(brandsFromUrl) : [],
      showDiscounted: showDiscountedFromUrl === 'true',
    };
  });

  // Updated product categories
  const categories = {
    "luxury-watches": {
      name: "Luxury Watches",
      subcategories: ["analog", "digital", "smart-watches"],
    },
    "womens-fashion": {
      name: "Women's Fashion",
      subcategories: ["dresses", "casual-wear", "evening-gowns"],
    },
    accessories: {
      name: "Accessories",
      subcategories: ["bags", "jewelry"],
    },
    footwear: {
      name: "Footwear",
      subcategories: ["heels", "sneakers", "boots"],
    },
  };

  // Format category name for display
  const formatCategoryName = (name) => {
    return name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Helper function to calculate discounted price
  const calculateDiscountedPrice = (originalPrice, discountPercentage) => {
    if (!discountPercentage || discountPercentage <= 0) return originalPrice;
    return originalPrice * (1 - discountPercentage / 100);
  };

  // Helper function to format price with discount
  const formatPriceWithDiscount = (price, discount) => {
    const discountedPrice = calculateDiscountedPrice(price, discount);
    if (discount && discount > 0) {
      return {
        original: price.toLocaleString(),
        discounted: discountedPrice.toFixed(0),
        discountPercentage: discount
      };
    }
    return {
      original: null,
      discounted: price.toLocaleString(),
      discountPercentage: 0
    };
  };

  // Get relevant brands based on category
  const getRelevantBrands = () => {
    const uniqueBrands = new Set();
    products.forEach((product) => {
      uniqueBrands.add(product.brand);
    });
    return Array.from(uniqueBrands);
  };

  // Get style options based on category
  const getStyleOptions = () => {
    if (categoryName === "luxury-watches") {
      return ["Luxury", "Classic", "Sports", "Modern", "Minimalist"];
    }
    return ["Casual", "Formal", "Party", "Ethnic", "Beach"];
  };

  // Get material options based on category
  const getMaterialOptions = () => {
    if (categoryName === "luxury-watches") {
      return ["Steel", "Gold", "Rose Gold", "Titanium", "Ceramic"];
    }
    return ["Cotton", "Silk", "Linen", "Denim", "Polyester"];
  };

  // Function to update URL with current filter state
  const updateURL = (newFilters) => {
    const params = new URLSearchParams(location.search);

    if (newFilters.priceRange && (newFilters.priceRange[0] !== 0 || newFilters.priceRange[1] !== 150000)) {
      params.set('priceRange', JSON.stringify(newFilters.priceRange));
    } else {
      params.delete('priceRange');
    }

    if (newFilters.styles && newFilters.styles.length > 0) {
      params.set('styles', JSON.stringify(newFilters.styles));
    } else {
      params.delete('styles');
    }

    if (newFilters.materials && newFilters.materials.length > 0) {
      params.set('materials', JSON.stringify(newFilters.materials));
    } else {
      params.delete('materials');
    }

    if (newFilters.brands && newFilters.brands.length > 0) {
      params.set('brands', JSON.stringify(newFilters.brands));
    } else {
      params.delete('brands');
    }

    if (newFilters.showDiscounted) {
      params.set('showDiscounted', 'true');
    } else {
      params.delete('showDiscounted');
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

  // Update URL whenever filters change
  useEffect(() => {
    if (isInitialized && !isUpdatingFromURL) {
      updateURL(selectedFilters);
    } else if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [selectedFilters, isInitialized, isUpdatingFromURL]);

  // Handle URL parameter changes (e.g., when navigating back)
  useEffect(() => {
    if (!isInitialized) return; // Skip during initial load

    const newSearchParams = new URLSearchParams(location.search);

    const newPriceRange = newSearchParams.get('priceRange');
    const newStyles = newSearchParams.get('styles');
    const newMaterials = newSearchParams.get('materials');
    const newBrands = newSearchParams.get('brands');
    const newShowDiscounted = newSearchParams.get('showDiscounted');

    // Check if any values have actually changed
    let hasChanges = false;
    const newFilters = { ...selectedFilters };

    if (newPriceRange !== null) {
      const parsedPriceRange = JSON.parse(newPriceRange);
      if (JSON.stringify(parsedPriceRange) !== JSON.stringify(selectedFilters.priceRange)) {
        newFilters.priceRange = parsedPriceRange;
        hasChanges = true;
      }
    }

    if (newStyles !== null) {
      const parsedStyles = JSON.parse(newStyles);
      if (JSON.stringify(parsedStyles) !== JSON.stringify(selectedFilters.styles)) {
        newFilters.styles = parsedStyles;
        hasChanges = true;
      }
    }

    if (newMaterials !== null) {
      const parsedMaterials = JSON.parse(newMaterials);
      if (JSON.stringify(parsedMaterials) !== JSON.stringify(selectedFilters.materials)) {
        newFilters.materials = parsedMaterials;
        hasChanges = true;
      }
    }

    if (newBrands !== null) {
      const parsedBrands = JSON.parse(newBrands);
      if (JSON.stringify(parsedBrands) !== JSON.stringify(selectedFilters.brands)) {
        newFilters.brands = parsedBrands;
        hasChanges = true;
      }
    }

    if (newShowDiscounted !== null) {
      const parsedShowDiscounted = newShowDiscounted === 'true';
      if (parsedShowDiscounted !== selectedFilters.showDiscounted) {
        newFilters.showDiscounted = parsedShowDiscounted;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      setIsUpdatingFromURL(true);
      setSelectedFilters(newFilters);
      // Reset the flag after a short delay
      setTimeout(() => setIsUpdatingFromURL(false), 100);
    }
  }, [location.search, isInitialized]);

  // Fetch products from backend with discount data
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Initialize filtered products array
        // Also fetch regular products if needed
        const { collection, getDocs } = await import('firebase/firestore');
        const { db } = await import('../../firebase/config');

        const regularProductsSnapshot = await getDocs(collection(db, 'products'));
        const regularProducts = [];
        regularProductsSnapshot.forEach(doc => {
          const productData = doc.data();
          // Normalize product data structure for consistent handling
          const normalizedProduct = {
            id: doc.id,
            name: productData.product_name || productData.name || 'Unnamed Product',
            price: productData.mrp || productData.price || 0,
            discount: productData.discount || 0,
            image: productData.image || '',
            brand: productData.brand || '',
            style: productData.style || '',
            material: productData.material || '',
            category: productData.category || '',
            subcategory: productData.sub_category || productData.subcategory || '',
            product_code: productData.product_code || '',
            product_description: productData.product_description || '',
            inventory: productData.inventory || 0,
            featured: productData.featured || false,
            views: productData.views || 0
          };
          regularProducts.push(normalizedProduct);
        });

        // Combine both product types
        const allProducts = [...regularProducts];

        // Filter products based on category and subcategory
        const filteredProducts = allProducts.filter((product) => {
          if (categoryName === "all") return true;
          return (
            product.category === categoryName ||
            product.subcategory === categoryName
          );
        });

        // Sort products by creation date (newest first)
        const sortedProducts = filteredProducts.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.created_at || 0);
          const dateB = b.createdAt?.toDate?.() || new Date(b.created_at || 0);
          return dateB - dateA; // Newest first
        });

        console.log("Filtered products with discounts:", sortedProducts.map(p => ({
          name: p.name,
          price: p.price,
          discount: p.discount,
          category: p.category
        })));
        setProducts(sortedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        // Fallback to mock data if backend fails
        const mockProducts = [
          {
            id: 1,
            name: "Rolex Submariner",
            price: 89999,
            discount: 10,
            image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800",
            brand: "Rolex",
            style: "Luxury",
            material: "Steel",
            category: "luxury-watches",
            subcategory: "analog",
          },
          {
            id: 2,
            name: "Patek Philippe Nautilus",
            price: 125000,
            discount: 15,
            image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800",
            brand: "Patek Philippe",
            style: "Classic",
            material: "Gold",
            category: "luxury-watches",
            subcategory: "analog",
          },
          {
            id: 3,
            name: "Omega Seamaster",
            price: 75000,
            discount: 20,
            image: "https://images.unsplash.com/photo-1548171915-e79a380a2a4b?w=800",
            brand: "Omega",
            style: "Sports",
            material: "Steel",
            category: "luxury-watches",
            subcategory: "analog",
          }
        ];

        const filteredMockProducts = mockProducts.filter((product) => {
          if (categoryName === "all") return true;
          return (
            product.category === categoryName ||
            product.subcategory === categoryName
          );
        });

        setProducts(filteredMockProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryName]);

  // Add debug log for products state
  useEffect(() => {
    console.log("Current Products State:", products);
    console.log("Products with discounts:", products.filter(p => p.discount && p.discount > 0).map(p => ({
      name: p.name,
      price: p.price,
      discount: p.discount
    })));
  }, [products]);

  const handleFilterChange = (filterType, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: "" });
    }, 2000);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    showToast(`${product.name} added to cart!`);
  };

  const toggleWishlist = (product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      showToast(`${product.name} removed from wishlist`);
    } else {
      addToWishlist(product);
      showToast(`${product.name} added to wishlist!`);
    }
  };

  // Update filtered products logic
  const filteredProducts = products.filter((product) => {
    const priceInRange =
      product.price >= selectedFilters.priceRange[0] &&
      product.price <= selectedFilters.priceRange[1];
    const styleMatch =
      selectedFilters.styles.length === 0 ||
      (product.style && selectedFilters.styles.includes(product.style));
    const materialMatch =
      selectedFilters.materials.length === 0 ||
      (product.material &&
        selectedFilters.materials.includes(product.material));
    const brandMatch =
      selectedFilters.brands.length === 0 ||
      selectedFilters.brands.includes(product.brand);
    const discountMatch =
      !selectedFilters.showDiscounted ||
      (product.discount && product.discount > 0);

    return priceInRange && styleMatch && materialMatch && brandMatch && discountMatch;
  });

  return (
    <div className="category-products">
      {toast.show && <div className="toast-notification">{toast.message}</div>}

      <div className="category-header">
        <h1>{formatCategoryName(categoryName)}</h1>
        <div className="view-controls">
          <button
            className={viewMode === "grid" ? "active" : ""}
            onClick={() => setViewMode("grid")}
          >
            <BsGrid />
          </button>
          <button
            className={viewMode === "list" ? "active" : ""}
            onClick={() => setViewMode("list")}
          >
            <BsList />
          </button>
          <button
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? <FiX /> : <FiFilter />}
            Filters
          </button>
        </div>
      </div>

      <div className="category-content">
        <FilterSection
          className={`category-filters ${showFilters ? "show" : ""}`}
        >
          <div className="filter-header">
            <h2>Filters</h2>
            <button
              className="clear-all"
              onClick={() => {
                setSelectedFilters({
                  priceRange: [0, 150000],
                  styles: [],
                  materials: [],
                  brands: [],
                  showDiscounted: false,
                });
                // Clear URL parameters
                navigate(location.pathname, { replace: true });
              }}
            >
              Clear All
            </button>
          </div>

          <div className="filter-group">
            <h3>
              Price Range
              <span className="count">
                ₹{selectedFilters.priceRange[0].toLocaleString()} - ₹
                {selectedFilters.priceRange[1].toLocaleString()}
              </span>
            </h3>
            <div className="price-range">
              <div className="range-slider">
                <input
                  type="range"
                  min="0"
                  max="150000"
                  value={selectedFilters.priceRange[1]}
                  onChange={(e) =>
                    handleFilterChange("priceRange", [
                      selectedFilters.priceRange[0],
                      parseInt(e.target.value),
                    ])
                  }
                />
              </div>
              <div className="range-inputs">
                <input
                  type="number"
                  value={selectedFilters.priceRange[0]}
                  onChange={(e) =>
                    handleFilterChange("priceRange", [
                      parseInt(e.target.value),
                      selectedFilters.priceRange[1],
                    ])
                  }
                  min="0"
                  max={selectedFilters.priceRange[1]}
                />
                <span>-</span>
                <input
                  type="number"
                  value={selectedFilters.priceRange[1]}
                  onChange={(e) =>
                    handleFilterChange("priceRange", [
                      selectedFilters.priceRange[0],
                      parseInt(e.target.value),
                    ])
                  }
                  min={selectedFilters.priceRange[0]}
                  max="150000"
                />
              </div>
            </div>
          </div>

          <div className="filter-group">
            <h3>
              Style
              <span className="count">
                {selectedFilters.styles.length} selected
              </span>
            </h3>
            <div className="checkbox-group">
              {getStyleOptions().map((style) => {
                const count = products.filter((p) => p.style === style).length;
                return (
                  <label key={style}>
                    <input
                      type="checkbox"
                      checked={selectedFilters.styles.includes(style)}
                      onChange={() => {
                        const newStyles = selectedFilters.styles.includes(style)
                          ? selectedFilters.styles.filter((s) => s !== style)
                          : [...selectedFilters.styles, style];
                        handleFilterChange("styles", newStyles);
                      }}
                    />
                    <span>{style}</span>
                    <span className="count">({count})</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="filter-group">
            <h3>
              Material
              <span className="count">
                {selectedFilters.materials.length} selected
              </span>
            </h3>
            <div className="checkbox-group">
              {getMaterialOptions().map((material) => {
                const count = products.filter(
                  (p) => p.material === material
                ).length;
                return (
                  <label key={material}>
                    <input
                      type="checkbox"
                      checked={selectedFilters.materials.includes(material)}
                      onChange={() => {
                        const newMaterials = selectedFilters.materials.includes(
                          material
                        )
                          ? selectedFilters.materials.filter(
                            (m) => m !== material
                          )
                          : [...selectedFilters.materials, material];
                        handleFilterChange("materials", newMaterials);
                      }}
                    />
                    <span>{material}</span>
                    <span className="count">({count})</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="filter-group">
            <h3>
              Brands
              <span className="count">
                {selectedFilters.brands.length} selected
              </span>
            </h3>
            <div className="checkbox-group">
              {getRelevantBrands().map((brand) => {
                const count = products.filter((p) => p.brand === brand).length;
                return (
                  <label key={brand}>
                    <input
                      type="checkbox"
                      checked={selectedFilters.brands.includes(brand)}
                      onChange={() => {
                        const newBrands = selectedFilters.brands.includes(brand)
                          ? selectedFilters.brands.filter((b) => b !== brand)
                          : [...selectedFilters.brands, brand];
                        handleFilterChange("brands", newBrands);
                      }}
                    />
                    <span>{brand}</span>
                    <span className="count">({count})</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="filter-group">
            <h3>
              Discount
              <span className="count">
                {products.filter(p => p.discount && p.discount > 0).length} items
              </span>
            </h3>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={selectedFilters.showDiscounted}
                  onChange={() => {
                    handleFilterChange("showDiscounted", !selectedFilters.showDiscounted);
                  }}
                />
                <span>Show Only Discounted Items</span>
                <span className="count">
                  ({products.filter(p => p.discount && p.discount > 0).length})
                </span>
              </label>
            </div>
          </div>
        </FilterSection>

        <main className={`products-grid ${viewMode}`}>
          {loading ? (
            <div className="loading">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="no-products">No products found</div>
          ) : (
            filteredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    onError={(e) => {
                      console.log("Image failed to load:", product.image);
                      e.target.src =
                        "https://via.placeholder.com/300x300?text=Product+Image";
                    }}
                  />
                  <button
                    className={`wishlist-btn ${isInWishlist(product.id) ? "active" : ""
                      }`}
                    onClick={() => toggleWishlist(product)}
                  >
                    <FiHeart />
                  </button>
                  <div className="views-overlay" title="Views">
                    <img src="/Eye3.png" alt="views" className="views-icon-img" />
                    <span>{product.views || 0}</span>
                  </div>
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="brand">{product.brand}</p>

                  {/* Price display with discount */}
                  <div className="price-container">
                    {(() => {
                      const priceInfo = formatPriceWithDiscount(product.price, product.discount);
                      return (
                        <>
                          {priceInfo.original ? (
                            <>
                              <p className="original-price">₹{priceInfo.original}</p>
                              <p className="discounted-price">₹{priceInfo.discounted}</p>
                              <span className="discount-badge">-{priceInfo.discountPercentage}%</span>
                            </>
                          ) : (
                            <p className="price">₹{priceInfo.discounted}</p>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  <div className="product-meta">
                    <span className="color">{product.color}</span>
                    {product.size && (
                      <span className="size">Size: {product.size}</span>
                    )}
                  </div>
                  <button
                    className="add-to-cart"
                    onClick={() => handleAddToCart(product)}
                  >
                    Add to Cart
                  </button>
                  <Link
                    to={`/product/${product.id}`}
                    className="view-details-btn"
                    state={{ product }}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  );
};

export default CategoryProducts;
