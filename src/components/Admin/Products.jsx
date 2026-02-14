import React, { useState, useEffect, useMemo } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import './Products.css';
import { db } from '../../firebase/config';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where
} from 'firebase/firestore';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [bulkJson, setBulkJson] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [formData, setFormData] = useState({
    product_name: '',
    category: '',
    sub_category: '',
    product_code: '',
    color: '',
    product_description: '',
    material: '',
    product_details: '',
    dimension: '',
    care_instructions: '',
    inventory: '',
    mrp: '',
    discount: '',
    image: '',
    views: '',
    bought: '',
    featured: false
  });

  // Helper function to get first image from comma-separated string
  const getFirstImage = (imageField) => {
    if (!imageField) return null;
    const imagesArr = imageField.split(',').map(img => img.trim()).filter(Boolean);
    if (imagesArr.length > 0) {
      return imagesArr[0].startsWith('/') ? imagesArr[0] : `/${imagesArr[0]}`;
    }
    return null;
  };

  // Helper function to get all media items with types
  const getMediaItems = (imageField) => {
    if (!imageField) return [];
    return imageField.split(',').map(img => {
      const trimmed = img.trim();
      if (!trimmed) return null;
      const src = trimmed.startsWith('/') || trimmed.startsWith('http') ? trimmed : `/${trimmed}`;
      const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(src);
      return { src, isVideo };
    }).filter(Boolean);
  };

  // Process products once with useMemo to avoid reprocessing on every render
  const processedProducts = useMemo(() => {
    return products.map(product => ({
      ...product,
      firstImage: getFirstImage(product.image),
      product_name: product.product_name || 'Unnamed Product',
      category: product.category || 'Uncategorized',
      mrp: product.mrp || 0,
      inventory: product.inventory || 0,
      views: product.views || 0
    }));
  }, [products]);

  // Filter products based on search term and price range
  const filteredProducts = useMemo(() => {
    return processedProducts.filter(product => {
      // Search filter - check product code and name
      const searchMatch = !searchTerm ||
        (product.product_code && product.product_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.product_name && product.product_name.toLowerCase().includes(searchTerm.toLowerCase()));

      // Price filter
      const price = Number(product.mrp) || 0;
      const minPriceFilter = !minPrice || price >= Number(minPrice);
      const maxPriceFilter = !maxPrice || price <= Number(maxPrice);

      return searchMatch && minPriceFilter && maxPriceFilter;
    });
  }, [processedProducts, searchTerm, minPrice, maxPrice]);

  const uniqueCategories = useMemo(() => {
    return ["Unique Speaker", "Lamps", "Humidifier", "Holi Special"].sort();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsRef = collection(db, 'products');
      const querySnapshot = await getDocs(productsRef);

      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setProducts(productsData);
      setError(null);
      console.log('Fetched products from Firebase:', productsData);
    } catch (err) {
      console.error('Error fetching products from Firebase:', err);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'featured' ? value === 'true' : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Form data before processing:', formData);

      // Convert numeric fields to numbers
      const numericFormData = {
        ...formData,
        cost_price: Number(formData.cost_price),
        inventory: Number(formData.inventory),
        mrp: Number(formData.mrp),
        discount: formData.discount ? Number(formData.discount) : 0,
        views: formData.views === '' ? 0 : Number(formData.views),
        bought: formData.bought === '' ? 0 : Number(formData.bought)
      };

      console.log('Numeric form data:', numericFormData);
      console.log('Discount value:', numericFormData.discount);

      if (selectedProduct) {
        // Update existing product
        console.log('Updating product with ID:', selectedProduct.id, typeof selectedProduct.id);

        if (typeof selectedProduct.id === 'number') {
          // If ID is a number, handle as a string or find the document by query
          const productsRef = collection(db, 'products');
          const q = query(productsRef, where('id', '==', selectedProduct.id));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const docRef = querySnapshot.docs[0].ref;
            const updateData = {
              ...numericFormData,
              updatedAt: serverTimestamp()
            };
            console.log('Updating product with data:', updateData);
            await updateDoc(docRef, updateData);
            console.log('Product updated in Firebase by numeric ID:', selectedProduct.id);
          } else {
            throw new Error(`Product with numeric ID ${selectedProduct.id} not found`);
          }
        } else {
          // If ID is a string (document ID), update directly
          const productRef = doc(db, 'products', selectedProduct.id);
          const updateData = {
            ...numericFormData,
            updatedAt: serverTimestamp()
          };
          console.log('Updating product with data:', updateData);
          await updateDoc(productRef, updateData);
          console.log('Product updated in Firebase by document ID:', selectedProduct.id);
        }
      } else {
        // Create new product with a unique ID
        const newProductRef = doc(collection(db, 'products'));
        // Generate a new numeric ID for the product
        const highestId = products.reduce((max, product) =>
          (product.id && typeof product.id === 'number' && product.id > max) ? product.id : max, 0);

        await setDoc(newProductRef, {
          ...numericFormData,
          id: highestId + 1, // Ensure a unique numeric ID for compatibility
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.log('New product added to Firebase:', newProductRef.id);
      }

      setShowModal(false);
      setSelectedProduct(null);
      setFormData({
        product_name: '',
        category: '',
        sub_category: '',
        product_code: '',
        color: '',
        product_description: '',
        material: '',
        product_details: '',
        dimension: '',
        care_instructions: '',
        inventory: '',
        mrp: '',
        discount: '',
        image: '',
        views: '',
        bought: '',
        featured: false
      });

      // Refresh the products list
      fetchProducts();
    } catch (err) {
      console.error('Error saving product to Firebase:', err);
      setError('Failed to save product: ' + err.message);
    }
  };

  const handleEdit = (product) => {
    console.log('Editing product:', product);
    console.log('Product discount value:', product.discount);
    setSelectedProduct(product);
    setFormData({
      product_name: product.product_name || '',
      category: product.category || '',
      sub_category: product.sub_category || '',
      product_code: product.product_code || '',
      color: product.color || '',
      product_description: product.product_description || '',
      material: product.material || '',
      product_details: product.product_details || '',
      dimension: product.dimension || '',
      care_instructions: product.care_instructions || '',
      inventory: product.inventory || '',
      mrp: product.mrp || '',
      discount: product.discount || '',
      image: product.image || '',
      views: product.views || '',
      bought: product.bought || '',
      featured: product.featured || false
    });
    setIsNewCategory(false);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        if (typeof id === 'number') {
          // If ID is a number, find the document by query
          const productsRef = collection(db, 'products');
          const q = query(productsRef, where('id', '==', id));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const docRef = querySnapshot.docs[0].ref;
            await deleteDoc(docRef);
            console.log('Product deleted from Firebase by numeric ID:', id);
          } else {
            throw new Error(`Product with numeric ID ${id} not found`);
          }
        } else {
          // If ID is a string (document ID), delete directly
          const productRef = doc(db, 'products', id);
          await deleteDoc(productRef);
          console.log('Product deleted from Firebase by document ID:', id);
        }
        fetchProducts();
      } catch (err) {
        console.error('Error deleting product from Firebase:', err);
        setError('Failed to delete product: ' + err.message);
      }
    }
  };

  const handleBulkAdd = async () => {
    try {
      setLoading(true);
      let productsToAdd;
      try {
        productsToAdd = JSON.parse(bulkJson);
        if (!Array.isArray(productsToAdd)) {
          throw new Error('Input must be an array of products');
        }
      } catch (err) {
        setError('Invalid JSON format. Please check your input.');
        return;
      }

      // Check for duplicate product codes in the input array
      const productCodes = new Set();
      const duplicateCodes = new Set();
      const uniqueProducts = [];

      // Filter out duplicates from input array
      productsToAdd.forEach(product => {
        if (product.product_code) {
          if (productCodes.has(product.product_code)) {
            duplicateCodes.add(product.product_code);
          } else {
            productCodes.add(product.product_code);
            uniqueProducts.push(product);
          }
        }
      });

      // Check for duplicates in Firebase database
      const productsRef = collection(db, 'products');
      const productCodesToCheck = Array.from(productCodes);
      const duplicateCodesInDB = new Set();
      const validProducts = [];

      // Check each product code against the database
      for (const product of uniqueProducts) {
        const q = query(productsRef, where('product_code', '==', product.product_code));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          validProducts.push(product);
        } else {
          duplicateCodesInDB.add(product.product_code);
        }
      }

      // If no valid products to add, show error and return
      if (validProducts.length === 0) {
        setError('No valid products to add. All product codes either duplicate in input or already exist in database.');
        return;
      }

      // Show warning if some products were skipped
      if (duplicateCodes.size > 0 || duplicateCodesInDB.size > 0) {
        let warningMessage = 'Some products were skipped:';
        if (duplicateCodes.size > 0) {
          warningMessage += `\n- Duplicate in input: ${Array.from(duplicateCodes).join(', ')}`;
        }
        if (duplicateCodesInDB.size > 0) {
          warningMessage += `\n- Already exist in database: ${Array.from(duplicateCodesInDB).join(', ')}`;
        }
        setError(warningMessage);
      }

      // Get the highest existing ID
      const highestId = products.reduce((max, product) =>
        (product.id && typeof product.id === 'number' && product.id > max) ? product.id : max, 0);

      // Add valid products to the database
      for (let i = 0; i < validProducts.length; i++) {
        const product = validProducts[i];
        const newProductRef = doc(collection(db, 'products'));

        // Convert numeric fields
        const numericProduct = {
          ...product,
          inventory: Number(product.inventory) || 0,
          mrp: Number(product.mrp) || 0,
          discount: product.discount ? Number(product.discount) : 0,
          id: highestId + i + 1,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        await setDoc(newProductRef, numericProduct);
      }

      setShowBulkForm(false);
      setBulkJson('');
      fetchProducts();
    } catch (err) {
      setError('Failed to add products: ' + err.message);
      console.error('Error adding products:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="products-container">
      <div className="products-header">
        <h2>Products Management</h2>
        <div className="header-buttons">
          <button className="add-product-btn" onClick={() => {
            setIsNewCategory(false);
            setShowModal(true);
          }}>
            <FaPlus /> Add New Product
          </button>
          <button
            className="bulk-add-btn"
            onClick={() => setShowBulkForm(!showBulkForm)}
          >
            Bulk Add Products
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="search-container">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by product code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              style={{
                color: 'black',
              }}
            />
          </div>
        </div>
        <div className="price-filter-container">
          <div className="price-filter-group">
            <label>Min Price (₹)</label>
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="price-input"
              min="0"
            />
          </div>
          <div className="price-filter-group">
            <label>Max Price (₹)</label>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="price-input"
              min="0"
            />
          </div>
          <button
            className="clear-filters-btn"
            onClick={() => {
              setSearchTerm('');
              setMinPrice('');
              setMaxPrice('');
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {showBulkForm && (
        <div className="bulk-form">
          <h3>Bulk Add Products</h3>
          <div className="form-group">
            <label>Enter Products JSON:</label>
            <textarea
              value={bulkJson}
              onChange={(e) => setBulkJson(e.target.value)}
              placeholder={`Enter products in JSON format. Example:
[
  {
    "product_name": "Product 1",
    "category": "Category 1",
    "sub_category": "Sub Category 1",
    "product_code": "P001",
    "color": "Red",
    "product_description": "Description 1",
    "material": "Material 1",
    "product_details": "Details 1",
    "dimension": "10x10x10",
    "care_instructions": "Care 1",
    "inventory": 100,
    "mrp": 999,
    "discount": 10,
            "image": "image1.webp",
    "featured": false
  }
]`}
              rows="10"
            />
          </div>
          <div className="form-actions">
            <button
              className="save-btn"
              onClick={handleBulkAdd}
            >
              Add Products
            </button>
            <button
              className="cancel-btn"
              onClick={() => {
                setShowBulkForm(false);
                setBulkJson('');
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="products-table-container">
        <div className="results-info">
          <span>Showing {filteredProducts.length} of {processedProducts.length} products</span>
          {(searchTerm || minPrice || maxPrice) && (
            <span className="filter-active">(Filtered)</span>
          )}
        </div>
        <table className="products-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Product Code</th>
              <th>Category</th>
              <th>Price</th>
              <th>Inventory</th>
              <th>Views</th>
              <th>Bought</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={`product-${product.id}`}>
                <td>
                  {product.firstImage ? (
                    /\.(mp4|webm|ogg|mov)$/i.test(product.firstImage) ? (
                      <video
                        src={product.firstImage}
                        className="product-thumbnail"
                        muted
                        autoPlay
                        loop
                        playsInline
                      />
                    ) : (
                      <img
                        src={product.firstImage}
                        alt="Product Image"
                        className="product-thumbnail"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.parentElement.textContent = 'No Image Available';
                        }}
                        loading="lazy"
                      />
                    )
                  ) : (
                    <div className="no-image">No Image Available</div>
                  )}
                </td>

                <td>{product.product_name}</td>
                <td>{product.product_code || 'N/A'}</td>
                <td>{product.category}</td>
                <td>₹{product.mrp}</td>
                <td>{product.inventory}</td>
                <td>{product.views || 0}</td>
                <td>{product.bought || 0}</td>
                <td className="action-buttons">
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(product)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(product.id)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {
        showModal && (
          <div className="modaloverlay">
            <div className="modal-content">
              <h3>{selectedProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    name="product_name"
                    value={formData.product_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ marginBottom: 0 }}>Category</label>
                    <button
                      type="button"
                      className="toggle-category-btn"
                      onClick={() => setIsNewCategory(!isNewCategory)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#007bff',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        textDecoration: 'underline'
                      }}
                    >
                      {isNewCategory ? 'Select Existing' : 'Add New Category'}
                    </button>
                  </div>
                  {isNewCategory ? (
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      placeholder="Enter new category name"
                      required
                    />
                  ) : (
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="category-select"
                    >
                      <option value="">Select Category</option>
                      {uniqueCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="form-group">
                  <label>Sub Category</label>
                  <input
                    type="text"
                    name="sub_category"
                    value={formData.sub_category}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Product Code</label>
                  <input
                    type="text"
                    name="product_code"
                    value={formData.product_code}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Color</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="product_description"
                    value={formData.product_description}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Material</label>
                  <input
                    type="text"
                    name="material"
                    value={formData.material}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Product Details</label>
                  <textarea
                    name="product_details"
                    value={formData.product_details}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Dimension</label>
                  <input
                    type="text"
                    name="dimension"
                    value={formData.dimension}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Care Instructions</label>
                  <textarea
                    name="care_instructions"
                    value={formData.care_instructions}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Inventory</label>
                  <input
                    type="number"
                    name="inventory"
                    value={formData.inventory}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>MRP</label>
                  <input
                    type="number"
                    name="mrp"
                    value={formData.mrp}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Discount (%)</label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                  />
                </div>
                <div className="form-group">
                  <label>Views (people)</label>
                  <input
                    type="number"
                    name="views"
                    value={formData.views}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Bought (count)</label>
                  <input
                    type="number"
                    name="bought"
                    value={formData.bought}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Image URL</label>
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    required
                  />
                  {formData.image && (
                    <div className="media-preview">
                      {getMediaItems(formData.image).map((media, idx) => (
                        media.isVideo ? (
                          <video
                            key={idx}
                            src={media.src}
                            className="media-preview-item"
                            muted
                            autoPlay
                            loop
                            playsInline
                          />
                        ) : (
                          <img
                            key={idx}
                            src={media.src}
                            alt={`Preview ${idx + 1}`}
                            className="media-preview-item"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        )
                      ))}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>Featured Product</label>
                  <select
                    name="featured"
                    value={formData.featured}
                    onChange={handleInputChange}
                  >
                    <option value={false}>No</option>
                    <option value={true}>Yes</option>
                  </select>
                </div>
                <div className="modal-buttons">
                  <button type="submit" className="save-btn">
                    {selectedProduct ? 'Update' : 'Save'}
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedProduct(null);
                      setFormData({
                        product_name: '',
                        category: '',
                        sub_category: '',
                        product_code: '',
                        color: '',
                        product_description: '',
                        material: '',
                        product_details: '',
                        dimension: '',
                        care_instructions: '',
                        inventory: '',
                        mrp: '',
                        discount: '',
                        image: '',
                        views: '',
                        bought: '',
                        featured: false
                      });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default Products; 
