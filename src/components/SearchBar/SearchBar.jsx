import React, { useState, useEffect, useRef, useMemo } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { allProductsData } from "../data/products";
import "/SearchBar.css";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Memoize the search index for better performance
  const searchIndex = useMemo(() => {
    return allProductsData.map((product) => ({
      id: product.id,
      searchText: `${product.name.toLowerCase()} ${product.category.toLowerCase()}`,
      ...product,
    }));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedIndex(-1);

    if (value.trim()) {
      const searchValue = value.toLowerCase();
      const filtered = searchIndex
        .filter((item) => item.searchText.includes(searchValue))
        .slice(0, 6); // Limit to 6 results for better performance
      setSearchResults(filtered);
      setShowDropdown(true);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleKeyDown = (e) => {
    if (!showDropdown) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        if (selectedIndex >= 0) {
          handleItemClick(searchResults[selectedIndex]);
        }
        break;
      case "Escape":
        setShowDropdown(false);
        break;
      default:
        break;
    }
  };

  const handleItemClick = (item) => {
    navigate(`/product/${item.id}`);
    setShowDropdown(false);
    setSearchTerm("");
    setSelectedIndex(-1);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  const formatPrice = (price, discount) => {
    if (discount) {
      const discountedPrice = price * (1 - discount / 100);
      return `$${discountedPrice.toFixed(2)}`;
    }
    return `$${price.toFixed(2)}`;
  };

  const highlightMatch = (text, searchTerm) => {
    if (!searchTerm) return text;

    const parts = text.split(new RegExp(`(${searchTerm})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <span key={index} className="highlight">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="search-container" ref={searchRef}>
      <div className="search-input-wrapper">
        <FaSearch className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearch}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm.trim() && setShowDropdown(true)}
        />
        {searchTerm && (
          <button
            className="clear-search"
            onClick={clearSearch}
            aria-label="Clear search"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="search-dropdown">
          {searchResults.length > 0 ? (
            <>
              {searchResults.map((item, index) => (
                <div
                  key={item.id}
                  className={`search-result-item ${
                    index === selectedIndex ? "selected" : ""
                  }`}
                  onClick={() => handleItemClick(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="search-result-image-wrapper">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="search-result-image"
                    />
                  </div>
                  <div className="search-result-info">
                    <h4 className="search-result-title">
                      {highlightMatch(item.name, searchTerm)}
                    </h4>
                    <p className="search-result-category">
                      {highlightMatch(item.category, searchTerm)}
                    </p>
                    <div className="search-result-price">
                      {item.discount ? (
                        <>
                          <span className="discounted-price">
                            {formatPrice(item.price, item.discount)}
                          </span>
                          <span className="search-result-original-price">
                            ${item.price.toFixed(2)}
                          </span>
                          <span className="discount-tag">
                            -{item.discount}%
                          </span>
                        </>
                      ) : (
                        <span className="regular-price">
                          ${item.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div className="search-footer">
                <span className="results-count">
                  Showing {searchResults.length} of{" "}
                  {
                    searchIndex.filter((item) =>
                      item.searchText.includes(searchTerm.toLowerCase())
                    ).length
                  }{" "}
                  results
                </span>
              </div>
            </>
          ) : (
            <div className="no-results">
              <p>No products found matching "{searchTerm}"</p>
              <span>
                Try checking your spelling or using different keywords
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
