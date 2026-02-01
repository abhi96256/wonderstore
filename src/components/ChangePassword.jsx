import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import './ChangePassword.css';

const ChangePassword = () => {
  // Demo: Assume old password is 'test@123'. In real app, get from context or backend.
  const actualOldPassword = 'test@123';
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (oldPassword !== actualOldPassword) {
      setError('Old password is incorrect');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match');
      return;
    }
    setSuccess('Password changed successfully!');
    setOldPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setTimeout(() => {
      setSuccess('');
      navigate('/settings');
    }, 2000);
  };

  return (
    <div className="change-password-page">
      <div className="change-password-card">
        <h2>Change Password</h2>
        <form className="password-change-form" onSubmit={handlePasswordChange}>
          <div className="form-group">
            <label><FaLock /> Old Password</label>
            <div className="input-with-icon">
              <input
                type={showOld ? 'text' : 'password'}
                placeholder="Enter old password"
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                required
              />
              <span className="eye-icon" onClick={() => setShowOld(v => !v)}>
                {showOld ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>
          <div className="form-group">
            <label><FaLock /> New Password</label>
            <div className="input-with-icon">
              <input
                type={showNew ? 'text' : 'password'}
                placeholder="Enter new password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
              <span className="eye-icon" onClick={() => setShowNew(v => !v)}>
                {showNew ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>
          <div className="form-group">
            <label><FaLock /> Confirm New Password</label>
            <div className="input-with-icon">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirmNewPassword}
                onChange={e => setConfirmNewPassword(e.target.value)}
                required
              />
              <span className="eye-icon" onClick={() => setShowConfirm(v => !v)}>
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>
          {error && <div className="error-message"><FaTimesCircle /> {error}</div>}
          {success && <div className="success-message"><FaCheckCircle /> {success}</div>}
          <div className="password-form-actions">
            <button type="submit" className="settings-btn save">Save</button>
            <button type="button" className="settings-btn cancel" onClick={() => navigate('/settings')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword; 