import React, { useState, useEffect } from 'react';
import { getAllWithdrawals, updateWithdrawalStatus } from '../../firebase/firestore';
import './WithdrawalManagement.css';
import { FaCheck, FaTimes, FaWallet, FaUser, FaUniversity, FaMobileAlt } from 'react-icons/fa';

const WithdrawalManagement = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const data = await getAllWithdrawals();
      setWithdrawals(data);
    } catch (err) {
      setError('Failed to fetch withdrawals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (withdrawal, status) => {
    if (!window.confirm(`Mark this withdrawal as ${status.toUpperCase()}?`)) return;
    
    try {
      setProcessingId(withdrawal.id);
      await updateWithdrawalStatus(withdrawal.id, status, withdrawal.userId, withdrawal.amount);
      fetchWithdrawals();
      alert(`Status updated to ${status}`);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="admin-loading">Loading requests...</div>;

  return (
    <div className="withdraw-mgmt-container">
      <div className="admin-header">
        <h1>Payout Requests</h1>
        <p>Review and process wallet withdrawal requests</p>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="withdraw-table-wrapper">
        <table className="withdraw-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Details</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map(req => (
              <tr key={req.id}>
                <td>
                  <div className="user-info">
                    <FaUser className="user-icon" />
                    <div>
                      <div className="user-name">{req.userName}</div>
                      <div className="user-email">{req.userEmail}</div>
                    </div>
                  </div>
                </td>
                <td><span className="amount-cell">₹{req.amount}</span></td>
                <td>
                  <span className="method-badge">
                    {req.method === 'UPI' ? <FaMobileAlt /> : <FaUniversity />}
                    {req.method}
                  </span>
                </td>
                <td className="details-cell"><pre>{req.details}</pre></td>
                <td>
                  <span className={`status-badge ${req.status}`}>
                    {req.status.toUpperCase()}
                  </span>
                </td>
                <td>
                  {req.createdAt?.toDate ? req.createdAt.toDate().toLocaleDateString() : 'N/A'}
                </td>
                <td>
                  {req.status === 'pending' ? (
                    <div className="admin-actions">
                      <button 
                        className="approve-btn" 
                        onClick={() => handleUpdateStatus(req, 'completed')}
                        disabled={processingId === req.id}
                      >
                        {processingId === req.id ? '...' : <FaCheck />} Paid
                      </button>
                      <button 
                        className="reject-btn" 
                        onClick={() => handleUpdateStatus(req, 'rejected')}
                        disabled={processingId === req.id}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <span className="action-done">
                      {req.status === 'completed' ? <FaCheck className="done-icon" /> : <FaTimes className="reject-icon" />}
                      {req.status === 'completed' ? 'Paid' : 'Rejected'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {withdrawals.length === 0 && (
              <tr>
                <td colSpan="7" className="no-data">No payout requests found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WithdrawalManagement;
