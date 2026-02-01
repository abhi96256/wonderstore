import { collection, addDoc, updateDoc, doc, getDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase/config';

export const createOrder = async (orderData) => {
  try {
    // Create an order document in Firestore
    const orderRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      status: 'created',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      promoCode: orderData.promoCode || null
    });

    // If a promo code is used, update the user's usedPromoCodes array
    if (orderData.promoCode && orderData.userId) {
      const userRef = doc(db, 'users', orderData.userId);
      await updateDoc(userRef, {
        usedPromoCodes: arrayUnion(orderData.promoCode)
      });
    }
    
    return {
      orderId: orderRef.id,
      ...orderData
    };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, paymentDetails) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status: 'paid',
      paymentDetails,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

export const getOrder = async (orderId) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (orderSnap.exists()) {
      return {
        id: orderSnap.id,
        ...orderSnap.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting order:', error);
    throw error;
  }
}; 