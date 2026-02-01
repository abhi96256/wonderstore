import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import './MyOrders.css';
import { 
  FaSpinner, 
  FaShoppingBag, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaMoneyBillWave, 
  FaCheckCircle, 
  FaBox, 
  FaTruck, 
  FaClipboardCheck, 
  FaHome, 
  FaClock,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaCreditCard,
  FaRegClock,
  FaBarcode,
  FaShuttleVan,
  FaCalendarPlus,
  FaInfoCircle
} from 'react-icons/fa';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        if (user && user.uid) {
          // Fetch orders from successfulPayments collection
          const paymentsQuery = query(
            collection(db, 'successfulPayments'),
            where('userId', '==', user.uid),
            orderBy('payment_date', 'desc')
          );
          
          const querySnapshot = await getDocs(paymentsQuery);
          const ordersData = [];
          
          querySnapshot.forEach((doc) => {
            ordersData.push({
              id: doc.id,
              ...doc.data()
            });
          });
          
          setOrders(ordersData);
        } else {
          // If not logged in, check localStorage as fallback
          const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
          setOrders(storedOrders);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load your orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  // Format date function
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    // Handle Firestore timestamp
    if (timestamp && timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    // Handle ISO string or other date formats
    try {
      return new Date(timestamp).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  // Format time function
  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    // Handle Firestore timestamp
    if (timestamp && timestamp.toDate) {
      return timestamp.toDate().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // Handle ISO string or other date formats
    try {
      return new Date(timestamp).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  // Get order status with proper formatting
  const getOrderStatus = (order) => {
    const status = order.status || order.payment_status || order.fulfillment_status || 'Processing';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Get status color
  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('success') || statusLower.includes('complete') || statusLower === 'delivered') {
      return 'success';
    } else if (statusLower.includes('process') || statusLower === 'pending' || statusLower === 'shipping') {
      return 'processing';
    } else if (statusLower.includes('cancel') || statusLower.includes('fail')) {
      return 'cancelled';
    }
    return 'default';
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Get order images
  const getItemImages = (item) => {
    if (!item.image) return 'https://placehold.co/100x100?text=Product';
    
    // Handle comma-separated image URLs
    if (typeof item.image === 'string' && item.image.includes(',')) {
      return item.image.split(',')[0].trim();
    }
    
    return item.image;
  };

  // Get delivery steps
  const getDeliverySteps = (order) => {
    const status = getOrderStatus(order).toLowerCase();
    const steps = [
      { id: 'ordered', label: 'Order Placed', date: order.payment_date || order.created_at || order.orderDate },
      { id: 'processing', label: 'Processing', date: order.processing_date || null },
      { id: 'shipped', label: 'Shipped', date: order.shipping_date || null },
      { id: 'outForDelivery', label: 'Out for Delivery', date: order.out_for_delivery_date || null },
      { id: 'delivered', label: 'Delivered', date: order.delivery_date || null }
    ];

    // Set completion based on status
    if (status.includes('process')) {
      steps[0].completed = true;
      steps[1].active = true;
    } else if (status.includes('ship')) {
      steps[0].completed = true;
      steps[1].completed = true;
      steps[2].active = true;
    } else if (status.includes('out for delivery')) {
      steps[0].completed = true;
      steps[1].completed = true;
      steps[2].completed = true;
      steps[3].active = true;
    } else if (status.includes('deliver') || status.includes('complete') || status.includes('success')) {
      steps[0].completed = true;
      steps[1].completed = true;
      steps[2].completed = true;
      steps[3].completed = true;
      steps[4].completed = true;
      steps[4].active = true;
    } else {
      steps[0].active = true;
    }

    return steps;
  };

  // Get estimated delivery date
  const getEstimatedDelivery = (order) => {
    if (order.estimatedDeliveryDate) {
      if (order.estimatedDeliveryDate.toDate) {
        return order.estimatedDeliveryDate.toDate().toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      return new Date(order.estimatedDeliveryDate).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    // Fallback to default calculation if no estimated date is set
    if (!order.payment_date && !order.created_at && !order.orderDate) {
      return 'N/A';
    }
    
    let orderDate;
    if (order.payment_date && order.payment_date.toDate) {
      orderDate = order.payment_date.toDate();
    } else if (order.created_at && order.created_at.toDate) {
      orderDate = order.created_at.toDate();
    } else {
      orderDate = new Date(order.orderDate || Date.now());
    }
    
    const estimatedDate = new Date(orderDate);
    estimatedDate.setDate(orderDate.getDate() + 5);
    
    return estimatedDate.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="myorders">
        <div className="myorders-heading">
          <div className="myorders-heading-content">
            <h1 className="myorders-main-title">
              <FaShoppingBag /> My Orders
            </h1>
          </div>
        </div>
        <div className="myorders-divider"></div>
        <div className="myorders-loading">
          <FaSpinner className="myorders-spinner" />
          <p className="myorders-loading-text">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="myorders">
        <div className="myorders-heading">
          <div className="myorders-heading-content">
            <h1 className="myorders-main-title">
              <FaShoppingBag /> My Orders
            </h1>
          </div>
        </div>
        <div className="myorders-divider"></div>
        <div className="myorders-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="myorders">
      <div className="myorders-heading">
        <div className="myorders-heading-content">
          <h1 className="myorders-main-title">
            <FaShoppingBag /> My Orders
          </h1>
        </div>
      </div>
      <div className="myorders-divider"></div>
      
      {orders.length === 0 ? (
        <div className="myorders-no-orders">
          <p>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="myorders-count">
          {orders.length} order{orders.length !== 1 ? 's' : ''} placed
        </div>
      )}
      
      <div className="myorders-list">
        {orders.map(order => (
          <div key={order.id} className="myorders-card">
            <div className="myorders-card-header">
              <div className="myorders-id">
                Order: #{order.razorpay_order_id || order.id.substring(0, 8)}
              </div>
              <div className={`myorders-status myorders-status-${getStatusColor(getOrderStatus(order))}`}>
                <FaCheckCircle /> {getOrderStatus(order)}
              </div>
            </div>
            
            <div className="myorders-content">
              <div className="myorders-info">
                <div className="myorders-info-left">
                  <div className="myorders-info-item">
                    <FaCalendarAlt />
                    <span><span className="myorders-info-label">Order Date:</span> {formatDate(order.payment_date || order.created_at || order.orderDate)}</span>
                  </div>
                  <div className="myorders-info-item">
                    <FaRegClock />
                    <span><span className="myorders-info-label">Order Time:</span> {formatTime(order.payment_date || order.created_at || order.orderDate)}</span>
                  </div>
                  <div className="myorders-info-item">
                    <FaMoneyBillWave />
                    <span><span className="myorders-info-label">Total Amount:</span> {formatCurrency(order.amount || order.total_amount || order.orderTotal || 0)}</span>
                  </div>
                </div>
                <div className="myorders-info-right">
                  <div className="myorders-info-item">
                    <FaCreditCard />
                    <span><span className="myorders-info-label">Payment Method:</span> {order.payment_method || 'Online Payment'}</span>
                  </div>
                  <div className="myorders-info-item">
                    <FaBox />
                    <span><span className="myorders-info-label">Items:</span> {(order.items || []).length} item(s)</span>
                  </div>
                  <div className="myorders-info-item">
                    <FaTruck />
                    <span><span className="myorders-info-label">Expected Delivery:</span> {getEstimatedDelivery(order)}</span>
                  </div>
                </div>
              </div>
              
              <div className="myorders-items-container">
                <div className="myorders-items-title">
                  <FaBox /> Order Items
                </div>
                <div className="myorders-items">
                  {(order.items || []).map((item, index) => (
                    <div key={index} className="myorders-item">
                      <div className="myorders-item-image">
                        <img 
                          src={getItemImages(item)} 
                          alt={item.name} 
                          onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=Product' }}
                        />
                      </div>
                      <div className="myorders-item-details">
                        <div className="myorders-item-name">{item.name}</div>
                        <div className="myorders-item-price-qty">
                          <span className="myorders-item-price">{formatCurrency(item.price || 0)}</span>
                          <span className="myorders-item-qty">x{item.quantity || item.qty || 1}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {order.shippingAddress && (
                <div className="myorders-address">
                  <div className="myorders-address-header">
                    <FaMapMarkerAlt />
                    <span>Delivery Information</span>
                  </div>
                  <div className="myorders-address-content">
                    <div className="myorders-address-details">
                      <div className="myorders-address-name">
                        <FaUser /> {order.shippingAddress.fullName}
                      </div>
                      <div className="myorders-address-text">
                        <FaHome /> {order.shippingAddress.addressLine1},
                        {order.shippingAddress.addressLine2 && ` ${order.shippingAddress.addressLine2},`}<br />
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                      </div>
                      <div className="myorders-address-phone">
                        <FaPhone /> {order.shippingAddress.mobile}
                      </div>
                    </div>
                    <div className="myorders-address-details">
                      {order.email && (
                        <div className="myorders-address-text">
                          <FaEnvelope /> {order.email}
                        </div>
                      )}
                      {order.shippingMethod && (
                        <div className="myorders-address-text">
                          <FaTruck /> Shipping: {order.shippingMethod}
                        </div>
                      )}
                      {order.special_instructions && (
                        <div className="myorders-address-text">
                          <FaClipboardCheck /> Notes: {order.special_instructions}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="myorders-delivery">
                <div className="myorders-delivery-header">
                  <FaTruck />
                  <span>Delivery Status</span>
                </div>
                <div className="myorders-delivery-tracker">
                  {getDeliverySteps(order).map((step) => (
                    <div 
                      key={step.id} 
                      className={`myorders-delivery-step ${step.active ? 'myorders-step-active' : ''} ${step.completed ? 'myorders-step-completed' : ''}`}
                    >
                      <div className="myorders-step-icon">
                        {step.id === 'ordered' && <FaClipboardCheck />}
                        {step.id === 'processing' && <FaClock />}
                        {step.id === 'shipped' && <FaTruck />}
                        {step.id === 'outForDelivery' && <FaTruck />}
                        {step.id === 'delivered' && <FaHome />}
                      </div>
                      <div className="myorders-step-label">{step.label}</div>
                      {step.date && (
                        <div className="myorders-step-date">{formatDate(step.date)}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {(order.trackingNumber || order.carrier || order.estimatedDeliveryDate || order.additionalNotes) && (
                <div className="myorders-tracking">
                  <div className="myorders-tracking-header">
                    <FaBarcode />
                    <span>Tracking Information</span>
                  </div>
                  <div className="myorders-tracking-content">
                    {order.trackingNumber && (
                      <div className="myorders-tracking-item">
                        <FaBarcode />
                        <span><span className="myorders-tracking-label">Tracking Number:</span> {order.trackingNumber}</span>
                      </div>
                    )}
                    {order.carrier && (
                      <div className="myorders-tracking-item">
                        <FaShuttleVan />
                        <span><span className="myorders-tracking-label">Carrier:</span> {order.carrier}</span>
                      </div>
                    )}
                    {order.estimatedDeliveryDate && (
                      <div className="myorders-tracking-item">
                        <FaCalendarPlus />
                        <span><span className="myorders-tracking-label">Estimated Delivery:</span> {getEstimatedDelivery(order)}</span>
                      </div>
                    )}
                    {order.additionalNotes && (
                      <div className="myorders-tracking-item">
                        <FaInfoCircle />
                        <span><span className="myorders-tracking-label">Additional Notes:</span> {order.additionalNotes}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders; 