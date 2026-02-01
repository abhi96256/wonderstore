import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CookieConsent.css';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    marketing: false,
    preferences: false
  });

  useEffect(() => {
    const savedPreferences = localStorage.getItem('cookiePreferences');
    if (!savedPreferences) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    };
    localStorage.setItem('cookiePreferences', JSON.stringify(allAccepted));
    setShowBanner(false);
  };

  const handleDecline = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false
    };
    localStorage.setItem('cookiePreferences', JSON.stringify(onlyNecessary));
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    setShowBanner(false);
  };

  const handleTogglePreference = (type) => {
    if (type === 'necessary') return; // Can't toggle necessary cookies
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  if (!showBanner) return null;

  return (
    <div className="cookie-consent-banner">
      <div className="cookie-content">
        <div className="cookie-text">
          <h3>We use cookies</h3>
          <p>
            We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
            By clicking "Accept All", you consent to our use of cookies. 
            <Link to="/privacy-policy" className="cookie-policy-link"> Read our Privacy Policy</Link>
          </p>
          
          {showDetails ? (
            <div className="cookie-preferences">
              <div className="cookie-preference-item">
                <label>
                  <input 
                    type="checkbox" 
                    checked={preferences.necessary} 
                    disabled 
                  />
                  Necessary Cookies (Required)
                </label>
                <p>Essential for the website to function properly. Cannot be disabled.</p>
              </div>
              
              <div className="cookie-preference-item">
                <label>
                  <input 
                    type="checkbox" 
                    checked={preferences.analytics} 
                    onChange={() => handleTogglePreference('analytics')}
                  />
                  Analytics Cookies
                </label>
                <p>Help us understand how visitors interact with our website.</p>
              </div>
              
              <div className="cookie-preference-item">
                <label>
                  <input 
                    type="checkbox" 
                    checked={preferences.marketing} 
                    onChange={() => handleTogglePreference('marketing')}
                  />
                  Marketing Cookies
                </label>
                <p>Used to track visitors across websites for marketing purposes.</p>
              </div>
              
              <div className="cookie-preference-item">
                <label>
                  <input 
                    type="checkbox" 
                    checked={preferences.preferences} 
                    onChange={() => handleTogglePreference('preferences')}
                  />
                  Preference Cookies
                </label>
                <p>Remember your settings and preferences for a better experience.</p>
              </div>
            </div>
          ) : (
            <button 
              className="cookie-details-btn"
              onClick={() => setShowDetails(true)}
            >
              Customize Preferences
            </button>
          )}
        </div>
        
        <div className="cookie-buttons">
          {showDetails ? (
            <button className="cookie-btn save" onClick={handleSavePreferences}>
              Save Preferences
            </button>
          ) : (
            <>
              <button className="cookie-btn decline" onClick={handleDecline}>
                Decline
              </button>
              <button className="cookie-btn accept" onClick={handleAccept}>
                Accept All
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CookieConsent; 