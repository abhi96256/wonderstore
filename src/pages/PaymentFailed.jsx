import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaTimesCircle, FaRedo, FaArrowRight } from 'react-icons/fa';
import { getOrder } from '../firebase/firestore';
import './PaymentSuccess.css';

const PaymentFailed = () => {
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
        const orderData = await getOrder(orderId);
        setOrder(orderData);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to fetch order details');
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

  if (error) {
    return (
      <div className="payment-status-container">
        <div className="payment-status-content error">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="home-button">
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-status-container">
      <div className="payment-status-content failed">
        <div className="failed-icon">
          <FaTimesCircle />
        </div>
        <h1>Payment Failed</h1>
        <p className="failed-message">
          We're sorry, but your payment could not be processed. Please try again.
        </p>

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
                <span className="status-badge failed">{order.status}</span>
              </div>
              <div className="info-row">
                <span>Date:</span>
                <span>{order.created_at?.toDate().toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        <div className="action-buttons">
          <button onClick={() => navigate('/cart')} className="retry-payment-button">
            <FaRedo /> Retry Payment
          </button>
          <button onClick={() => navigate('/')} className="continue-shopping-button">
            Continue Shopping
          </button>
        </div>

        <div className="help-section">
          <h3>Need Help?</h3>
          <p>If you're experiencing issues with your payment, please contact our support team:</p>
          <ul>
            <li>Email: support@uniquestore.com</li>
            <li>Phone: +91 1234567890</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed; 