import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaClock, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Login.css';



const sliderImages = [
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1540551079-b1236c0cd8ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',

  'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
];

const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState({ emailOrPhone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Always redirect to homepage after login (for both regular users and admins)
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.emailOrPhone || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email: formData.emailOrPhone, password: formData.password });
    } catch (error) {
      let errorMessage = error.message || 'Login failed. Please try again.';

      // Handle Firebase auth errors with more user-friendly messages
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many unsuccessful login attempts. Please try again later.';
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      // Navigation is handled by the useEffect that watches isAuthenticated
    } catch (error) {
      setError(error.message || 'Google login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Slider auto-play
  useEffect(() => {
    const interval = setInterval(() => {
      setSliderIndex((prev) => (prev + 1) % sliderImages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleDotClick = (idx) => setSliderIndex(idx);
  const handlePrev = () => setSliderIndex((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
  const handleNext = () => setSliderIndex((prev) => (prev + 1) % sliderImages.length);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-bg-dark">
      <div className="login-card-dark" >
        <div className="login-slider">
          <div className="slider-img-wrapper">
            {sliderImages.map((img, idx) => (
              <img
                key={img}
                src={img}
                alt="slider"
                className={`slider-img${idx === sliderIndex ? ' active' : ''}`}
                style={{ opacity: idx === sliderIndex ? 1 : 0, zIndex: idx === sliderIndex ? 2 : 1 }}
              />
            ))}
            <button className="slider-arrow left" onClick={handlePrev}>&#8592;</button>
            <button className="slider-arrow right" onClick={handleNext}>&#8594;</button>
            <div className="slider-dots">
              {sliderImages.map((_, idx) => (
                <span
                  key={idx}
                  className={`slider-dot${idx === sliderIndex ? ' active' : ''}`}
                  onClick={() => handleDotClick(idx)}
                />
              ))}
            </div>
          </div>
          <div className="slider-overlay">
            <div className="slider-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ color: 'white', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase' }}>UniqueStore</h2>
            </div>

            <div className="slider-caption">
              <div>Capturing Moments,<br />Creating Memories</div>
            </div>
          </div>
        </div>
        {/* Right: Login Form */}
        <div className="login-form-dark">
          <div className="login-form-title">Login To Your Account</div>
          <div className="login-form-sub">
            To make account? <Link to="/signup" className="signup-link">Sign-UP</Link>
          </div>
          {error && <div className="login-form-error">{error}</div>}
          <form className="login-form-fields" onSubmit={handleSubmit}>
            <div className="password-input-container">
              <input
                type="text"
                name="emailOrPhone"
                placeholder="Email or Phone Number"
                value={formData.emailOrPhone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className="forgot-password-link">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>
            <div className="login-form-check">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">I agree to the <Link to="/terms">Terms & Conditions</Link></label>
            </div>
            <button
              className="login-form-btn"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <div className="login-form-or">or Login with</div>
          <div className="login-form-socials">
            <button
              className="social-btn google"
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 
