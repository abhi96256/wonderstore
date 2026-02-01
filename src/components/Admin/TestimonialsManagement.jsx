import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaStar, FaUser, FaMapMarkerAlt, FaQuoteLeft } from 'react-icons/fa';
import './TestimonialsManagement.css';
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
  orderBy
} from 'firebase/firestore';

const TestimonialsManagement = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    text: '',
    author: '',
    location: '',
    rating: 5,
    featured: false,
    status: 'active'
  });

  // Fetch testimonials from Firestore
  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const testimonialsRef = collection(db, 'testimonials');
      const q = query(testimonialsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const testimonialsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setTestimonials(testimonialsData);
    } catch (err) {
      setError('Error fetching testimonials: ' + err.message);
    } finally {
      setLoading(false);
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const testimonialData = {
        ...formData
      };
      
      console.log('💾 Saving testimonial data:', testimonialData);
      
      if (selectedTestimonial) {
        // Update existing testimonial
        await updateDoc(doc(db, 'testimonials', selectedTestimonial.id), {
          ...testimonialData,
          updatedAt: serverTimestamp()
        });
        console.log('✅ Testimonial updated successfully');
      } else {
        // Add new testimonial
        const newTestimonial = {
          ...testimonialData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        const docRef = doc(collection(db, 'testimonials'));
        await setDoc(docRef, newTestimonial);
        console.log('✅ New testimonial added successfully');
      }
      
      setShowModal(false);
      setSelectedTestimonial(null);
      resetForm();
      fetchTestimonials();
    } catch (err) {
      console.error('❌ Error saving testimonial:', err);
      setError('Error saving testimonial: ' + err.message);
    }
  };

  const handleEdit = (testimonial) => {
    setSelectedTestimonial(testimonial);
    setFormData({
      text: testimonial.text,
      author: testimonial.author,
      location: testimonial.location,
      rating: testimonial.rating,
      featured: testimonial.featured || false,
      status: testimonial.status || 'active'
    });
    setShowModal(true);
  };



  const resetForm = () => {
    setFormData({
      text: '',
      author: '',
      location: '',
      rating: 5,
      featured: false,
      status: 'active'
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      try {
        await deleteDoc(doc(db, 'testimonials', id));
        fetchTestimonials();
      } catch (err) {
        setError('Error deleting testimonial: ' + err.message);
      }
    }
  };

  const openAddModal = () => {
    setSelectedTestimonial(null);
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTestimonial(null);
    resetForm();
  };

  const filteredTestimonials = testimonials.filter(testimonial =>
    testimonial.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    testimonial.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    testimonial.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading">Loading testimonials...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="testimonials-management">
      <div className="page-header">
        <h1>Testimonials Management</h1>
        <p>Manage customer testimonials and reviews</p>
      </div>

      <div className="actions-bar">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search testimonials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button className="add-btn" onClick={openAddModal}>
          <FaPlus /> Add New Testimonial
        </button>
      </div>

      <div className="testimonials-grid">
        {filteredTestimonials.map((testimonial) => (
          <div key={testimonial.id} className={`testimonial-card ${testimonial.featured ? 'featured' : ''}`}>
            <div className="testimonial-header">
              <div className="testimonial-status">
                <span className={`status-badge ${testimonial.status}`}>
                  {testimonial.status}
                </span>
                {testimonial.featured && (
                  <span className="featured-badge">Featured</span>
                )}
              </div>
              <div className="testimonial-actions">
                <button 
                  className="edit-btn"
                  onClick={() => handleEdit(testimonial)}
                  title="Edit"
                >
                  <FaEdit />
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => handleDelete(testimonial.id)}
                  title="Delete"
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            <div className="testimonial-content">
              <div className="quote-icon">
                <FaQuoteLeft />
              </div>
              <p className="testimonial-text">{testimonial.text}</p>
              
              <div className="rating">
                {[...Array(5)].map((_, index) => (
                  <FaStar 
                    key={index} 
                    className={index < testimonial.rating ? 'star filled' : 'star empty'} 
                  />
                ))}
              </div>
            </div>

                         <div className="testimonial-footer">
               <div className="author-info">
                 <div className="author-details">
                   <h4 className="author-name">{testimonial.author}</h4>
                   <p className="author-location">
                     <FaMapMarkerAlt /> {testimonial.location}
                   </p>
                 </div>
               </div>
               
               <div className="testimonial-date">
                 {testimonial.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
               </div>
             </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>

                         <form onSubmit={handleSubmit} className="testimonial-form">
              <div className="form-group">
                <label htmlFor="text">Testimonial Text *</label>
                <textarea
                  id="text"
                  value={formData.text}
                  onChange={(e) => setFormData({...formData, text: e.target.value})}
                  placeholder="Enter customer testimonial..."
                  required
                  rows="4"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="author">Customer Name *</label>
                  <input
                    type="text"
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                    placeholder="Customer name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location *</label>
                  <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="City, State"
                    required
                  />
                </div>
              </div>

              

               <div className="form-group">
                 <label htmlFor="rating">Rating *</label>
                 <div className="rating-input">
                   {[1, 2, 3, 4, 5].map((star) => (
                     <FaStar
                       key={star}
                       className={`star ${star <= formData.rating ? 'filled' : 'empty'}`}
                       onClick={() => setFormData({...formData, rating: star})}
                     />
                   ))}
                 </div>
               </div>

              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                    />
                    <span className="checkmark"></span>
                    Featured Testimonial
                  </label>
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={closeModal}>
                  Cancel
                </button>
                                 <button type="submit" className="save-btn">
                   {selectedTestimonial ? 'Update' : 'Save'} Testimonial
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialsManagement;
