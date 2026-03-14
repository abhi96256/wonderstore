import React, { useState, useEffect } from 'react';
import { getAllReferrals, updateReferralStatus, addUserWalletBalance } from '../../firebase/firestore';
import './ReferralManagement.css';
import { FaCheck, FaTimes, FaWallet, FaUser } from 'react-icons/fa';

const ReferralManagement = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rewardingId, setRewardingId] = useState(null);
  const [rewardAmount, setRewardAmount] = useState(100);

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const data = await getAllReferrals();
      setReferrals(data);
    } catch (err) {
      setError('Failed to fetch referrals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (referral) => {
    try {
      setRewardingId(referral.id);
      
      // 1. Update user's wallet balance
      await addUserWalletBalance(referral.referrerId, rewardAmount);
      
      // 2. Update referral status
      await updateReferralStatus(referral.id, 'rewarded', rewardAmount);
      
      // 3. Refresh list
      fetchReferrals();
      alert(`Successfully rewarded ₹${rewardAmount} to ${referral.referrerName}`);
    } catch (err) {
      alert('Failed to reward: ' + err.message);
    } finally {
      setRewardingId(null);
    }
  };

  const handleReject = async (referralId) => {
    if (!window.confirm('Are you sure you want to reject this referral?')) return;
    
    try {
      await updateReferralStatus(referralId, 'rejected');
      fetchReferrals();
    } catch (err) {
      alert('Failed to reject: ' + err.message);
    }
  };

  if (loading) return <div className="admin-loading">Loading referrals...</div>;

  return (
    <div className="referral-mgmt-container">
      <div className="admin-header">
        <h1>Referral Management</h1>
        <div className="reward-config">
          <label>Default Reward Amount: ₹</label>
          <input 
            type="number" 
            value={rewardAmount} 
            onChange={(e) => setRewardAmount(parseInt(e.target.value))}
          />
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="referral-table-wrapper">
        <table className="referral-table">
          <thead>
            <tr>
              <th>Referrer</th>
              <th>Referee Info</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {referrals.map(ref => (
              <tr key={ref.id}>
                <td>
                  <div className="user-info">
                    <FaUser className="user-icon" />
                    <div>
                      <div className="user-name">{ref.referrerName}</div>
                      <div className="user-email">{ref.referrerEmail}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="referee-info">
                    <strong>{ref.refereeName}</strong> ({ref.relationship})
                    <div>{ref.refereeEmail}</div>
                    {ref.refereePhone && <div>{ref.refereePhone}</div>}
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${ref.status}`}>
                    {ref.status.toUpperCase()}
                  </span>
                  {ref.status === 'rewarded' && (
                    <div className="reward-info">₹{ref.amount} rewarded</div>
                  )}
                </td>
                <td>
                  {ref.createdAt?.toDate ? ref.createdAt.toDate().toLocaleDateString() : 'N/A'}
                </td>
                <td>
                  {ref.status === 'pending' ? (
                    <div className="admin-actions">
                      <button 
                        className="approve-btn" 
                        onClick={() => handleApprove(ref)}
                        disabled={rewardingId === ref.id}
                      >
                        {rewardingId === ref.id ? '...' : <FaWallet title="Reward" />} Reward
                      </button>
                      <button 
                        className="reject-btn" 
                        onClick={() => handleReject(ref.id)}
                        disabled={rewardingId === ref.id}
                      >
                        <FaTimes title="Reject" />
                      </button>
                    </div>
                  ) : (
                    <span className="action-done"><FaCheck /> Processed</span>
                  )}
                </td>
              </tr>
            ))}
            {referrals.length === 0 && (
              <tr>
                <td colSpan="5" className="no-data">No referrals found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReferralManagement;
