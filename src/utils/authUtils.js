import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export const useAuthRedirect = () => {
  const { isAuthenticated } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const requireAuth = (action) => {
    // BYPASS LOGIN: Always return true
    return true;
    /*
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return false;
    }
    return true;
    */
  };

  return { requireAuth, showLoginPrompt, setShowLoginPrompt };
}; 