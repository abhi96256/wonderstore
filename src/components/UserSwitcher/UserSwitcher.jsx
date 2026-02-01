import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaUser } from 'react-icons/fa';
import './UserSwitcher.css';

const UserSwitcher = () => {
  const { currentUser } = useAuth();

  return (
    <div className="user-switcher">
      <div className="user-info">
        <FaUser className="user-icon" />
        <span className="user-email">
          {currentUser ? currentUser.email : 'Guest'}
        </span>
      </div>
    </div>
  );
};

export default UserSwitcher; 