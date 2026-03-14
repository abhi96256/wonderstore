import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { requestWithdrawal } from '../../firebase/firestore';
import './RedeemWallet.css';
import { FaUniversity, FaMobileAlt, FaArrowLeft, FaWallet } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const RedeemWallet = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('UPI'); // UPI or Bank
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const withdrawAmount = parseFloat(amount);

    if (isNaN(withdrawAmount) || withdrawAmount < 100) {
      setError('Minimum withdrawal amount is ₹100');
      setLoading(false);
      return;
    }

    if (withdrawAmount > (user?.walletBalance || 0)) {
      setError('Insufficient wallet balance');
      setLoading(false);
      return;
    }

    try {
      await requestWithdrawal({
        userId: user.uid,
        userName: user.displayName || user.email,
        userEmail: user.email,
        amount: withdrawAmount,
        method: method,
        details: details
      });
      setSuccess(true);
      setAmount('');
      setDetails('');
    } catch (err) {
      setError(err.message || 'Failed to request withdrawal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="redeem-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Back
      </button>

      <div className="redeem-card">
        <div className="redeem-header">
          <FaWallet className="wallet-header-icon" />
          <h1>Transfer to Bank</h1>
          <div className="current-balance">Available: <span>₹{user?.walletBalance || 0}</span></div>
        </div>

        {success ? (
          <div className="success-screen">
            <div className="success-icon">✓</div>
            <h2>Request Submitted!</h2>
            <p>Your withdrawal request is being processed. It usually takes 24-48 hours to reflect in your account.</p>
            <button className="done-btn" onClick={() => navigate('/')}>Back to Home</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="redeem-form">
            {error && <div className="error-msg">{error}</div>}
            
            <div className="input-group">
              <label>Amount (Min ₹100)</label>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                placeholder="₹ 0.00"
                required
              />
            </div>

            <div className="method-selector">
              <label>Transfer Method</label>
              <div className="method-options">
                <button 
                  type="button" 
                  className={method === 'UPI' ? 'active' : ''} 
                  onClick={() => setMethod('UPI')}
                >
                  <FaMobileAlt /> UPI
                </button>
                <button 
                  type="button" 
                  className={method === 'Bank' ? 'active' : ''} 
                  onClick={() => setMethod('Bank')}
                >
                  <FaUniversity /> Bank Transfer
                </button>
              </div>
            </div>

            <div className="input-group">
              <label>{method === 'UPI' ? 'UPI ID (e.g. name@okhdfc)' : 'Bank Details (A/C No, IFSC, Name)'}</label>
              <textarea 
                value={details} 
                onChange={(e) => setDetails(e.target.value)} 
                placeholder={method === 'UPI' ? "Enter UPI ID" : "Account Number: \nIFSC Code: \nAccount Holder Name:"}
                required
                rows={method === 'Bank' ? 4 : 1}
              />
            </div>

            <button type="submit" className="submit-redeem-btn" disabled={loading}>
              {loading ? 'Processing...' : 'Request Withdrawal'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RedeemWallet;
