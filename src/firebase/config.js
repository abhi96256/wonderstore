// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAl2B53UkGpCYiP5J-IYWVhQQoIM94aAtI",
  authDomain: "uniquestore-37fb9.firebaseapp.com",
  projectId: "uniquestore-37fb9",
  storageBucket: "uniquestore-37fb9.firebasestorage.app",
  messagingSenderId: "25194966687",
  appId: "1:25194966687:web:d1ed1b6b944d9b32177caa",
  measurementId: "G-88NNM9CWQ1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);
const storage = getStorage(app);

export { app, db, auth, functions, storage, firebaseConfig }; 