import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';
import './AddressForm.css';

const AddressForm = ({ address, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (address) {
      setFormData({
        fullName: address.fullName || '',
        mobile: address.mobile || '',
        addressLine1: address.addressLine1 || '',
        addressLine2: address.addressLine2 || '',
        city: address.city || '',
        state: address.state || '',
        pincode: address.pincode || '',
        isDefault: address.isDefault || false
      });
    }
  }, [address]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Special handling for different field types
    let processedValue = value;
    if (name === 'mobile') {
      // Only allow digits and limit to 10 characters
      processedValue = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'pincode') {
      // Only allow digits and limit to 6 characters
      processedValue = value.replace(/\D/g, '').slice(0, 6);
    } else if (name === 'fullName' || name === 'city' || name === 'state') {
      // Only allow letters and spaces for name, city, and state
      processedValue = value.replace(/[^a-zA-Z\s]/g, '');
    }
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : processedValue
    });
    
    // Clear error when field is being edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters long';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.fullName.trim())) {
      newErrors.fullName = 'Full name should only contain letters and spaces';
    }
    
    // Mobile validation
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile.trim())) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9';
    }
    
    // Address Line 1 validation
    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address is required';
    } else if (formData.addressLine1.trim().length < 5) {
      newErrors.addressLine1 = 'Address must be at least 5 characters long';
    }
    
    // Address Line 2 validation (optional but if provided, validate)
    if (formData.addressLine2.trim() && formData.addressLine2.trim().length < 3) {
      newErrors.addressLine2 = 'Address line 2 must be at least 3 characters long if provided';
    }
    
    // City validation
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    } else if (formData.city.trim().length < 2) {
      newErrors.city = 'City must be at least 2 characters long';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.city.trim())) {
      newErrors.city = 'City should only contain letters and spaces';
    }
    
    // State validation
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    } else if (formData.state.trim().length < 2) {
      newErrors.state = 'State must be at least 2 characters long';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.state.trim())) {
      newErrors.state = 'State should only contain letters and spaces';
    }
    
    // Pincode validation
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^[1-9][0-9]{5}$/.test(formData.pincode.trim())) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode (should not start with 0)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <div className="address-form-container">
      <h3>{address ? 'Edit Address' : 'Add New Address'}</h3>
      <form onSubmit={handleSubmit} className="address-form">
        <div className="form-group">
          <label htmlFor="fullName">Full Name *</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className={errors.fullName ? 'error' : ''}
            placeholder="Enter your full name"
            maxLength="50"
          />
          {errors.fullName && <span className="error-message">{errors.fullName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="mobile">Mobile Number *</label>
          <input
            type="tel"
            id="mobile"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            className={errors.mobile ? 'error' : ''}
            placeholder="Enter 10-digit mobile number"
            maxLength="10"
          />
          {errors.mobile && <span className="error-message">{errors.mobile}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="addressLine1">Address Line 1 *</label>
          <input
            type="text"
            id="addressLine1"
            name="addressLine1"
            value={formData.addressLine1}
            onChange={handleChange}
            className={errors.addressLine1 ? 'error' : ''}
            placeholder="House No, Building, Street"
            maxLength="100"
          />
          {errors.addressLine1 && <span className="error-message">{errors.addressLine1}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="addressLine2">Address Line 2</label>
          <input
            type="text"
            id="addressLine2"
            name="addressLine2"
            value={formData.addressLine2}
            onChange={handleChange}
            placeholder="Colony, Area, Landmark (Optional)"
            maxLength="100"
            className={errors.addressLine2 ? 'error' : ''}
          />
          {errors.addressLine2 && <span className="error-message">{errors.addressLine2}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="city">City *</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={errors.city ? 'error' : ''}
              placeholder="Enter city name"
              maxLength="30"
            />
            {errors.city && <span className="error-message">{errors.city}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="state">State *</label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className={errors.state ? 'error' : ''}
              placeholder="Enter state name"
              maxLength="30"
            />
            {errors.state && <span className="error-message">{errors.state}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="pincode">Pincode *</label>
          <input
            type="text"
            id="pincode"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            className={errors.pincode ? 'error' : ''}
            placeholder="Enter 6-digit pincode"
            maxLength="6"
          />
          {errors.pincode && <span className="error-message">{errors.pincode}</span>}
        </div>

        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="isDefault"
            name="isDefault"
            checked={formData.isDefault}
            onChange={handleChange}
          />
          <label htmlFor="isDefault">Set as default address</label>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            <FaTimes /> Cancel
          </button>
          <button type="submit" className="save-btn">
            <FaSave /> Save Address
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm; 