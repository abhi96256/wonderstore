import React from 'react';
import './Notifications.css';

const Notifications = () => {
  return (
    <div className="notifications-container">
      <h2>Notifications</h2>
      <div className="notification-list">
        <div className="notification-item unread">
          <span className="notification-title">Order Shipped</span>
          <span className="notification-message">Your order ORD123456 has been shipped and is on its way!</span>
          <span className="notification-date">May 4, 2024</span>
        </div>
        <div className="notification-item">
          <span className="notification-title">Payment Received</span>
          <span className="notification-message">We have received your payment for order ORD123456.</span>
          <span className="notification-date">May 3, 2024</span>
        </div>
        <div className="notification-item">
          <span className="notification-title">Welcome to UniqueStore!</span>
          <span className="notification-message">Thank you for signing up. Enjoy shopping with us!</span>
          <span className="notification-date">May 1, 2024</span>
        </div>
      </div>
    </div>
  );
};

export default Notifications; 