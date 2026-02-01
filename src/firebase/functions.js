import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirestore, collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { firebaseConfig } from './config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app, 'us-central1'); // Add your region here
const db = getFirestore(app);

// Create Razorpay order
export const createRazorpayOrder = async (amount) => {
  try {
    console.log('Creating order with amount:', amount, 'Type:', typeof amount);
    
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error(`Invalid amount: ${amount}`);
    }
    
    const createOrder = httpsCallable(functions, 'createRazorpayOrder');
    console.log('Calling Cloud Function with:', { amount });
    
    const result = await createOrder({ amount });
    console.log('Cloud Function returned:', result);
    
    if (!result.data) {
      throw new Error('No data returned from order creation');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error creating order:', error);
    if (error.code === 'unauthenticated') {
      throw new Error('You must be signed in to create an order');
    }
    throw error;
  }
};

// Test Razorpay Connection
export const testRazorpayConnection = async () => {
  try {
    const testConnection = httpsCallable(functions, 'testRazorpayConnection');
    const result = await testConnection();
    console.log('Razorpay test result:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error testing Razorpay connection:', error);
    throw error;
  }
};

// Verify payment
export const verifyPayment = async (paymentData) => {
  try {
    const verifyPaymentFunction = httpsCallable(functions, 'verifyRazorpayPayment');
    const result = await verifyPaymentFunction(paymentData);

    if (result.data.verified) {
      // Update order status in Firestore
      const orderRef = doc(db, 'orders', paymentData.razorpay_order_id);
      await updateDoc(orderRef, {
        status: 'completed',
        paymentId: paymentData.razorpay_payment_id,
        completedAt: new Date()
      });
    }

    return result.data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

// Test Order Creation
export const createTestOrder = async () => {
  try {
    console.log('Calling test order creation function');
    const testOrder = httpsCallable(functions, 'createTestOrder');
    const result = await testOrder();
    console.log('Test order result:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error creating test order:', error);
    throw error;
  }
}; 

export const checkPromoEligibility = async (userId, promoCode) => {
  const checkPromo = httpsCallable(functions, 'checkPromoEligibility');
  const result = await checkPromo({ userId, promoCode });
  return result.data;
}; 