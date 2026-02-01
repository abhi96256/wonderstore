import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaCog, FaHistory, FaUserShield, FaMapMarkerAlt, FaShoppingCart } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './UserDashboard.css';

const UserDashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated, currentUser, logout, user } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const getUserName = () => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split('@')[0];
    if (currentUser?.name) return currentUser.name;
    if (currentUser?.email) return currentUser.email.split('@')[0];
    return 'User';
  };

  // Check if user is admin
  const isAdmin = user?.isAdmin || currentUser?.isAdmin;

  // Show login dropdown if not logged in
  if (!isAuthenticated) {
    return (
      <div className="user-dashboard" ref={dropdownRef}>
        <button 
          className="login-btn"
          onClick={() => setIsOpen(!isOpen)}
        >
          <FaUser className="login-icon" />
          <span className="login-text">Login</span>
        </button>

        {isOpen && (
          <>
            <div className="dropdown-backdrop" onClick={() => setIsOpen(false)}></div>
            <div className="login-dropdown">
              <div className="login-header">
                <h4>Login</h4>
                <p>Get access to your Orders, Wishlist and Recommendations</p>
              </div>
              <div className="login-content">
                <Link to="/login" className="login-link" onClick={() => setIsOpen(false)}>
                  Login
                </Link>
                <div className="signup-prompt">
                  <span>New customer?</span>
                  <Link to="/signup" onClick={() => setIsOpen(false)}>Sign Up</Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Show dashboard if logged in
  return (
    <div className="user-dashboard" ref={dropdownRef}>
      <button 
        className="user-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User Dashboard"
      >
        <FaUser />
      </button>

      {isOpen && (
        <>
          <div className="dropdown-backdrop" onClick={() => setIsOpen(false)}></div>
          <div className="dashboard-dropdown">
            <div className="dashboard-header">
              <div className="user-avatar">
                <FaUser />
              </div>
              <div className="user-info">
                <h4>Welcome, {getUserName()}</h4>
                <p>{user?.email || currentUser?.email}</p>
                {isAdmin && <span className="admin-badge">Admin</span>}
              </div>
            </div>

            <div className="dashboard-menu">
              {/* Admin Dashboard link - only visible for admin users */}
              {isAdmin && (
                <Link to="/admin" className="menu-item admin-menu-item" onClick={() => setIsOpen(false)}>
                  <FaUserShield className="menu-icon" />
                  <span>Admin Dashboard</span>
                </Link>
              )}
              
              {/* <Link to="/profile" className="menu-item" onClick={() => setIsOpen(false)}>
                <FaUser className="menu-icon" />
                <span>My Profile</span>
              </Link> */}
              <Link to="/orders" className="menu-item" onClick={() => setIsOpen(false)}>
                <FaHistory className="menu-icon" />
                <span>My Orders</span>
              </Link>
              <Link to="/addresses" className="menu-item" onClick={() => setIsOpen(false)}>
                <FaMapMarkerAlt className="menu-icon" />
                <span>My Addresses</span>
              </Link>
              <Link to="/saved-cart" className="menu-item" onClick={() => setIsOpen(false)}>
                <FaShoppingCart className="menu-icon" />
                <span>Saved Items</span>
              </Link>
              {/* <Link to="/settings" className="menu-item" onClick={() => setIsOpen(false)}>
                <FaCog className="menu-icon" />
                <span>Settings</span>
              </Link> */}
              <Link to="/wishlist" className="menu-item" onClick={() => setIsOpen(false)}>
                <img src="https://cdn-icons-png.flaticon.com/512/1077/1077035.png" alt="Wishlist" />
                <span>Wishlist</span>
              </Link>
              {/* <Link to="/notifications" className="menu-item" onClick={() => setIsOpen(false)}>
                <img src="https://cdn-icons-png.flaticon.com/512/1827/1827392.png" alt="Notifications" />
                <span>Notifications</span>
              </Link> */}

              <button className="menu-item logout-btn" onClick={handleLogout}>
                <FaSignOutAlt className="menu-icon" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserDashboard; 