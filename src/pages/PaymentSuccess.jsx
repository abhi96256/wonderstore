import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaArrowRight, FaExclamationTriangle } from 'react-icons/fa';
import { getOrder } from '../firebase/firestore';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        if (!orderId) {
          throw new Error('No order ID provided');
        }
        
        try {
          const orderData = await getOrder(orderId);
          setOrder(orderData);
        } catch (err) {
          console.error('Error fetching order:', err);
          // We still consider the payment successful, just couldn't fetch details
          setError('Could not fetch complete order details, but your payment has been received.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="payment-status-container">
        <div className="payment-status-content">
          <div className="loading-spinner"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  // Even if there's an error, we'll show success since payment went through
  // We'll just show a simplified view without order details
  return (
    <div className="payment-status-container">
      <div className="payment-status-content success">
        <div className="success-icon">
          <FaCheckCircle />
        </div>
        <h1>Payment Successful!</h1>
        <p className="success-message">
          Thank you for your purchase. Your order has been confirmed.
        </p>

        {error && (
          <div className="order-warning">
            <FaExclamationTriangle />
            <p>{error}</p>
          </div>
        )}

        {orderId && (
          <div className="basic-order-info">
            <p>Order ID: {orderId}</p>
          </div>
        )}

        {order && (
          <div className="order-details">
            <h2>Order Details</h2>
            <div className="order-info">
              <div className="info-row">
                <span>Order ID:</span>
                <span>#{order.razorpay_order_id || order.id}</span>
              </div>
              <div className="info-row">
                <span>Amount:</span>
                <span>₹{(order.amount / 100).toFixed(2)}</span>
              </div>
              <div className="info-row">
                <span>Status:</span>
                <span className="status-badge success">{order.status || 'Successful'}</span>
              </div>
              <div className="info-row">
                <span>Date:</span>
                <span>{order.created_at?.toDate?.() ? order.created_at.toDate().toLocaleString() : new Date().toLocaleString()}</span>
              </div>
            </div>

            {order.items && order.items.length > 0 && (
              <div className="order-items">
                <h3>Order Items</h3>
                <div className="items-list">
                  {order.items.map((item, index) => (
                    <div key={index} className="item">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">x{item.quantity}</span>
                      <span className="item-price">₹{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="action-buttons">
          <button onClick={() => navigate('/my-orders')} className="view-orders-button">
            View My Orders <FaArrowRight />
          </button>
          <button onClick={() => navigate('/')} className="continue-shopping-button">
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess; 