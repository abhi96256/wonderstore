import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';
import { FaClipboardList, FaBoxOpen } from 'react-icons/fa';

const Profile = () => {
  const navigate = useNavigate();
  const { currentUser, user, updateUserEmail, verifyEmailUpdate, deleteAccount } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    gender: currentUser?.gender || '',
    email: currentUser?.email || '',
    mobile: currentUser?.mobile || '',
    newEmail: currentUser?.email || ''
  });

  const getUserName = () => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split('@')[0];
    if (currentUser?.firstName || currentUser?.lastName)
      return `${currentUser?.firstName || ''}${currentUser?.lastName ? ' ' + currentUser.lastName : ''}`.trim();
    if (currentUser?.name) return currentUser.name;
    if (currentUser?.email) return currentUser.email.split('@')[0];
    return 'User';
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically update the user data in your backend
  };

  const handleEditEmail = () => {
    setIsEditingEmail(true);
    setError('');
  };

  const handleEmailChange = (e) => {
    setFormData(prev => ({
      ...prev,
      newEmail: e.target.value
    }));
  };

  const handleVerificationCodeChange = (e) => {
    setVerificationCode(e.target.value);
  };

  const handleSaveEmail = async () => {
    // Basic email validation
    if (!formData.newEmail || !formData.newEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      const response = await updateUserEmail(formData.newEmail);
      if (response.success) {
        setSuccessMessage(response.message);
        setShowVerification(true);
        setError('');
        // For demo purposes only - in production we wouldn't show this
        console.log('For testing, the verification code is:', response.code);
      }
    } catch (error) {
      setError(error.message || 'Failed to send verification code. Please try again.');
    }
  };

  const handleVerifyEmail = async () => {
    if (!verificationCode) {
      setError('Please enter verification code');
      return;
    }

    try {
      await verifyEmailUpdate(verificationCode, formData.newEmail);
      setFormData(prev => ({
        ...prev,
        email: formData.newEmail
      }));
      setIsEditingEmail(false);
      setShowVerification(false);
      setVerificationCode('');
      setError('');
      setSuccessMessage('Email updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000); // Clear success message after 3 seconds
    } catch (error) {
      setError(error.message || 'Invalid verification code. Please try again.');
    }
  };

  const handleCancelEmailEdit = () => {
    setIsEditingEmail(false);
    setShowVerification(false);
    setVerificationCode('');
    setError('');
    setFormData(prev => ({
      ...prev,
      newEmail: formData.email
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = () => {
    try {
      deleteAccount();
      // Navigate to the main website home page
      window.location.href = '/';  // This will do a full page refresh and load the main site
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirmation(false);
  };

  return (
    <div className="profile-container">
      <div className="profile-sidebar">
        {/* Left Sidebar */}
        <div className="sidebar-header">
          <div className="user-info">
            <span className="hello">Hello, <span className="username">{getUserName()}</span></span>
          </div>
        </div>

        {/* Menu Items */}
        <div className="sidebar-menu">
          {/* MY ORDERS Section */}
          <div className="menu-section">
            <Link to="/orders" className="menu-item">
              <FaBoxOpen style={{ marginRight: '10px', fontSize: '18px' }} />
              <span>MY ORDERS</span>
            </Link>
          </div>

          {/* ACCOUNT SETTINGS Section */}
          <div className="menu-section">
            <div className="section-title">ACCOUNT SETTINGS</div>
            <Link to="/profile" className="menu-item active">
              Profile Information
            </Link>
            <Link to="/addresses" className="menu-item">
              Manage Addresses
            </Link>
            <Link to="/pan-info" className="menu-item">
              PAN Card Information
            </Link>
          </div>

          {/* PAYMENTS Section */}
          <div className="menu-section">
            <div className="section-title">PAYMENTS</div>
            <Link to="/gift-cards" className="menu-item">
              Gift Cards <span className="amount">₹0</span>
            </Link>
            <Link to="/saved-upi" className="menu-item">
              Saved UPI
            </Link>
            <Link to="/saved-cards" className="menu-item">
              Saved Cards
            </Link>
          </div>

          {/* MY STUFF Section */}
          <div className="menu-section">
            <div className="section-title">MY STUFF</div>
            <Link to="/coupons" className="menu-item">
              My Coupons
            </Link>
            <Link to="/reviews" className="menu-item">
              My Reviews & Ratings
            </Link>
            <Link to="/notifications" className="menu-item">
              All Notifications
            </Link>
            <Link to="/wishlist" className="menu-item">
              My Wishlist
            </Link>
          </div>

          <div className="menu-section">
            <Link to="/logout" className="menu-item logout">
              Logout
            </Link>
          </div>
        </div>

        {/* Frequently Visited */}
        <div className="frequently-visited">
          <div className="section-title">Frequently Visited:</div>
          <div className="quick-links">
            <Link to="/track-order">Track Order</Link>
            <Link to="/help">Help Center</Link>
          </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="profile-content">
        <div className="content-header">
          <h1>Personal Information</h1>
          {isEditing ? (
            <button className="save-btn" onClick={handleSave}>Save</button>
          ) : (
            <button className="edit-btn" onClick={handleEdit}>Edit</button>
          )}
        </div>

        <div className="profile-form">
          {/* Name Fields */}
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          {/* Gender Selection */}
          <div className="form-group gender-section">
            <label className="gender-label">Your Gender</label>
            <div className="gender-options">
              <label className="gender-option">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
                <span className="radio-label">Male</span>
              </label>
              <label className="gender-option">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
                <span className="radio-label">Female</span>
              </label>
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-edit">
              {isEditingEmail ? (
                <div className="email-edit-section">
                  <input
                    type="email"
                    value={formData.newEmail}
                    onChange={handleEmailChange}
                    placeholder="Enter new email"
                  />
                  {error && <div className="error-message">{error}</div>}
                  {successMessage && <div className="success-message">{successMessage}</div>}
                  {showVerification ? (
                    <div className="verification-section">
                      <input
                        type="text"
                        placeholder="Enter verification code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="verification-input"
                      />
                      <button className="verify-btn" onClick={handleVerifyEmail}>
                        Verify
                      </button>
                    </div>
                  ) : (
                    <div className="email-edit-buttons">
                      <button className="save-btn" onClick={handleSaveEmail}>
                        Send Verification Code
                      </button>
                      <button className="cancel-btn" onClick={handleCancelEmailEdit}>
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                  />
                  <button className="edit-link" onClick={handleEditEmail}>
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile */}
          <div className="form-group">
            <label>Mobile Number</label>
            <div className="input-with-edit">
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                disabled={!isEditing}
              />
              <button className="edit-link" onClick={handleEdit}>Edit</button>
            </div>
          </div>

          {/* FAQs */}
          <div className="faqs">
            <h2>FAQs</h2>
            <div className="faq-item">
              <h3>What happens when I update my email address (or mobile number)?</h3>
              <p>Your login email id (or mobile number) changes, likewise. You'll receive all your account related communication on your updated email address (or mobile number).</p>
            </div>
            <div className="faq-item">
              <h3>When will my UniqueStore account be updated with the new email address (or mobile number)?</h3>
              <p>It happens as soon as you confirm the verification code sent to your email (or mobile) and save the changes.</p>
            </div>
            <div className="faq-item">
              <h3>What happens to my existing UniqueStore account when I update my email address (or mobile number)?</h3>
              <p>Updating your email address (or mobile number) doesn't invalidate your account. Your account remains fully functional. You'll continue seeing your Order history, saved information and personal details.</p>
            </div>
          </div>

          {/* Deactivate/Delete Account */}
          <div className="account-actions">
            <button className="delete-btn" onClick={handleDeleteClick}>Delete Account</button>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      {showDeleteConfirmation && (
        <div className="delete-confirmation-overlay">
          <div className="delete-confirmation-dialog">
            <h2>Delete Account</h2>
            <p>Are you sure you want to delete your account? This action cannot be undone.</p>
            <div className="delete-confirmation-buttons">
              <button className="delete-confirm-btn" onClick={handleDeleteConfirm}>
                Yes, Delete My Account
              </button>
              <button className="delete-cancel-btn" onClick={handleDeleteCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 