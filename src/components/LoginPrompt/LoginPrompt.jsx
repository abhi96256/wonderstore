import React from 'react';
import { FaLock } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './LoginPrompt.css';

const LoginPrompt = ({ message }) => {
  return (
    <div className="login-prompt-container">
      <div className="login-prompt-icon">
        <FaLock />
      </div>
      <h2 className="login-prompt-title">Login Required</h2>
      <p className="login-prompt-message">
        {message || "Please login to continue"}
      </p>
      <div className="login-prompt-actions">
        <Link to="/login" className="login-prompt-button primary">
          Login Now
        </Link>
        <Link to="/signup" className="login-prompt-link">
          Don't have an account? Sign Up
        </Link>
      </div>
    </div>
  );
};

export default LoginPrompt; 