import React, { useEffect } from 'react';
import {
  setNecessaryCookie,
  setAnalyticsCookie,
  setMarketingCookie,
  setPreferenceCookie,
  getCookie,
  isCookieAllowed
} from '../utils/cookieUtils';

const ExampleUsage = () => {
  useEffect(() => {
    // Example 1: Setting necessary cookies (always allowed)
    setNecessaryCookie('session_id', 'abc123');
    setNecessaryCookie('cart_id', 'xyz789');

    // Example 2: Setting analytics cookies (if allowed)
    if (isCookieAllowed('analytics')) {
      setAnalyticsCookie('user_visit_count', '5');
      setAnalyticsCookie('last_page', 'home');
    }

    // Example 3: Setting marketing cookies (if allowed)
    if (isCookieAllowed('marketing')) {
      setMarketingCookie('ad_preferences', 'fashion,shoes');
      setMarketingCookie('campaign_id', 'summer_sale');
    }

    // Example 4: Setting preference cookies (if allowed)
    if (isCookieAllowed('preferences')) {
      setPreferenceCookie('theme', 'dark');
      setPreferenceCookie('language', 'en');
    }
  }, []);

  // Example of reading cookies
  const sessionId = getCookie('session_id');
  const userTheme = getCookie('theme');

  return (
    <div>
      <h2>Cookie Usage Examples</h2>
      
      {/* Example of using cookie values */}
      <div>
        <p>Session ID: {sessionId}</p>
        <p>User Theme: {userTheme}</p>
      </div>

      {/* Example of conditional rendering based on cookie permissions */}
      {isCookieAllowed('analytics') && (
        <div>
          <h3>Analytics Features</h3>
          {/* Add analytics tracking code here */}
        </div>
      )}

      {isCookieAllowed('marketing') && (
        <div>
          <h3>Personalized Ads</h3>
          {/* Add marketing features here */}
        </div>
      )}

      {isCookieAllowed('preferences') && (
        <div>
          <h3>User Preferences</h3>
          {/* Add preference-based features here */}
        </div>
      )}
    </div>
  );
};

export default ExampleUsage; 