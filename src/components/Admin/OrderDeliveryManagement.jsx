import React, { useState, useEffect } from 'react';
import {
  FaShippingFast,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaBoxOpen,
  FaCheck,
  FaTimesCircle,
  FaInfoCircle,
  FaTruck,
  FaExchangeAlt,
  FaSearch,
  FaFilter,
  FaSyncAlt,
  FaClock,
  FaEdit,
  FaCheckCircle,
  FaHome,
  FaClipboardCheck,
  FaPaperPlane,
  FaBarcode,
  FaShuttleVan,
  FaCalendarPlus,
  FaPhone,
  FaEnvelope,
  FaSms,
  FaSave
} from 'react-icons/fa';
import { collection, query, getDocs, doc, updateDoc, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import './OrderDeliveryManagement.css';

// Helper function to get the first image from a comma-separated list
const getFirstImage = (imageField) => {
  if (!imageField) return null;
  const imagesArr = imageField.split(',').map(img => img.trim()).filter(Boolean);
  if (imagesArr.length > 0) {
    return imagesArr[0].startsWith('/') ? imagesArr[0] : `/${imagesArr[0]}`;
  }
  return null;
};

const OrderDeliveryManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [trackingInfo, setTrackingInfo] = useState({
    trackingNumber: '',
    carrier: '',
    estimatedDeliveryDate: '',
    additionalNotes: ''
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    // Apply filters when orders, searchTerm, or statusFilter changes
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      // Fetch orders from successfulPayments collection
      const paymentsQuery = query(
        collection(db, 'successfulPayments'),
        orderBy('payment_date', 'desc')
      );

      const querySnapshot = await getDocs(paymentsQuery);
      const ordersData = [];

      querySnapshot.forEach((doc) => {
        ordersData.push({
          id: doc.id,
          ...doc.data(),
          source: 'successfulPayments'
        });
      });

      // Also fetch from orders collection if it exists
      const ordersQuery = query(
        collection(db, 'orders'),
        orderBy('created_at', 'desc')
      );

      const ordersSnapshot = await getDocs(ordersQuery);

      ordersSnapshot.forEach((doc) => {
        ordersData.push({
          id: doc.id,
          ...doc.data(),
          source: 'orders'
        });
      });

      // Process orders
      const processedOrders = ordersData.map(order => {
        // Determine delivery status
        const status = order.status || order.payment_status || order.fulfillment_status || 'Processing';

        // Determine stages and delivery tracking
        const orderStages = getOrderStages(order, status);

        return {
          ...order,
          deliveryStatus: status,
          stages: orderStages,
          currentStage: getCurrentStage(orderStages),
          trackingNumber: order.trackingNumber || '',
          carrier: order.carrier || '',
          estimatedDeliveryDate: order.estimatedDeliveryDate || '',
          additionalNotes: order.additionalNotes || ''
        };
      });

      setOrders(processedOrders);
      setFilteredOrders(processedOrders);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let result = [...orders];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(order =>
        (order.id && order.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.razorpay_order_id && order.razorpay_order_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.razorpay_payment_id && order.razorpay_payment_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.userDetails?.name && order.userDetails.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.userDetails?.email && order.userDetails.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.userDetails?.phone && order.userDetails.phone.includes(searchTerm)) ||
        (order.shippingAddress?.fullName && order.shippingAddress.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.trackingNumber && order.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(order => {
        const status = (order.status || order.deliveryStatus || '').toLowerCase();
        return status.includes(statusFilter.toLowerCase());
      });
    }

    setFilteredOrders(result);
  };

  const getOrderStages = (order, status) => {
    const statusLower = status.toLowerCase();
    const defaultStages = [
      { id: 'ordered', label: 'Order Placed', completed: true, date: order.payment_date || order.created_at || new Date() },
      { id: 'processing', label: 'Processing', completed: false, date: order.processing_date || null },
      { id: 'shipped', label: 'Shipped', completed: false, date: order.shipping_date || null },
      { id: 'outForDelivery', label: 'Out for Delivery', completed: false, date: order.out_for_delivery_date || null },
      { id: 'delivered', label: 'Delivered', completed: false, date: order.delivery_date || null }
    ];

    // Update stages based on current status
    if (statusLower.includes('process')) {
      defaultStages[1].completed = true;
      defaultStages[1].active = true;
    }

    if (statusLower.includes('ship')) {
      defaultStages[1].completed = true;
      defaultStages[2].completed = true;
      defaultStages[2].active = true;
    }

    if (statusLower.includes('out for delivery')) {
      defaultStages[1].completed = true;
      defaultStages[2].completed = true;
      defaultStages[3].completed = true;
      defaultStages[3].active = true;
    }

    if (statusLower.includes('deliver') || statusLower.includes('complete') || statusLower.includes('success')) {
      defaultStages[1].completed = true;
      defaultStages[2].completed = true;
      defaultStages[3].completed = true;
      defaultStages[4].completed = true;
      defaultStages[4].active = true;
    }

    return defaultStages;
  };

  const getCurrentStage = (stages) => {
    for (let i = stages.length - 1; i >= 0; i--) {
      if (stages[i].completed) {
        return stages[i].id;
      }
    }
    return 'ordered';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';

    // Handle Firestore timestamp
    if (timestamp && timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    // Handle regular Date object or ISO string
    try {
      return new Date(timestamp).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  const formatDateForInput = (timestamp) => {
    if (!timestamp) return '';

    try {
      // If it's a Firestore timestamp
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toISOString().slice(0, 16); // Format for datetime-local input: YYYY-MM-DDTHH:MM
    } catch (e) {
      return '';
    }
  };

  const updateOrderDeliveryStatus = async (orderId, newStatus, source, notify = false) => {
    if (!orderId || !newStatus || !source) {
      console.error('Invalid parameters for updateOrderDeliveryStatus');
      return;
    }

    try {
      setUpdatingOrderId(orderId);

      // Create date field name based on status
      let dateFieldName = '';
      switch (newStatus.toLowerCase()) {
        case 'processing':
          dateFieldName = 'processing_date';
          break;
        case 'shipped':
          dateFieldName = 'shipping_date';
          break;
        case 'out for delivery':
          dateFieldName = 'out_for_delivery_date';
          break;
        case 'delivered':
          dateFieldName = 'delivery_date';
          break;
        default:
          dateFieldName = 'status_update_date';
      }

      // Create update data
      const updateData = {
        status: newStatus,
        [dateFieldName]: new Date()
      };

      // Update in Firestore
      const orderRef = doc(db, source, orderId);
      await updateDoc(orderRef, updateData);

      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(order => {
          if (order.id === orderId) {
            const updatedStages = getOrderStages(order, newStatus);

            // Update the specific stage date
            updatedStages.forEach(stage => {
              if (
                (stage.id === 'processing' && newStatus.toLowerCase() === 'processing') ||
                (stage.id === 'shipped' && newStatus.toLowerCase() === 'shipped') ||
                (stage.id === 'outForDelivery' && newStatus.toLowerCase() === 'out for delivery') ||
                (stage.id === 'delivered' && newStatus.toLowerCase() === 'delivered')
              ) {
                stage.date = new Date();
              }
            });

            return {
              ...order,
              status: newStatus,
              deliveryStatus: newStatus,
              [dateFieldName]: new Date(),
              stages: updatedStages,
              currentStage: getCurrentStage(updatedStages)
            };
          }
          return order;
        })
      );

      // Show notification if requested
      if (notify) {
        showNotificationMessage(`Order status updated to ${newStatus}`);
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      showNotificationMessage('Failed to update order status', 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const updateTrackingInfo = async () => {
    if (!selectedOrder) return;

    try {
      setUpdatingOrderId(selectedOrder.id);

      // Create update data
      const updateData = {
        trackingNumber: trackingInfo.trackingNumber,
        carrier: trackingInfo.carrier,
        estimatedDeliveryDate: trackingInfo.estimatedDeliveryDate ? new Date(trackingInfo.estimatedDeliveryDate) : null,
        additionalNotes: trackingInfo.additionalNotes
      };

      // Update in Firestore
      const orderRef = doc(db, selectedOrder.source, selectedOrder.id);
      await updateDoc(orderRef, updateData);

      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(order => {
          if (order.id === selectedOrder.id) {
            return {
              ...order,
              ...updateData
            };
          }
          return order;
        })
      );

      // Show notification
      showNotificationMessage('Tracking information updated successfully');

      // Update the selected order
      setSelectedOrder(prev => ({
        ...prev,
        ...updateData
      }));

    } catch (err) {
      console.error('Error updating tracking info:', err);
      showNotificationMessage('Failed to update tracking information', 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const updateStageDate = async () => {
    if (!selectedOrder || !selectedStage || !selectedDate) return;

    try {
      setUpdatingOrderId(selectedOrder.id);

      // Determine the date field name based on the stage
      let dateFieldName = '';
      switch (selectedStage.id) {
        case 'ordered':
          dateFieldName = 'payment_date';
          break;
        case 'processing':
          dateFieldName = 'processing_date';
          break;
        case 'shipped':
          dateFieldName = 'shipping_date';
          break;
        case 'outForDelivery':
          dateFieldName = 'out_for_delivery_date';
          break;
        case 'delivered':
          dateFieldName = 'delivery_date';
          break;
        default:
          dateFieldName = 'status_update_date';
      }

      // Create the date object
      const newDate = new Date(selectedDate);

      // Update in Firestore
      const orderRef = doc(db, selectedOrder.source, selectedOrder.id);
      await updateDoc(orderRef, {
        [dateFieldName]: newDate
      });

      // Update local state - orders
      setOrders(prevOrders =>
        prevOrders.map(order => {
          if (order.id === selectedOrder.id) {
            const updatedStages = [...order.stages];

            // Update the specific stage date
            updatedStages.forEach(stage => {
              if (stage.id === selectedStage.id) {
                stage.date = newDate;
              }
            });

            return {
              ...order,
              [dateFieldName]: newDate,
              stages: updatedStages
            };
          }
          return order;
        })
      );

      // Update selected order
      setSelectedOrder(prev => {
        const updatedStages = [...prev.stages];

        // Update the specific stage date
        updatedStages.forEach(stage => {
          if (stage.id === selectedStage.id) {
            stage.date = newDate;
          }
        });

        return {
          ...prev,
          [dateFieldName]: newDate,
          stages: updatedStages
        };
      });

      // Close modal and show notification
      setShowDateModal(false);
      showNotificationMessage(`Date for ${selectedStage.label} updated successfully`);

    } catch (err) {
      console.error('Error updating stage date:', err);
      showNotificationMessage('Failed to update date', 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const showNotificationMessage = (message, type = 'success') => {
    setNotificationMessage(message);
    setShowNotification(true);

    // Auto-hide after 3 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
    // Initialize tracking info with the selected order's data
    setTrackingInfo({
      trackingNumber: order.trackingNumber || '',
      carrier: order.carrier || '',
      estimatedDeliveryDate: order.estimatedDeliveryDate ?
        formatDateForInput(order.estimatedDeliveryDate) : '',
      additionalNotes: order.additionalNotes || ''
    });
  };

  const handleEditDate = (stage) => {
    setSelectedStage(stage);
    setSelectedDate(formatDateForInput(stage.date));
    setShowDateModal(true);
  };

  const sendDeliveryUpdateToCustomer = async (orderId, message, method = 'email') => {
    // This is a placeholder for actual notification functionality
    // You would implement SMS/email notifications here
    console.log(`Sending ${method} notification for order ${orderId}: ${message}`);
    showNotificationMessage(`Delivery update notification sent to customer via ${method}`);
  };

  // Update the getItemImages function to use getFirstImage
  const getItemImages = (item) => {
    if (!item.image) return 'https://placehold.co/100x100?text=Product';
    const firstImage = getFirstImage(item.image);
    return firstImage || 'https://placehold.co/100x100?text=Product';
  };

  if (loading) {
    return (
      <div className="delivery-management-loading">
        <FaSyncAlt className="spinner" />
        <p>Loading orders data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="delivery-management-error">
        <FaTimesCircle />
        <p>{error}</p>
        <button onClick={fetchOrders}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="delivery-management-container">
      <div className="delivery-management-header">
        <h1><FaTruck /> Order Delivery Management</h1>
        <div className="header-actions">
          <button className="refresh-button" onClick={fetchOrders}>
            <FaSyncAlt /> Refresh
          </button>
        </div>
      </div>

      <div className="delivery-management-filters">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search by order ID, customer name, tracking number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-dropdown">
          <FaFilter />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="out for delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="delivery-management-content">
        <div className="orders-list">
          <h2>Orders ({filteredOrders.length})</h2>

          {filteredOrders.length === 0 ? (
            <div className="no-orders">
              <FaInfoCircle />
              <p>No orders match your search criteria</p>
            </div>
          ) : (
            <div className="order-cards">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className={`order-card ${selectedOrder?.id === order.id ? 'selected' : ''}`}
                  onClick={() => handleOrderSelect(order)}
                >
                  <div className="order-card-header">
                    <div className="order-id">
                      #{order.razorpay_order_id || order.id.substring(0, 8)}
                    </div>
                    <div className={`order-status status-${order.deliveryStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                      {order.deliveryStatus}
                    </div>
                  </div>

                  <div className="order-card-body">
                    <div className="customer-info">
                      <div className="customer-name">
                        {order.userDetails?.name || order.shippingAddress?.fullName || 'N/A'}
                      </div>
                      <div className="order-date">
                        <FaCalendarAlt />
                        {formatDate(order.payment_date || order.created_at)}
                      </div>
                    </div>

                    {order.trackingNumber && (
                      <div className="tracking-info">
                        <FaBarcode /> {order.trackingNumber}
                      </div>
                    )}

                    <div className="delivery-progress">
                      {order.stages.map((stage, index) => (
                        <div
                          key={stage.id}
                          className={`progress-dot ${stage.completed ? 'completed' : ''} ${stage.active ? 'active' : ''}`}
                          style={{ left: `${(index / (order.stages.length - 1)) * 100}%` }}
                        />
                      ))}
                      <div className="progress-line">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${((order.stages.findIndex(s => s.id === order.currentStage)) /
                                (order.stages.length - 1)) * 100
                              }%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedOrder && (
          <div className="order-details">
            <h2>Order Details</h2>
            <div className="order-details-content">
              <div className="order-info-section">
                <h3>Order Information</h3>
                <div className="order-info-grid">
                  <div className="info-item">
                    <span className="info-label">Order ID:</span>
                    <span className="info-value">{selectedOrder.razorpay_order_id || selectedOrder.id}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Date:</span>
                    <span className="info-value">{formatDate(selectedOrder.payment_date || selectedOrder.created_at)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Status:</span>
                    <span className="info-value status-badge">
                      {selectedOrder.deliveryStatus}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Payment:</span>
                    <span className="info-value">{selectedOrder.payment_method || 'Online Payment'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Amount:</span>
                    <span className="info-value">₹{selectedOrder.amount || selectedOrder.total_amount || 0}</span>
                  </div>
                </div>
              </div>

              <div className="tracking-info-section">
                <h3>Tracking Information</h3>
                <div className="tracking-form">
                  <div className="tracking-form-row">
                    <div className="tracking-form-group">
                      <label>Tracking Number</label>
                      <div className="input-with-icon">
                        <FaBarcode className="input-icon" />
                        <input
                          type="text"
                          value={trackingInfo.trackingNumber}
                          onChange={(e) => setTrackingInfo({ ...trackingInfo, trackingNumber: e.target.value })}
                          placeholder="Enter tracking number"
                        />
                      </div>
                    </div>
                    <div className="tracking-form-group">
                      <label>Shipping Carrier</label>
                      <div className="input-with-icon">
                        <FaShuttleVan className="input-icon" />
                        <input
                          type="text"
                          value={trackingInfo.carrier}
                          onChange={(e) => setTrackingInfo({ ...trackingInfo, carrier: e.target.value })}
                          placeholder="Enter carrier name"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="tracking-form-row">
                    <div className="tracking-form-group">
                      <label>Estimated Delivery Date</label>
                      <div className="input-with-icon">
                        <FaCalendarPlus className="input-icon" />
                        <input
                          type="datetime-local"
                          value={trackingInfo.estimatedDeliveryDate}
                          onChange={(e) => setTrackingInfo({ ...trackingInfo, estimatedDeliveryDate: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="tracking-form-row">
                    <div className="tracking-form-group full-width">
                      <label>Additional Notes</label>
                      <textarea
                        value={trackingInfo.additionalNotes}
                        onChange={(e) => setTrackingInfo({ ...trackingInfo, additionalNotes: e.target.value })}
                        placeholder="Add any special delivery instructions or notes"
                        rows="2"
                      />
                    </div>
                  </div>
                  <button
                    className="update-tracking-btn"
                    onClick={updateTrackingInfo}
                    disabled={updatingOrderId === selectedOrder.id}
                  >
                    <FaSave /> Update Tracking Information
                  </button>
                </div>
              </div>

              <div className="customer-details-section">
                <h3>Customer Information</h3>
                <div className="customer-details-grid">
                  <div className="info-item">
                    <span className="info-label">Name:</span>
                    <span className="info-value">{selectedOrder.userDetails?.name || selectedOrder.shippingAddress?.fullName || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{selectedOrder.userDetails?.email || selectedOrder.email || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Phone:</span>
                    <span className="info-value">{selectedOrder.userDetails?.phone || selectedOrder.shippingAddress?.mobile || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="shipping-details-section">
                <h3>Shipping Information</h3>
                <div className="shipping-address">
                  <FaMapMarkerAlt className="address-icon" />
                  <div className="address-text">
                    {selectedOrder.shippingAddress?.fullName && <div className="address-name">{selectedOrder.shippingAddress.fullName}</div>}
                    <div>
                      {selectedOrder.shippingAddress?.addressLine1 || 'N/A'}
                      {selectedOrder.shippingAddress?.addressLine2 && `, ${selectedOrder.shippingAddress.addressLine2}`}
                    </div>
                    <div>
                      {selectedOrder.shippingAddress?.city || 'N/A'},
                      {selectedOrder.shippingAddress?.state || 'N/A'}
                      {selectedOrder.shippingAddress?.pincode || 'N/A'}
                    </div>
                    <div className="address-phone">
                      {selectedOrder.shippingAddress?.mobile || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="items-section">
                <h3>Order Items</h3>
                <div className="order-items">
                  {(selectedOrder.items || []).map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="item-image">
                        <img
                          src={getItemImages(item)}
                          alt={item.name}
                          onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=Product' }}
                        />
                      </div>
                      <div className="item-details">
                        <div className="item-name">{item.name}</div>
                        <div className="item-price-qty">
                          <span>₹{item.price || 0}</span>
                          <span>×</span>
                          <span>{item.quantity || item.qty || 1}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="delivery-tracking-section">
                <h3>Delivery Tracking</h3>
                <div className="delivery-timeline">
                  {selectedOrder.stages.map((stage) => (
                    <div
                      key={stage.id}
                      className={`timeline-item ${stage.completed ? 'completed' : ''} ${stage.active ? 'active' : ''}`}
                    >
                      <div className="timeline-icon">
                        {stage.id === 'ordered' && <FaClipboardCheck />}
                        {stage.id === 'processing' && <FaClock />}
                        {stage.id === 'shipped' && <FaShippingFast />}
                        {stage.id === 'outForDelivery' && <FaTruck />}
                        {stage.id === 'delivered' && <FaHome />}
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-title">{stage.label}</div>
                        <div className="timeline-date">
                          {stage.date ? (
                            <div className="date-with-edit">
                              <span>{formatDate(stage.date)}</span>
                              <button
                                className="edit-date-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditDate(stage);
                                }}
                              >
                                <FaEdit />
                              </button>
                            </div>
                          ) : (
                            'Pending'
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="update-status-section">
                <h3>Update Delivery Status</h3>
                <div className="status-actions">
                  <button
                    className={`status-btn processing ${selectedOrder.deliveryStatus.toLowerCase() === 'processing' ? 'current' : ''}`}
                    onClick={() => updateOrderDeliveryStatus(selectedOrder.id, 'Processing', selectedOrder.source, true)}
                    disabled={updatingOrderId === selectedOrder.id}
                  >
                    <FaClock /> Processing
                  </button>
                  <button
                    className={`status-btn shipped ${selectedOrder.deliveryStatus.toLowerCase() === 'shipped' ? 'current' : ''}`}
                    onClick={() => updateOrderDeliveryStatus(selectedOrder.id, 'Shipped', selectedOrder.source, true)}
                    disabled={updatingOrderId === selectedOrder.id}
                  >
                    <FaShippingFast /> Shipped
                  </button>
                  <button
                    className={`status-btn out-for-delivery ${selectedOrder.deliveryStatus.toLowerCase() === 'out for delivery' ? 'current' : ''}`}
                    onClick={() => updateOrderDeliveryStatus(selectedOrder.id, 'Out for Delivery', selectedOrder.source, true)}
                    disabled={updatingOrderId === selectedOrder.id}
                  >
                    <FaTruck /> Out for Delivery
                  </button>
                  <button
                    className={`status-btn delivered ${selectedOrder.deliveryStatus.toLowerCase() === 'delivered' ? 'current' : ''}`}
                    onClick={() => updateOrderDeliveryStatus(selectedOrder.id, 'Delivered', selectedOrder.source, true)}
                    disabled={updatingOrderId === selectedOrder.id}
                  >
                    <FaCheckCircle /> Delivered
                  </button>
                </div>

                <div className="customer-notification">
                  <h4><FaPaperPlane /> Notify Customer</h4>
                  <div className="notification-options">
                    <button
                      className="notification-btn email"
                      onClick={() => sendDeliveryUpdateToCustomer(
                        selectedOrder.id,
                        `Your order #${selectedOrder.razorpay_order_id || selectedOrder.id} status has been updated to: ${selectedOrder.deliveryStatus}`,
                        'email'
                      )}
                    >
                      <FaEnvelope /> Send Email
                    </button>
                    <button
                      className="notification-btn sms"
                      onClick={() => sendDeliveryUpdateToCustomer(
                        selectedOrder.id,
                        `UniqueStore: Your order #${selectedOrder.razorpay_order_id || selectedOrder.id.substring(0, 8)} is now ${selectedOrder.deliveryStatus}.`,
                        'SMS'
                      )}
                    >
                      <FaSms /> Send SMS
                    </button>
                    <button
                      className="notification-btn phone"
                      onClick={() => sendDeliveryUpdateToCustomer(
                        selectedOrder.id,
                        `Calling customer about order #${selectedOrder.razorpay_order_id || selectedOrder.id}`,
                        'phone'
                      )}
                    >
                      <FaPhone /> Call Customer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Date Edit Modal */}
      {showDateModal && selectedStage && (
        <div className="modal-overlay">
          <div className="date-edit-modal">
            <h3>Edit Date for {selectedStage.label}</h3>
            <div className="date-input-container">
              <label>Date and Time</label>
              <input
                type="datetime-local"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowDateModal(false)}>Cancel</button>
              <button className="save-btn" onClick={updateStageDate}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Notification toast */}
      {showNotification && (
        <div className="notification-toast">
          {notificationMessage}
        </div>
      )}
    </div>
  );
};

export default OrderDeliveryManagement; 