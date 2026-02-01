// Get user's cookie preferences
export const getCookiePreferences = () => {
  const preferences = localStorage.getItem('cookiePreferences');
  return preferences ? JSON.parse(preferences) : null;
};

// Check if a specific cookie type is allowed
export const isCookieAllowed = (type) => {
  const preferences = getCookiePreferences();
  if (!preferences) return false;
  return preferences[type] === true;
};

// Set a cookie with proper permissions
export const setCookie = (name, value, options = {}) => {
  const preferences = getCookiePreferences();
  
  // If no preferences set, only allow necessary cookies
  if (!preferences) {
    if (options.type === 'necessary') {
      document.cookie = `${name}=${value}; path=/`;
    }
    return;
  }

  // Check if the cookie type is allowed
  if (preferences[options.type]) {
    let cookieString = `${name}=${value}; path=/`;
    
    // Add expiration if provided
    if (options.expires) {
      cookieString += `; expires=${options.expires}`;
    }
    
    // Add domain if provided
    if (options.domain) {
      cookieString += `; domain=${options.domain}`;
    }
    
    // Add secure flag if needed
    if (options.secure) {
      cookieString += '; secure';
    }
    
    document.cookie = cookieString;
  }
};

// Get a cookie value
export const getCookie = (name) => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return null;
};

// Delete a cookie
export const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
};

// Example usage for different types of cookies:

// Necessary cookies (always allowed)
export const setNecessaryCookie = (name, value) => {
  setCookie(name, value, { type: 'necessary' });
};

// Analytics cookies
export const setAnalyticsCookie = (name, value) => {
  if (isCookieAllowed('analytics')) {
    setCookie(name, value, { type: 'analytics' });
  }
};

// Marketing cookies
export const setMarketingCookie = (name, value) => {
  if (isCookieAllowed('marketing')) {
    setCookie(name, value, { type: 'marketing' });
  }
};

// Preference cookies
export const setPreferenceCookie = (name, value) => {
  if (isCookieAllowed('preferences')) {
    setCookie(name, value, { type: 'preferences' });
  }
}; 