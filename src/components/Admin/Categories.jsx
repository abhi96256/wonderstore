import React, { useState, useEffect } from 'react';
import './Categories.css';
import { FaList, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import axios from 'axios';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ 
    category: '', 
    sub_category: '', 
    status: 'active' 
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://13.202.119.111:5000/api/products');
      
      // Extract unique categories and their sub-categories
      const categoryMap = response.data.reduce((acc, product) => {
        if (!acc[product.category]) {
          acc[product.category] = {
            id: Date.now() + Math.random(), // Generate unique ID
            category: product.category,
            sub_categories: new Set(),
            status: 'active'
          };
        }
        if (product.sub_category) {
          acc[product.category].sub_categories.add(product.sub_category);
        }
        return acc;
      }, {});

      // Convert Set to Array for sub_categories
      const categoriesList = Object.values(categoryMap).map(cat => ({
        ...cat,
        sub_categories: Array.from(cat.sub_categories)
      }));

      setCategories(categoriesList);
      setError(null);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setForm({ category: '', sub_category: '', status: 'active' });
    setEditId(null);
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setForm({ 
      category: category.category, 
      sub_category: category.sub_categories[0] || '', 
      status: category.status 
    });
    setEditId(category.id);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        // Update existing category
        await axios.put(`http://13.202.119.111:5000/api/products/category/${form.category}`, {
          category: form.category,
          sub_category: form.sub_category,
          status: form.status
        });
      } else {
        // Create new category
        await axios.post('http://13.202.119.111:5000/api/products', {
          category: form.category,
          sub_category: form.sub_category,
          status: form.status
        });
      }
      setShowModal(false);
      fetchCategories(); // Refresh the categories list
    } catch (err) {
      console.error('Error saving category:', err);
      setError('Failed to save category');
    }
  };

  const handleDelete = async (category) => {
    if (window.confirm(`Are you sure you want to delete the category "${category.category}"?`)) {
      try {
        await axios.delete(`http://13.202.119.111:5000/api/products/category/${category.category}`);
        fetchCategories(); // Refresh the categories list
      } catch (err) {
        console.error('Error deleting category:', err);
        setError('Failed to delete category');
      }
    }
  };

  if (loading) return <div className="loading">Loading categories...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="categories-admin-page">
      <div className="categories-header">
        <h2><FaList /> Categories Management</h2>
        <button className="add-category-btn" onClick={openModal}>
          <FaPlus /> Add New Category
        </button>
      </div>

      <div className="categories-grid">
        {categories.map(category => (
          <div key={category.id} className="category-card">
            <div className="category-header">
              <h3>{category.category}</h3>
              <div className="category-actions">
                <button className="edit-btn" title="Edit Category" onClick={() => openEditModal(category)}>
                  <FaEdit />
                </button>
                <button className="delete-btn" title="Delete Category" onClick={() => handleDelete(category)}>
                  <FaTrash />
                </button>
              </div>
            </div>
            <div className="sub-categories">
              <h4>Sub Categories:</h4>
              <ul>
                {category.sub_categories.map((sub, index) => (
                  <li key={index}>{sub}</li>
                ))}
              </ul>
            </div>
            <span className={`status-badge ${category.status}`}>
              {category.status}
            </span>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>{editId ? 'Edit Category' : 'Add New Category'}</h3>
            <form className="category-form" onSubmit={handleSubmit}>
              <label>Category Name:
                <input 
                  name="category" 
                  value={form.category} 
                  onChange={handleChange} 
                  required 
                />
              </label>
              <label>Sub Category:
                <input 
                  name="sub_category" 
                  value={form.sub_category} 
                  onChange={handleChange} 
                  required 
                />
              </label>
              <label>Status:
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
              <div className="modal-actions">
                <button type="submit" className="save-btn">
                  {editId ? 'Update' : 'Add'}
                </button>
                <button type="button" onClick={closeModal} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories; 