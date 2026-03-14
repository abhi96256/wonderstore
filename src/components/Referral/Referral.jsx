import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { submitReferral } from '../../firebase/firestore';
import './Referral.css';
import { FaShareAlt, FaUserPlus, FaMoneyBillWave } from 'react-icons/fa';

const Referral = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    refereeName: '',
    refereeEmail: '',
    refereePhone: '',
    relationship: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (!user) throw new Error('You must be logged in to refer someone.');
      
      await submitReferral({
        referrerId: user.uid,
        referrerName: user.displayName || user.email,
        referrerEmail: user.email,
        ...formData
      });
      
      setSuccess(true);
      setFormData({
        refereeName: '',
        refereeEmail: '',
        refereePhone: '',
        relationship: ''
      });
    } catch (err) {
      setError(err.message || 'Failed to submit referral. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="referral-container">
      <div className="referral-header">
        <h1>Refer & Earn</h1>
        <p>Invite your friends to UniqueStore and earn rewards when they make their first purchase!</p>
      </div>

      <div className="referral-stats-cards">
        <div className="stat-card">
          <FaUserPlus className="stat-icon" />
          <div className="stat-info">
            <h3>Invite Friends</h3>
            <p>Share the love with your friends and family</p>
          </div>
        </div>
        <div className="stat-card">
          <FaShareAlt className="stat-icon" />
          <div className="stat-info">
            <h3>They Join</h3>
            <p>Admin will verify the referral information</p>
          </div>
        </div>
        <div className="stat-card">
          <FaMoneyBillWave className="stat-icon" />
          <div className="stat-info">
            <h3>Get Rewarded</h3>
            <p>Earn money in your wallet for successful referrals</p>
          </div>
        </div>
      </div>

      <div className="referral-content">
        <div className="referral-form-section">
          <h2>Submit a Referral</h2>
          {success && (
            <div className="success-banner">
              Referral submitted successfully! Admin will review it shortly.
              <button onClick={() => setSuccess(false)}>Dismiss</button>
            </div>
          )}
          {error && <div className="error-banner">{error}</div>}
          
          <form onSubmit={handleSubmit} className="referral-form">
            <div className="form-group">
              <label>Friend's Name</label>
              <input
                type="text"
                name="refereeName"
                value={formData.refereeName}
                onChange={handleChange}
                placeholder="Enter their full name"
                required
              />
            </div>
            <div className="form-group">
              <label>Friend's Email</label>
              <input
                type="email"
                name="refereeEmail"
                value={formData.refereeEmail}
                onChange={handleChange}
                placeholder="Enter their email address"
                required
              />
            </div>
            <div className="form-group">
              <label>Friend's Phone (Optional)</label>
              <input
                type="tel"
                name="refereePhone"
                value={formData.refereePhone}
                onChange={handleChange}
                placeholder="Enter their mobile number"
              />
            </div>
            <div className="form-group">
              <label>Relationship</label>
              <select
                name="relationship"
                value={formData.relationship}
                onChange={handleChange}
                required
              >
                <option value="">Select relationship</option>
                <option value="Friend">Friend</option>
                <option value="Family">Family</option>
                <option value="Colleague">Colleague</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <button type="submit" className="submit-referral-btn" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Referral'}
            </button>
          </form>
        </div>

        <div className="referral-info-section">
          <h3>How it works?</h3>
          <ul>
            <li>Fill in the details of the person you want to refer.</li>
            <li>Our admin team will review the information.</li>
            <li>Once the person you referred makes a purchase or signs up (as per policy), you will receive a cash prize in your wallet.</li>
            <li>You can use your wallet balance to shop on UniqueStore!</li>
          </ul>
          
          <div className="referral-promo">
            <h4>Current Offer</h4>
            <p>Get ₹100 for every friend who joins and shops!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Referral;
