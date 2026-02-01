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
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};

        setCurrentUser({ ...user, ...userData, isAdmin: userData.isAdmin || false });
        setIsAuthenticated(true);
      } else {
        // User is signed out
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return unsubscribe;
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