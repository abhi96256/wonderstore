import React, { useState, useEffect } from 'react';
import './Notifications.css';
import { FaBell, FaTrash, FaCheckCircle, FaFilter, FaSpinner } from 'react-icons/fa';
import { collection, query, orderBy, getDocs, updateDoc, doc, deleteDoc, where, addDoc, Timestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread, orders, users, system
  const [refreshKey, setRefreshKey] = useState(0); // Used to force refresh

  // Fetch notifications from Firestore
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        
        // Create a query against the notifications collection
        const notificationsRef = collection(db, 'admin_notifications');
        
        // Query with filter if needed
        let notificationsQuery;
        if (filter === 'unread') {
          notificationsQuery = query(
            notificationsRef,
            where('read', '==', false),
            orderBy('timestamp', 'desc')
          );
        } else if (filter !== 'all') {
          notificationsQuery = query(
            notificationsRef,
            where('category', '==', filter),
            orderBy('timestamp', 'desc')
          );
        } else {
          notificationsQuery = query(
            notificationsRef,
            orderBy('timestamp', 'desc')
          );
        }
        
        // Set up real-time listener
        const unsubscribe = onSnapshot(notificationsQuery, (querySnapshot) => {
          const notificationsList = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            const timestamp = data.timestamp?.toDate() || new Date();
            
            notificationsList.push({
              id: doc.id,
              text: data.text,
              time: formatTimestamp(timestamp),
              read: data.read || false,
              category: data.category || 'system',
              timestamp: timestamp,
              details: data.details || {}
            });
          });
          
          setNotifications(notificationsList);
          setLoading(false);
        }, (err) => {
          console.error("Error fetching notifications:", err);
          setError("Failed to load notifications");
          setLoading(false);
        });
        
        // Cleanup subscription on component unmount
        return () => unsubscribe();
        
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Failed to load notifications");
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, [filter, refreshKey]);
  
  // Format timestamp to relative time (e.g., "2 min ago")
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = Math.floor((now - timestamp) / 1000); // Difference in seconds
    
    if (diff < 60) return `${diff} sec ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
    
    // If older than a month, return the date
    return timestamp.toLocaleDateString();
  };

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      const notificationRef = doc(db, 'admin_notifications', id);
      await updateDoc(notificationRef, {
        read: true
      });
      
      // Optimistically update the UI
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (err) {
      console.error("Error marking notification as read:", err);
      setError("Failed to update notification");
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // Get all unread notifications
      const unreadNotifications = notifications.filter(n => !n.read);
      
      // Update each notification
      const updatePromises = unreadNotifications.map(notification => {
        const notificationRef = doc(db, 'admin_notifications', notification.id);
        return updateDoc(notificationRef, { read: true });
      });
      
      await Promise.all(updatePromises);
      
      // Optimistically update the UI
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      setError("Failed to update notifications");
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    try {
      const notificationRef = doc(db, 'admin_notifications', id);
      await deleteDoc(notificationRef);
      
      // Optimistically update the UI
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      console.error("Error deleting notification:", err);
      setError("Failed to delete notification");
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    if (window.confirm('Are you sure you want to delete all notifications?')) {
      try {
        const deletePromises = notifications.map(notification => {
          const notificationRef = doc(db, 'admin_notifications', notification.id);
          return deleteDoc(notificationRef);
        });
        
        await Promise.all(deletePromises);
        
        // Update the UI
        setNotifications([]);
      } catch (err) {
        console.error("Error clearing notifications:", err);
        setError("Failed to clear notifications");
      }
    }
  };

  // For testing: Create a test notification
  const createTestNotification = async (category) => {
    try {
      const categories = {
        order: {
          text: `New order #${Math.floor(1000 + Math.random() * 9000)} received`,
          details: { orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`, amount: Math.floor(500 + Math.random() * 5000) }
        },
        user: {
          text: `New user registered: ${['John', 'Jane', 'Mike', 'Sarah'][Math.floor(Math.random() * 4)]} ${['Smith', 'Doe', 'Johnson', 'Williams'][Math.floor(Math.random() * 4)]}`,
          details: { userId: `USR-${Math.floor(1000 + Math.random() * 9000)}` }
        },
        payment: {
          text: `Payment received for order #${Math.floor(1000 + Math.random() * 9000)}`,
          details: { amount: Math.floor(500 + Math.random() * 5000), method: ['Credit Card', 'UPI', 'Net Banking'][Math.floor(Math.random() * 3)] }
        },
        system: {
          text: 'System maintenance scheduled for tonight',
          details: { time: '02:00 AM', duration: '30 minutes' }
        }
      };
      
      const selectedCategory = category || Object.keys(categories)[Math.floor(Math.random() * Object.keys(categories).length)];
      const notificationData = categories[selectedCategory];
      
      await addDoc(collection(db, 'admin_notifications'), {
        text: notificationData.text,
        read: false,
        timestamp: Timestamp.now(),
        category: selectedCategory,
        details: notificationData.details
      });
      
      // Refresh the list
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error("Error creating test notification:", err);
    }
  };

  // Filter handling
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };
  
  // Get count of unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="notifications-admin-page">
        <div className="notifications-loading">
          <FaSpinner className="spinner" />
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notifications-admin-page">
        <div className="notifications-error">
          <h3>Error Loading Notifications</h3>
          <p>{error}</p>
          <button onClick={() => setRefreshKey(prev => prev + 1)}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-admin-page">
      <div className="notifications-header-row">
        <div className="notifications-title">
          <FaBell /> Notifications
          {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
        </div>
        <div className="notifications-actions">
          <div className="filter-dropdown">
            <button className="filter-button">
              <FaFilter /> {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
            <div className="filter-dropdown-content">
              <button onClick={() => handleFilterChange('all')}>All</button>
              <button onClick={() => handleFilterChange('unread')}>Unread</button>
              <button onClick={() => handleFilterChange('order')}>Orders</button>
              <button onClick={() => handleFilterChange('user')}>Users</button>
              <button onClick={() => handleFilterChange('payment')}>Payments</button>
              <button onClick={() => handleFilterChange('system')}>System</button>
            </div>
          </div>
          <button className="mark-all-read-btn" onClick={markAllAsRead} disabled={unreadCount === 0}>
            Mark All Read
          </button>
          <button className="clear-all-btn" onClick={clearAllNotifications} disabled={notifications.length === 0}>
            Clear All
          </button>
          {/* Dev only - remove in production */}
          <div className="notification-test-controls">
            <button onClick={() => createTestNotification('order')}>Test Order</button>
            <button onClick={() => createTestNotification('user')}>Test User</button>
            <button onClick={() => createTestNotification('payment')}>Test Payment</button>
          </div>
        </div>
      </div>
      <div className="notifications-list-wrapper">
        {notifications.length === 0 ? (
          <div className="no-notifications">No notifications available.</div>
        ) : (
          <ul className="notifications-list">
            {notifications.map((notif) => (
              <li key={notif.id} className={`${notif.read ? 'read' : ''} category-${notif.category}`}>
                <div className="notification-content">
                  <span className="notif-category-badge">{notif.category}</span>
                  <span className="notif-text">{notif.text}</span>
                  <span className="notif-time">{notif.time}</span>
                  
                  {/* Show details if any */}
                  {Object.keys(notif.details).length > 0 && (
                    <div className="notification-details">
                      {Object.entries(notif.details).map(([key, value]) => (
                        <div key={key} className="detail-item">
                          <span className="detail-label">{key}: </span>
                          <span className="detail-value">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="notif-actions">
                  {!notif.read && (
                    <button className="mark-read-btn" title="Mark as read" onClick={() => markAsRead(notif.id)}>
                      <FaCheckCircle />
                    </button>
                  )}
                  <button className="delete-btn" title="Delete" onClick={() => deleteNotification(notif.id)}>
                    <FaTrash />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notifications; 