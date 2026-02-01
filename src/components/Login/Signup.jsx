import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaClock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './Login.css';
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


const sliderImages = [
  'https://images.unsplash.com/photo-1526827826797-7b05204a22ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',  // Modern geometric cushions
  'https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', // Cozy textured cushions
  'https://images.unsplash.com/photo-1567225557594-88d73e55f2cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', // Designer pattern cushions
];

const Signup = () => {
  const navigate = useNavigate();
  const { signup, loginWithGoogle, loading } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    dateOfBirth: '',
    contactNumber: '',
    terms: false
  });
  const [sliderIndex, setSliderIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 13) {
        newErrors.dateOfBirth = 'You must be at least 13 years old to register';
      }
    }

    if (!formData.contactNumber) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^[0-9]{10}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.terms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        contactNumber: formData.contactNumber
      });

      // Redirect to login page
      navigate('/login');
    } catch (error) {
      let errorMessage = error.message;

      // Handle Firebase auth errors with more user-friendly messages
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please use a different email or try logging in.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Please choose a stronger password. It should be at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }

      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Slider auto-play
  React.useEffect(() => {
    const interval = setInterval(() => {
      setSliderIndex((prev) => (prev + 1) % sliderImages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleDotClick = (idx) => setSliderIndex(idx);
  const handlePrev = () => setSliderIndex((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
  const handleNext = () => setSliderIndex((prev) => (prev + 1) % sliderImages.length);

  // Show loading state from auth context
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="login-bg-dark">
      <div className="login-card-dark">
        {/* Left: Image Slider */}
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

        {/* Right: Signup Form */}
        <div className="login-form-dark">
          <div className="login-form-title">Create an account</div>
          <div className="login-form-sub">
            Already have an account? <Link to="/login">Log in</Link>
          </div>
          {errors.submit && <div className="error-message">{errors.submit}</div>}
          <form className="login-form-fields" onSubmit={handleSubmit}>
            <div className="signup-names-row">
              <input
                type="text"
                name="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
                className={errors.firstName ? 'error' : ''}
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
                className={errors.lastName ? 'error' : ''}
              />
            </div>
            {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            {errors.lastName && <span className="error-message">{errors.lastName}</span>}

            <div className="form-group">
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={errors.gender ? 'error' : ''}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <span className="error-message">{errors.gender}</span>}
            </div>

            <div className="form-group">
              <ReactDatePicker
                selected={formData.dateOfBirth ? new Date(formData.dateOfBirth) : null}
                onChange={date => handleChange({ target: { name: "dateOfBirth", value: date } })}
                placeholderText="Date of Birth"
                dateFormat="dd-MM-yyyy"
                className={errors.dateOfBirth ? 'error' : ''}
                name="dateOfBirth"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                minDate={new Date(1950, 0, 1)}
                maxDate={new Date(new Date().getFullYear() - 13, 11, 31)}
                yearDropdownItemNumber={50}
              />
              {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
            </div>

            <div className="form-group">
              <input
                type="tel"
                name="contactNumber"
                placeholder="Contact Number"
                value={formData.contactNumber}
                onChange={handleChange}
                className={errors.contactNumber ? 'error' : ''}
                pattern="[0-9]{10}"
                title="Please enter a valid 10-digit phone number"
              />
              {errors.contactNumber && <span className="error-message">{errors.contactNumber}</span>}
            </div>

            <div className="password-input-container">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                style={{ color: '#a18aff' }}
              />
            </div>
            {errors.email && <span className="error-message">{errors.email}</span>}

            <div className="password-input-container">
              <input
                type={showPassword.password ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
                style={{ color: '#a18aff' }}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => togglePasswordVisibility('password')}
                aria-label={showPassword.password ? "Hide password" : "Show password"}
              >
                {showPassword.password ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}

            <div className="password-input-container">
              <input
                type={showPassword.confirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'error' : ''}
                style={{ color: '#a18aff' }}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => togglePasswordVisibility('confirmPassword')}
                aria-label={showPassword.confirmPassword ? "Hide password" : "Show password"}
              >
                {showPassword.confirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}

            <div className="login-form-check">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
                className={errors.terms ? 'error' : ''}
              />
              <label htmlFor="terms">I agree to the <Link to="/terms">Terms & Conditions</Link></label>
            </div>
            {errors.terms && <span className="error-message">{errors.terms}</span>}

            <button
              className="login-form-btn"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create account'}
            </button>
          </form>
          <div className="login-form-or">or register with</div>
          <div className="login-form-socials">
            <button
              className="social-btn google"
              type="button"
              onClick={handleGoogleSignup}
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

export default Signup; 