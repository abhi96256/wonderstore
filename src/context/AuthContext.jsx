import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribeSnapshot = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setIsAuthenticated(true);
        
        // Listen to Firestore user document in real-time
        unsubscribeSnapshot = onSnapshot(doc(db, 'users', authUser.uid), (userDoc) => {
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Create a clean user object combining Auth and Firestore data
            const enrichedUser = {
              uid: authUser.uid,
              email: authUser.email,
              displayName: authUser.displayName,
              ...userData,
              isAdmin: userData.isAdmin || false,
              walletBalance: userData.walletBalance || 0
            };
            setCurrentUser(enrichedUser);
          } else {
            setCurrentUser({ 
              uid: authUser.uid, 
              email: authUser.email, 
              isAdmin: false,
              walletBalance: 0 
            });
          }
          setLoading(false);
        }, (err) => {
          console.error("Error listening to user document:", err);
          setCurrentUser({ uid: authUser.uid, email: authUser.email, isAdmin: false });
          setLoading(false);
        });

      } else {
        // User is signed out
        if (unsubscribeSnapshot) unsubscribeSnapshot();
        setCurrentUser(null);
        setIsAuthenticated(false);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const signup = async (userData) => {
    setError(null);

    try {
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      // Set user display name
      await updateProfile(userCredential.user, {
        displayName: `${userData.firstName} ${userData.lastName}`
      });

      // Send email verification
      await sendEmailVerification(userCredential.user);

      // Store additional user data in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        firstName: userData.firstName,
        lastName: userData.lastName,
        gender: userData.gender,
        dateOfBirth: userData.dateOfBirth,
        contactNumber: userData.contactNumber,
        createdAt: new Date(),
        isAdmin: false
      });

      return userCredential.user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const login = async (credentials) => {
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      return userCredential.user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    setError(null);

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);

      // Check if this is a new user
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

      if (!userDoc.exists()) {
        // If new user, create a document in the users collection
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          firstName: userCredential.user.displayName?.split(' ')[0] || '',
          lastName: userCredential.user.displayName?.split(' ').slice(1).join(' ') || '',
          email: userCredential.user.email,
          createdAt: new Date(),
          isAdmin: false
        });
      }

      return userCredential.user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    setError(null);

    try {
      await signOut(auth);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    setError(null);

    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user: currentUser,
      loading,
      error,
      login,
      logout,
      signup,
      loginWithGoogle,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 