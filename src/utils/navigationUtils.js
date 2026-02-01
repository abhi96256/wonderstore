import { useNavigate, useLocation } from 'react-router-dom';

// Custom hook for intelligent back navigation
export const useBackNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const goBack = (defaultPath = '/all-products') => {
    // Check if we have a referrer in the URL or if we came from a specific page
    const referrer = new URLSearchParams(location.search).get('from');

    if (referrer) {
      // Navigate back to the specific page with preserved search params
      navigate(referrer + location.search);
    } else {
      // Try to determine the best path to go back to
      const currentPath = location.pathname;

      if (currentPath.includes('/product/')) {
        // If we're on a product detail page, go back to all-products with search params
        navigate('/all-products' + location.search);
      } else {
        // Fallback to default path
        navigate(defaultPath + location.search);
      }
    }
  };

  return { goBack };
};

// Function to add referrer information to URLs
export const addReferrerToUrl = (url, currentPath) => {
  const urlObj = new URL(url, window.location.origin);
  urlObj.searchParams.set('from', currentPath);
  return urlObj.pathname + urlObj.search;
}; 