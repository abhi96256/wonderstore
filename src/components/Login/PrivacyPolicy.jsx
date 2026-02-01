import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

const PrivacyPolicy = () => {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="terms-page">
      <div className="terms-container">
        <div className="terms-header">
          <h1>Privacy Policy</h1>
          <Link to="/" className="back-link">← Back to Home</Link>
        </div>
        <div className="terms-tabs">
          <button
            className={activeTab === 'general' ? 'active' : ''}
            onClick={() => setActiveTab('general')}
          >
            General Information
          </button>
          <button
            className={activeTab === 'data' ? 'active' : ''}
            onClick={() => setActiveTab('data')}
          >
            Data Collection
          </button>
          <button
            className={activeTab === 'usage' ? 'active' : ''}
            onClick={() => setActiveTab('usage')}
          >
            Data Usage
          </button>
        </div>
        <div className="terms-content">
          {activeTab === 'general' ? (
            <div className="policy-content">
              <h2>General Information</h2>
              <p>At UniqueStore, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase.</p>

              <h3>Information We Collect</h3>
              <p>We collect information that you provide directly to us, including:</p>
              <ul>
                <li>Name and contact information</li>
                <li>Billing and shipping address</li>
                <li>Payment information</li>
                <li>Account credentials</li>
                <li>Order history and preferences</li>
              </ul>

              <h3>How We Use Your Information</h3>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Process your orders and payments</li>
                <li>Communicate with you about your orders</li>
                <li>Send you marketing communications (with your consent)</li>
                <li>Improve our website and services</li>
                <li>Prevent fraud and enhance security</li>
              </ul>
            </div>
          ) : activeTab === 'data' ? (
            <div className="policy-content">
              <h2>Data Collection and Storage</h2>

              <h3>Personal Information</h3>
              <p>We collect personal information that you voluntarily provide when you:</p>
              <ul>
                <li>Create an account</li>
                <li>Place an order</li>
                <li>Subscribe to our newsletter</li>
                <li>Contact our customer service</li>
                <li>Participate in surveys or promotions</li>
              </ul>

              <h3>Automatically Collected Information</h3>
              <p>When you visit our website, we automatically collect:</p>
              <ul>
                <li>Device information (IP address, browser type)</li>
                <li>Usage data (pages visited, time spent)</li>
                <li>Location information (if permitted)</li>
                <li>Cookies and similar technologies</li>
              </ul>

              <h3>Data Security</h3>
              <p>We implement appropriate security measures to protect your personal information, including:</p>
              <ul>
                <li>Encryption of sensitive data</li>
                <li>Secure servers and networks</li>
                <li>Regular security assessments</li>
                <li>Limited access to personal information</li>
              </ul>
            </div>
          ) : (
            <div className="policy-content">
              <h2>Data Usage and Your Rights</h2>

              <h3>How We Use Your Data</h3>
              <p>Your data is used to:</p>
              <ul>
                <li>Fulfill your orders and provide customer support</li>
                <li>Send order updates and delivery notifications</li>
                <li>Process payments and prevent fraud</li>
                <li>Improve our products and services</li>
                <li>Send marketing communications (with consent)</li>
              </ul>

              <h3>Your Rights</h3>
              <p>You have the right to:</p>
              <ul>
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Data portability</li>
              </ul>

              <h3>Third-Party Services</h3>
              <p>We may share your information with:</p>
              <ul>
                <li>Payment processors</li>
                <li>Shipping partners</li>
                <li>Analytics providers</li>
                <li>Marketing services (with consent)</li>
              </ul>

              <h3>Contact Us</h3>
              <p>If you have any questions about this Privacy Policy or our data practices, please contact us at:</p>
              <ul>
                <li>Email: privacy@uniquestore.com</li>
                <li>Phone: [Your Contact Number]</li>
                <li>Address: [Your Business Address]</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 