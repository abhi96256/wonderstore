import React, { useState } from 'react';
import './OrderTracking.css';

const mockOrder = {
  id: 'UNIQ12345',
  email: 'customer@email.com',
  date: '2025-05-10',
  status: 3, // 0: Placed, 1: Processing, 2: Shipped, 3: Out for Delivery, 4: Delivered
  items: [
    {
      name: 'Handcrafted Cushion',
      image: 'https://images.unsplash.com/photo-1540638349517-3abd5afc5847?auto=format&fit=crop&w=400&q=80',
      price: '₹899',
      qty: 1,
    },
    {
      name: 'Artisan Throw Blanket',
      image: 'https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?auto=format&fit=crop&w=400&q=80',
      price: '₹1,299',
      qty: 1,
    },
  ],
};

const statusSteps = [
  'Order Placed',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

const OrderTracking = () => {
  const [form, setForm] = useState({ orderId: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    await new Promise(res => setTimeout(res, 1200));
    // Always succeed for flow testing
    setOrder(mockOrder);
    setLoading(false);
  };

  // Add a function to reset the form and order
  const handleTrackAnother = () => {
    setOrder(null);
    setForm({ orderId: '', email: '' });
    setError('');
  };

  return (
    <div className="order-tracking-page">
      <div className="order-tracking-hero">
        <h1>Track Your Order</h1>
        <p>Enter your Order ID and Email to view the latest status and details of your UniqueStore order.</p>
      </div>
      <div className="order-tracking-content">
        {!order ? (
          <form className="order-tracking-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="orderId">Order ID</label>
              <input type="text" id="orderId" name="orderId" value={form.orderId} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input type="email" id="email" name="email" value={form.email} onChange={handleChange} required />
            </div>
            {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
            <button type="submit" className="order-tracking-btn" disabled={loading}>
              {loading ? <span className="spinner" style={{ display: 'inline-block', width: '18px', height: '18px', border: '3px solid #fff', borderTop: '3px solid #7c3aed', borderRadius: '50%', animation: 'spin 1s linear infinite', verticalAlign: 'middle' }}></span> : 'Track Order'}
            </button>
          </form>
        ) : (
          <div className="order-tracking-details">
            <div className="order-status-tracker">
              {statusSteps.map((step, idx) => (
                <div key={step} className={`status-step${idx <= order.status ? ' active' : ''}${idx < order.status ? ' done' : ''}`}>
                  <div className="status-circle">{idx + 1}</div>
                  <div className="status-label">{step}</div>
                  {idx < statusSteps.length - 1 && <div className="status-line" />}
                </div>
              ))}
            </div>
            <div className="order-summary-block">
              <h2>Order Summary</h2>
              <div className="order-info">
                <div><b>Order ID:</b> {order.id}</div>
                <div><b>Date:</b> {order.date}</div>
                <div><b>Shipping Address:</b> 123, Your Street, City, State, 123456</div>
                <div><b>Payment Method:</b> Credit Card (**** 1234)</div>
              </div>
              <div className="order-items">
                {order.items.map((item, idx) => (
                  <div className="order-item" key={idx}>
                    <img src={item.image} alt={item.name} />
                    <div>
                      <div className="item-name">{item.name}</div>
                      <div className="item-meta">{item.qty} x {item.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button className="order-tracking-btn" style={{ marginTop: '10px' }} onClick={handleTrackAnother}>Track Another Order</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking; 