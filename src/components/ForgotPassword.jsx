import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess('Password reset email sent! Please check your email and follow the instructions to reset your password.');
    } catch (err) {
      setError(err.message || 'Failed to send password reset email. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="forgot-password-page" style={{minHeight:'70vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f8f9fa'}}>
      <div className="forgot-password-card" style={{background:'#fff',borderRadius:16,boxShadow:'0 8px 32px rgba(0,0,0,0.08)',padding:32,maxWidth:400,width:'100%'}}>
        <h2 style={{textAlign:'center',marginBottom:18}}>Forgot Password</h2>
        
        {!success ? (
          <form onSubmit={handleResetPassword}>
            <div style={{marginBottom:18}}>
              <label style={{fontWeight:500,marginBottom:6,display:'block'}}>Enter your registered email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email"
                style={{width:'100%',padding:12,borderRadius:8,border:'1px solid #ddd'}}
                required
              />
            </div>
            
            {error && <div style={{color:'#ff4444',marginBottom:10}}>{error}</div>}
            
            <button 
              type="submit" 
              style={{
                width:'100%',
                padding:12,
                borderRadius:8,
                background:'linear-gradient(90deg,#6a11cb,#2575fc)',
                color:'#fff',
                fontWeight:600,
                border:'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }} 
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            
            <div style={{textAlign:'center',marginTop:16}}>
              <Link to="/login" style={{color:'#2575fc',textDecoration:'underline'}}>
                Back to Login
              </Link>
            </div>
          </form>
        ) : (
          <div style={{textAlign:'center',color:'#4caf50',fontWeight:600}}>
            {success}
            <div style={{marginTop:18}}>
              <Link to="/login" style={{color:'#2575fc',textDecoration:'underline'}}>
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword; 