import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { db } from './config';

// USERS

/**
 * Get a user by their ID
 * @param {string} userId - The user's ID
 * @returns {Promise<Object|null>} - The user object or null if not found
 */
export const getUser = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      return null;
    }
    return { id: userDoc.id, ...userDoc.data() };
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

// CART OPERATIONS

/**
 * Get the active cart for a user
 * @param {string} userId - The user's ID (email)
 * @returns {Promise<Object|null>} - The cart object or null if not found
 */
export const getActiveCart = async (userEmail) => {
  try {
    console.log('Getting active cart for:', userEmail);
    const userCartsRef = collection(db, 'userCarts');

    // Simplified query that doesn't require a composite index
    const q = query(
      userCartsRef,
      where('userId', '==', userEmail),
      where('status', '==', 'active')
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      console.log('No active cart found');
      return null;
    }

    const activeCart = {
      id: querySnapshot.docs[0].id,
      ...querySnapshot.docs[0].data()
    };

    console.log('Found active cart:', activeCart);
    return activeCart;
  } catch (error) {
    console.error('Error getting active cart:', error);
    return null;
  }
};

/**
 * Create a new active cart for a user
 * @param {string} userId - The user's ID (email)
 * @returns {Promise<Object>} - The created cart object
 */
export const createActiveCart = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const newCartRef = doc(collection(db, 'userCarts'));
    const cartData = {
      userId: userId,
      items: [],
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(newCartRef, cartData);

    return {
      id: newCartRef.id,
      ...cartData,
      items: []
    };
  } catch (error) {
    console.error('Error creating active cart:', error);
    throw error;
  }
};

/**
 * Update a user's cart with new items
 * @param {string} cartId - The cart ID
 * @param {Array} items - The updated array of cart items
 * @returns {Promise<void>}
 */
export const updateCart = async (cartId, items) => {
  try {
    if (!cartId) {
      throw new Error('Cart ID is required');
    }

    // Add timestamp to new items
    const itemsWithHistory = items.map(item => ({
      ...item,
      addedAt: item.addedAt || serverTimestamp()
    }));

    const cartRef = doc(db, 'userCarts', cartId);
    await updateDoc(cartRef, {
      items: itemsWithHistory,
      updatedAt: serverTimestamp(),
      lastModified: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    throw error;
  }
};

/**
 * Save a copy of the cart as a historical saved cart
 * @param {string} userId - The user's ID (email)
 * @param {Array} items - The cart items to save
 * @returns {Promise<string>} - The ID of the saved cart
 */
export const saveCartHistory = async (userId, items) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Add timestamp to each item to track when it was added
    const itemsWithHistory = items.map(item => ({
      ...item,
      addedAt: item.addedAt || serverTimestamp()
    }));

    const savedCartRef = collection(db, 'userCarts');
    const savedCartDoc = await addDoc(savedCartRef, {
      userId: userId,
      items: itemsWithHistory,
      status: 'saved',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastModified: serverTimestamp()
    });

    return savedCartDoc.id;
  } catch (error) {
    console.error('Error saving cart history:', error);
    throw error;
  }
};

/**
 * Get all saved carts for a user
 * @param {string} userId - The user's ID (email)
 * @returns {Promise<Array>} - Array of saved cart objects
 */
export const getSavedCarts = async (userEmail) => {
  try {
    console.log('Getting saved carts for:', userEmail);
    const userCartsRef = collection(db, 'userCarts');

    // Get saved carts ordered by last modified date
    const q = query(
      userCartsRef,
      where('userId', '==', userEmail),
      where('status', '==', 'saved'),
      orderBy('lastModified', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const savedCarts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log('Found saved carts:', savedCarts);
    return savedCarts;
  } catch (error) {
    console.error('Error getting saved carts:', error);
    return [];
  }
};

/**
 * Remove a saved cart history
 * @param {string} cartId - The cart ID to remove
 * @returns {Promise<void>}
 */
export const removeCartHistory = async (cartId) => {
  try {
    if (!cartId) {
      throw new Error('Cart ID is required');
    }

    const cartRef = doc(db, 'userCarts', cartId);
    await deleteDoc(cartRef);
  } catch (error) {
    console.error('Error removing cart history:', error);
    throw error;
  }
};

/**
 * Clear a user's active cart
 * @param {string} cartId - The cart ID
 * @returns {Promise<void>}
 */
export const clearCart = async (cartId) => {
  try {
    if (!cartId) {
      throw new Error('Cart ID is required');
    }

    const cartRef = doc(db, 'userCarts', cartId);
    await updateDoc(cartRef, {
      items: [],
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {string} userId - The user's ID
 * @param {Object} userData - The data to update
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// POSTS

/**
 * Create a new post
 * @param {Object} postData - Post data including content, userId, media, etc.
 * @returns {Promise<string>} - The ID of the created post
 */
export const createPost = async (postData) => {
  try {
    const postsCollection = collection(db, 'posts');
    const postRef = await addDoc(postsCollection, {
      ...postData,
      likes: 0,
      comments: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return postRef.id;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

/**
 * Get posts with optional filters
 * @param {Object} options - Query options (limit, userId, etc.)
 * @returns {Promise<Array>} - Array of post objects
 */
export const getPosts = async (options = {}) => {
  try {
    const { userId, limit: queryLimit = 20 } = options;

    let postsQuery;
    if (userId) {
      postsQuery = query(
        collection(db, 'posts'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(queryLimit)
      );
    } else {
      postsQuery = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        limit(queryLimit)
      );
    }

    const querySnapshot = await getDocs(postsQuery);
    const posts = [];

    querySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return posts;
  } catch (error) {
    console.error('Error getting posts:', error);
    throw error;
  }
};

/**
 * Get a post by ID
 * @param {string} postId - The post ID
 * @returns {Promise<Object|null>} - The post object or null if not found
 */
export const getPost = async (postId) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    if (!postDoc.exists()) {
      return null;
    }
    return { id: postDoc.id, ...postDoc.data() };
  } catch (error) {
    console.error('Error getting post:', error);
    throw error;
  }
};

/**
 * Update a post
 * @param {string} postId - The post ID
 * @param {Object} postData - The data to update
 * @returns {Promise<void>}
 */
export const updatePost = async (postId, postData) => {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      ...postData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

/**
 * Delete a post
 * @param {string} postId - The post ID to delete
 * @returns {Promise<void>}
 */
export const deletePost = async (postId) => {
  try {
    await deleteDoc(doc(db, 'posts', postId));
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

// COMMENTS

/**
 * Add a comment to a post
 * @param {string} postId - The post ID
 * @param {Object} commentData - Comment data including content, userId, etc.
 * @returns {Promise<string>} - The ID of the created comment
 */
export const addComment = async (postId, commentData) => {
  try {
    const commentsCollection = collection(db, 'posts', postId, 'comments');
    const commentRef = await addDoc(commentsCollection, {
      ...commentData,
      createdAt: serverTimestamp()
    });

    // Update comment count on the post
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    if (postDoc.exists()) {
      const currentComments = postDoc.data().comments || 0;
      await updateDoc(postRef, {
        comments: currentComments + 1
      });
    }

    return commentRef.id;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

/**
 * Get comments for a post
 * @param {string} postId - The post ID
 * @returns {Promise<Array>} - Array of comment objects
 */
export const getComments = async (postId) => {
  try {
    const commentsQuery = query(
      collection(db, 'posts', postId, 'comments'),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(commentsQuery);
    const comments = [];

    querySnapshot.forEach((doc) => {
      comments.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return comments;
  } catch (error) {
    console.error('Error getting comments:', error);
    throw error;
  }
};

// ADMIN USERS MANAGEMENT

/**
 * Get all users
 * @returns {Promise<Array>} - Array of user objects
 */
export const getAllUsers = async () => {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(usersQuery);
    const users = [];

    querySnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return users;
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
};

/**
 * Create a new user
 * @param {Object} userData - User data including all fields
 * @returns {Promise<string>} - The ID of the created user
 */
export const createUser = async (userData) => {
  try {
    const usersCollection = collection(db, 'users');
    const userRef = await addDoc(usersCollection, {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return userRef.id;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Update a user
 * @param {string} userId - The user ID
 * @param {Object} userData - The data to update
 * @returns {Promise<void>}
 */
export const updateUser = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

/**
 * Delete a user
 * @param {string} userId - The user ID to delete
 * @returns {Promise<void>}
 */
export const deleteUser = async (userId) => {
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// DASHBOARD STATISTICS

/**
 * Get dashboard statistics
 * @returns {Promise<Object>} - Object containing various statistics
 */
export const getDashboardStats = async () => {
  try {
    // Get users
    const usersQuery = query(collection(db, 'users'));
    const usersSnapshot = await getDocs(usersQuery);
    const users = [];
    usersSnapshot.forEach(doc => users.push({ id: doc.id, ...doc.data() }));

    const totalUsers = users.length;
    const maleUsers = users.filter(user => user.gender === 'male').length;
    const femaleUsers = users.filter(user => user.gender === 'female').length;
    const newUsersThisMonth = users.filter(user => {
      if (!user.createdAt) return false;
      const createdDate = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
      const now = new Date();
      return createdDate.getMonth() === now.getMonth() &&
        createdDate.getFullYear() === now.getFullYear();
    }).length;

    // Get products
    const productsQuery = query(collection(db, 'products'));
    const productsSnapshot = await getDocs(productsQuery);
    const products = [];
    productsSnapshot.forEach(doc => products.push({ id: doc.id, ...doc.data() }));

    const totalProducts = products.length;

    // Get categories
    const categoriesSet = new Set(products.map(product => product.Category));
    const totalCategories = categoriesSet.size;

    // Get all orders from both collections using the existing function
    const allOrders = await getAllOrdersForAdmin();

    // Calculate order statistics
    const totalOrders = allOrders.length;

    // Process orders for various statistics
    let pendingOrders = 0;
    let processingOrders = 0;
    let shippedOrders = 0;
    let deliveredOrders = 0;
    let completedOrders = 0;
    let cancelledOrders = 0;
    let totalRevenue = 0;
    let totalRatingSum = 0;
    let totalRatingCount = 0;
    let paymentMethods = {
      card: 0,
      netbanking: 0,
      upi: 0,
      wallet: 0,
      cash: 0,
      other: 0
    };

    // Order trend data (last 6 months)
    const months = 6;
    const now = new Date();
    const orderTrend = Array(months).fill(0);
    const revenueTrend = Array(months).fill(0);

    allOrders.forEach(order => {
      // Status counts
      const status = order.status || 'pending';
      if (status === 'pending') pendingOrders++;
      else if (status === 'processing') processingOrders++;
      else if (status === 'shipped') shippedOrders++;
      else if (status === 'delivered') deliveredOrders++;
      else if (status === 'completed') completedOrders++;
      else if (status === 'cancelled') cancelledOrders++;

      // Skip cancelled orders in revenue calculation
      if (status !== 'cancelled') {
        // Calculate total revenue
        let orderTotal = 0;

        // Handle different amount formats
        if (order.amount) {
          orderTotal = order.amount;
        } else if (order.total_amount) {
          orderTotal = order.total_amount;
        } else if (order.orderTotal) {
          orderTotal = order.orderTotal;
        }

        totalRevenue += orderTotal;

        // Track payment methods
        const method = order.payment_method || (order.razorpay_payment_id ? 'online' : 'other');
        if (method.includes('card')) paymentMethods.card++;
        else if (method.includes('netbanking')) paymentMethods.netbanking++;
        else if (method.includes('upi')) paymentMethods.upi++;
        else if (method.includes('wallet')) paymentMethods.wallet++;
        else if (method.includes('cash')) paymentMethods.cash++;
        else paymentMethods.other++;
      }

      // Handle ratings
      if (order.rating) {
        totalRatingSum += order.rating;
        totalRatingCount++;
      }

      // Calculate order trend (last 6 months)
      const orderDate = order.created_at?.toDate?.() ||
        new Date(order.created_at || order.orderDate || Date.now());

      for (let i = 0; i < months; i++) {
        const trendMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
        if (orderDate.getMonth() === trendMonth.getMonth() &&
          orderDate.getFullYear() === trendMonth.getFullYear()) {
          orderTrend[i]++;

          // Only add to revenue trend if not cancelled
          if (status !== 'cancelled') {
            let orderAmount = 0;
            if (order.amount) orderAmount = order.amount;
            else if (order.total_amount) orderAmount = order.total_amount;
            else if (order.orderTotal) orderAmount = order.orderTotal;

            revenueTrend[i] += orderAmount;
          }
          break;
        }
      }
    });

    // Calculate average order value (AOV)
    const nonCancelledOrders = allOrders.filter(order => order.status !== 'cancelled').length;
    const averageOrderValue = nonCancelledOrders > 0 ? totalRevenue / nonCancelledOrders : 0;

    // Calculate average rating
    const averageRating = totalRatingCount > 0 ? totalRatingSum / totalRatingCount : 0;

    // Create month labels for trends
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendLabels = [];
    for (let i = 0; i < months; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      trendLabels.unshift(`${monthNames[d.getMonth()]} ${d.getFullYear()}`);
    }

    return {
      totalUsers,
      maleUsers,
      femaleUsers,
      newUsersThisMonth,
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      completedOrders,
      cancelledOrders,
      totalProducts,
      totalCategories,
      totalRevenue,
      averageOrderValue,
      averageRating,
      paymentMethods,
      orderTrend: {
        labels: trendLabels,
        data: orderTrend.slice().reverse() // Reverse to match labels
      },
      revenueTrend: {
        labels: trendLabels,
        data: revenueTrend.slice().reverse() // Reverse to match labels
      }
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    throw error;
  }
};

// ORDERS MANAGEMENT

/**
 * Get all orders
 * @returns {Promise<Array>} - Array of order objects
 */
export const getOrders = async () => {
  try {
    const ordersQuery = query(
      collection(db, 'orders'),
      orderBy('created_at', 'desc')
    );

    const querySnapshot = await getDocs(ordersQuery);
    const orders = [];

    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return orders;
  } catch (error) {
    console.error('Error getting orders:', error);
    throw error;
  }
};

/**
 * Update order status
 * @param {string} orderId - The order ID
 * @param {string} newStatus - The new status
 * @param {string} source - The collection source ('orders' or 'successfulPayments')
 * @returns {Promise<void>}
 */
export const updateOrderStatus = async (orderId, newStatus, source = 'orders') => {
  try {
    // Determine which collection to update based on source
    const collectionName = source === 'successfulPayments' ? 'successfulPayments' : 'orders';

    console.log(`Updating order status in ${collectionName} collection for order ${orderId} to ${newStatus}`);

    const orderRef = doc(db, collectionName, orderId);

    // Update fields based on the collection
    if (collectionName === 'successfulPayments') {
      await updateDoc(orderRef, {
        status: newStatus,
        payment_status: newStatus,
        updated_at: serverTimestamp()
      });
    } else {
      await updateDoc(orderRef, {
        status: newStatus,
        updated_at: serverTimestamp()
      });
    }

    console.log(`Successfully updated order ${orderId} status to ${newStatus}`);
  } catch (error) {
    console.error(`Error updating order status in ${source} collection:`, error);
    throw error;
  }
};

/**
 * Delete an order
 * @param {string} orderId - The order ID to delete
 * @param {string} source - The collection source ('orders' or 'successfulPayments')
 * @returns {Promise<void>}
 */
export const deleteOrder = async (orderId, source = 'orders') => {
  try {
    // Determine which collection to delete from based on source
    const collectionName = source === 'successfulPayments' ? 'successfulPayments' : 'orders';
    console.log(`Deleting order from ${collectionName} collection: ${orderId}`);

    await deleteDoc(doc(db, collectionName, orderId));

    // Also try to delete from user's orders subcollection if userId is known
    try {
      // First, get the order to find the userId
      const orderSnapshot = await getDoc(doc(db, collectionName, orderId));
      if (orderSnapshot.exists()) {
        const orderData = orderSnapshot.data();
        const userId = orderData.userId;

        if (userId) {
          // Delete from user's orders subcollection
          await deleteDoc(doc(db, 'users', userId, 'orders', orderId));
          console.log(`Also deleted from user's orders subcollection`);
        }
      }
    } catch (userOrderError) {
      console.log('Could not delete from user orders subcollection:', userOrderError);
      // Continue with the main function even if this fails
    }

    console.log(`Successfully deleted order ${orderId}`);
  } catch (error) {
    console.error(`Error deleting order from ${source} collection:`, error);
    throw error;
  }
};

// FEATURED PRODUCTS

/**
 * Get featured products
 * @returns {Promise<Array>} - Array of featured product objects
 */
export const getFeaturedProducts = async () => {
  try {
    const productsQuery = query(
      collection(db, 'products'),
      where('featured', '==', true),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(productsQuery);
    const products = [];

    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return products;
  } catch (error) {
    console.error('Error getting featured products:', error);
    throw error;
  }
};

/**
 * Update product featured status
 * @param {string} productId - The product ID
 * @param {boolean} featured - The new featured status
 * @returns {Promise<void>}
 */
export const updateProductFeaturedStatus = async (productId, featured) => {
  try {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      featured,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating product featured status:', error);
    throw error;
  }
};

/**
 * Initialize featured field for existing products
 * @returns {Promise<void>}
 */
export const initializeFeaturedField = async () => {
  try {
    const productsRef = collection(db, 'products');
    const querySnapshot = await getDocs(productsRef);

    const updatePromises = querySnapshot.docs.map(async (doc) => {
      const productRef = doc.ref;
      const productData = doc.data();

      // Only update if featured field doesn't exist
      if (productData.featured === undefined) {
        await updateDoc(productRef, {
          featured: false, // Set default value to false
          updatedAt: serverTimestamp()
        });
        console.log(`Updated product ${doc.id} with featured field`);
      }
    });

    await Promise.all(updatePromises);
    console.log('Successfully initialized featured field for all products');
  } catch (error) {
    console.error('Error initializing featured field:', error);
    throw error;
  }
};

// Get a single order by ID
export const getOrder = async (orderId) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      // Try to find in the successful payments collection
      const successPaymentRef = doc(db, 'successfulPayments', orderId);
      const successPaymentSnap = await getDoc(successPaymentRef);

      if (successPaymentSnap.exists()) {
        return {
          id: successPaymentSnap.id,
          ...successPaymentSnap.data()
        };
      }

      throw new Error('Order not found');
    }

    return {
      id: orderSnap.id,
      ...orderSnap.data()
    };
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

// Save successful payment details even if order doesn't exist
export const saveSuccessfulPayment = async (paymentData) => {
  try {
    const {
      orderId,
      paymentId,
      signature,
      amount,
      currency,
      items,
      userId,
      userDetails,
      ...otherData
    } = paymentData;

    // Use the order ID as the document ID
    const paymentRef = doc(db, 'successfulPayments', orderId);

    // Get current timestamp
    const timestamp = serverTimestamp();

    // Save the payment information with comprehensive details
    await setDoc(paymentRef, {
      // Payment identifiers
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,

      // Order details
      amount: amount,
      currency: currency || 'INR',
      items: items || [],
      total_items: items ? items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0,
      total_amount: amount,

      // User information
      userId: userId || null,
      userDetails: userDetails || {},

      // Order status
      status: 'completed',
      payment_status: 'successful',
      fulfillment_status: 'pending',

      // Timestamps
      created_at: timestamp,
      updated_at: timestamp,
      payment_date: timestamp,

      // Additional metadata
      payment_method: 'razorpay',
      payment_mode: 'online',
      ...otherData
    });

    // If we have a userId, also save a reference in the user's orders collection
    if (userId) {
      try {
        const userOrderRef = doc(db, 'users', userId, 'orders', orderId);
        await setDoc(userOrderRef, {
          orderId: orderId,
          created_at: timestamp,
          amount: amount,
          status: 'completed',
          items: items || []
        });
        console.log('Also saved order reference to user\'s orders collection');
      } catch (userOrderError) {
        console.error('Error saving to user orders collection:', userOrderError);
      }
    }

    console.log('Successfully saved payment to backup collection:', orderId);
    return orderId;
  } catch (error) {
    console.error('Error saving successful payment:', error);
    throw error;
  }
};

// Get a user's orders from both orders and successfulPayments collections
export const getUserOrders = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const orders = [];

    // Check the main orders collection
    try {
      const ordersQuery = query(
        collection(db, 'orders'),
        where('userId', '==', userId),
        orderBy('created_at', 'desc')
      );

      const ordersSnapshot = await getDocs(ordersQuery);
      ordersSnapshot.forEach((doc) => {
        orders.push({
          id: doc.id,
          ...doc.data()
        });
      });
    } catch (error) {
      console.error('Error fetching from orders collection:', error);
    }

    // Check the user's orders subcollection
    try {
      const userOrdersQuery = query(
        collection(db, 'users', userId, 'orders'),
        orderBy('created_at', 'desc')
      );

      const userOrdersSnapshot = await getDocs(userOrdersQuery);
      const userOrderIds = new Set(orders.map(order => order.id || order.orderId));

      userOrdersSnapshot.forEach((doc) => {
        // Avoid duplicates
        if (!userOrderIds.has(doc.id)) {
          orders.push({
            id: doc.id,
            ...doc.data()
          });
          userOrderIds.add(doc.id);
        }
      });
    } catch (error) {
      console.error('Error fetching from user orders subcollection:', error);
    }

    // Check the successfulPayments collection
    try {
      const successfulPaymentsQuery = query(
        collection(db, 'successfulPayments'),
        where('userId', '==', userId),
        orderBy('created_at', 'desc')
      );

      const successfulPaymentsSnapshot = await getDocs(successfulPaymentsQuery);
      const existingOrderIds = new Set(orders.map(order => order.id || order.orderId || order.razorpay_order_id));

      successfulPaymentsSnapshot.forEach((doc) => {
        // Avoid duplicates
        if (!existingOrderIds.has(doc.id) && !existingOrderIds.has(doc.data().razorpay_order_id)) {
          orders.push({
            id: doc.id,
            ...doc.data()
          });
        }
      });
    } catch (error) {
      console.error('Error fetching from successfulPayments collection:', error);
    }

    // Sort by creation date
    return orders.sort((a, b) => {
      const dateA = a.created_at?.toDate?.() || new Date(a.created_at || a.orderDate || 0);
      const dateB = b.created_at?.toDate?.() || new Date(b.created_at || b.orderDate || 0);
      return dateB - dateA; // Most recent first
    });
  } catch (error) {
    console.error('Error getting user orders:', error);
    throw error;
  }
};

// Get all orders from both orders and successfulPayments collections for admin
export const getAllOrdersForAdmin = async () => {
  try {
    const allOrders = [];

    // Get orders from the main orders collection
    try {
      const ordersQuery = query(
        collection(db, 'orders'),
        orderBy('created_at', 'desc')
      );

      const ordersSnapshot = await getDocs(ordersQuery);
      ordersSnapshot.forEach((doc) => {
        allOrders.push({
          id: doc.id,
          source: 'orders',
          ...doc.data()
        });
      });
    } catch (error) {
      console.error('Error fetching from orders collection:', error);
    }

    // Get orders from the successfulPayments collection
    try {
      const successfulPaymentsQuery = query(
        collection(db, 'successfulPayments'),
        orderBy('created_at', 'desc')
      );

      const successfulPaymentsSnapshot = await getDocs(successfulPaymentsQuery);
      const existingOrderIds = new Set(allOrders.map(order => order.razorpay_order_id || order.id));

      successfulPaymentsSnapshot.forEach((doc) => {
        const data = doc.data();
        // Avoid duplicates
        if (!existingOrderIds.has(doc.id) && !existingOrderIds.has(data.razorpay_order_id)) {
          allOrders.push({
            id: doc.id,
            source: 'successfulPayments',
            ...data
          });
        }
      });
    } catch (error) {
      console.error('Error fetching from successfulPayments collection:', error);
    }

    // Sort all orders by creation date
    return allOrders.sort((a, b) => {
      const dateA = a.created_at?.toDate?.() || new Date(a.created_at || a.orderDate || 0);
      const dateB = b.created_at?.toDate?.() || new Date(b.created_at || b.orderDate || 0);
      return dateB - dateA; // Most recent first
    });
  } catch (error) {
    console.error('Error getting all orders for admin:', error);
    throw error;
  }
};

// WISHLIST OPERATIONS

/**
 * Add a product to user's wishlist
 * @param {string} userEmail - The user's email
 * @param {Object} product - The product to add
 * @returns {Promise<Object>} - The added wishlist item
 */
export const addToWishlist = async (userEmail, product) => {
  try {
    console.log('Adding to wishlist:', { userEmail, product });
    const wishlistRef = collection(db, 'wishlist');
    const wishlistItem = {
      userEmail,
      productId: product.id,
      productName: product.product_name,
      price: product.mrp,
      image: product.image,
      category: product.category,
      addedAt: serverTimestamp()
    };

    const docRef = await addDoc(wishlistRef, wishlistItem);
    console.log('Added to wishlist successfully:', docRef.id);
    return { id: docRef.id, ...wishlistItem };
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

/**
 * Remove a product from user's wishlist
 * @param {string} userEmail - The user's email
 * @param {string} productId - The product ID to remove
 * @returns {Promise<void>}
 */
export const removeFromWishlist = async (userEmail, productId) => {
  try {
    console.log('Removing from wishlist:', { userEmail, productId });
    const wishlistRef = collection(db, 'wishlist');
    const q = query(
      wishlistRef,
      where('userEmail', '==', userEmail),
      where('productId', '==', productId)
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      await deleteDoc(querySnapshot.docs[0].ref);
      console.log('Removed from wishlist successfully');
    }
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};

/**
 * Get user's wishlist
 * @param {string} userEmail - The user's email
 * @returns {Promise<Array>} - Array of wishlist items
 */
export const getUserWishlist = async (userEmail) => {
  try {
    console.log('[Firestore] Getting wishlist for:', userEmail);
    const wishlistRef = collection(db, 'wishlist');

    // First try a simple query without ordering
    const q = query(
      wishlistRef,
      where('userEmail', '==', userEmail)
    );

    console.log('[Firestore] Executing wishlist query...');
    const querySnapshot = await getDocs(q);
    console.log('[Firestore] Query snapshot size:', querySnapshot.size);

    const wishlistItems = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('[Firestore] Wishlist item data:', { id: doc.id, ...data });
      return {
        id: doc.id,
        ...data
      };
    });

    console.log('[Firestore] Found wishlist items:', wishlistItems);
    return wishlistItems;
  } catch (error) {
    console.error('[Firestore] Error getting wishlist:', error);
    console.error('[Firestore] Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    return [];
  }
};

/**
 * Check if a product is in user's wishlist
 * @param {string} userEmail - The user's email
 * @param {string} productId - The product ID to check
 * @returns {Promise<boolean>} - Whether the product is in wishlist
 */
export const isInWishlist = async (userEmail, productId) => {
  try {
    console.log('Checking wishlist status:', { userEmail, productId });
    const wishlistRef = collection(db, 'wishlist');
    const q = query(
      wishlistRef,
      where('userEmail', '==', userEmail),
      where('productId', '==', productId)
    );

    const querySnapshot = await getDocs(q);
    const isInList = !querySnapshot.empty;
    console.log('Wishlist status:', isInList);
    return isInList;
  } catch (error) {
    console.error('Error checking wishlist status:', error);
    return false;
  }
};

// PRODUCT VIEW COUNTER

/**
 * Increment the view count for a product
 * @param {string|number} productId - The product ID
 * @returns {Promise<void>}
 */
export const incrementProductViews = async (productId) => {
  try {
    const productsRef = collection(db, 'products');

    // Try to find the product by numeric ID first
    let q = query(productsRef, where('id', '==', parseInt(productId)));
    let querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // If not found by numeric ID, try by document ID
      const productRef = doc(db, 'products', productId);
      const productDoc = await getDoc(productRef);

      if (productDoc.exists()) {
        // Update the document directly
        await updateDoc(productRef, {
          views: (productDoc.data().views || 0) + 1,
          lastViewed: serverTimestamp()
        });
      }
    } else {
      // Update the document found by numeric ID
      const docRef = querySnapshot.docs[0].ref;
      const productData = querySnapshot.docs[0].data();

      await updateDoc(docRef, {
        views: (productData.views || 0) + 1,
        lastViewed: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error incrementing product views:', error);
    // Don't throw error to avoid breaking the product page
  }
};

/**
 * Get the view count for a product
 * @param {string|number} productId - The product ID
 * @returns {Promise<number>} - The view count
 */
export const getProductViews = async (productId) => {
  try {
    const productsRef = collection(db, 'products');

    // Try to find the product by numeric ID first
    let q = query(productsRef, where('id', '==', parseInt(productId)));
    let querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // If not found by numeric ID, try by document ID
      const productRef = doc(db, 'products', productId);
      const productDoc = await getDoc(productRef);

      if (productDoc.exists()) {
        return productDoc.data().views || 0;
      }
      return 0;
    } else {
      // Return the view count from the document found by numeric ID
      return querySnapshot.docs[0].data().views || 0;
    }
  } catch (error) {
    console.error('Error getting product views:', error);
    return 0;
  }
};

/**
 * Initialize engagement fields for a regular product
 * @param {string|number} productId - The product ID
 * @returns {Promise<void>}
 */
export const initializeProductFields = async (productId) => {
  try {
    const productsRef = collection(db, 'products');

    // Try to find the product by numeric ID first
    let q = query(productsRef, where('id', '==', parseInt(productId)));
    let querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // If not found by numeric ID, try by document ID
      const productRef = doc(db, 'products', productId);
      const productDoc = await getDoc(productRef);

      if (productDoc.exists()) {
        const productData = productDoc.data();
        if (productData.views === undefined || productData.bought === undefined) {
          await updateDoc(productRef, {
            views: productData.views || 0,
            bought: productData.bought || 0
          });
        }
      }
    } else {
      // Update the document found by numeric ID
      const docRef = querySnapshot.docs[0].ref;
      const productData = querySnapshot.docs[0].data();

      if (productData.views === undefined || productData.bought === undefined) {
        await updateDoc(docRef, {
          views: productData.views || 0,
          bought: productData.bought || 0
        });
      }
    }
  } catch (error) {
    console.error('Error initializing product fields:', error);
  }
};

/**
 * Increment the bought count for a regular product
 * @param {string|number} productId - The product ID
 * @returns {Promise<void>}
 */
export const incrementProductBought = async (productId) => {
  try {
    const productsRef = collection(db, 'products');

    // Try to find the product by numeric ID first
    let q = query(productsRef, where('id', '==', parseInt(productId)));
    let querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // If not found by numeric ID, try by document ID
      const productRef = doc(db, 'products', productId);
      const productDoc = await getDoc(productRef);

      if (productDoc.exists()) {
        const currentBought = productDoc.data().bought || 0;
        await updateDoc(productRef, {
          bought: currentBought + 1,
          lastBought: serverTimestamp()
        });
      }
    } else {
      // Update the document found by numeric ID
      const docRef = querySnapshot.docs[0].ref;
      const productData = querySnapshot.docs[0].data();

      await updateDoc(docRef, {
        bought: (productData.bought || 0) + 1,
        lastBought: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error incrementing product bought count:', error);
  }
};

/**
 * Simulate multiple views for a regular product (for testing)
 * @param {string|number} productId - The product ID
 * @param {number} count - Number of views to add
 * @returns {Promise<void>}
 */
export const simulateMultipleProductViews = async (productId, count) => {
  try {
    const productsRef = collection(db, 'products');

    // Try to find the product by numeric ID first
    let q = query(productsRef, where('id', '==', parseInt(productId)));
    let querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // If not found by numeric ID, try by document ID
      const productRef = doc(db, 'products', productId);
      const productDoc = await getDoc(productRef);

      if (productDoc.exists()) {
        const currentViews = productDoc.data().views || 0;
        await updateDoc(productRef, {
          views: currentViews + count
        });
      }
    } else {
      // Update the document found by numeric ID
      const docRef = querySnapshot.docs[0].ref;
      const productData = querySnapshot.docs[0].data();

      await updateDoc(docRef, {
        views: (productData.views || 0) + count
      });
    }
  } catch (error) {
    console.error('Error simulating product views:', error);
  }
};

/**
 * Simulate multiple bought counts for a regular product (for testing)
 * @param {string|number} productId - The product ID
 * @param {number} count - Number of bought counts to add
 * @returns {Promise<void>}
 */
export const simulateMultipleProductBought = async (productId, count) => {
  try {
    const productsRef = collection(db, 'products');

    // Try to find the product by numeric ID first
    let q = query(productsRef, where('id', '==', parseInt(productId)));
    let querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // If not found by numeric ID, try by document ID
      const productRef = doc(db, 'products', productId);
      const productDoc = await getDoc(productRef);

      if (productDoc.exists()) {
        const currentBought = productDoc.data().bought || 0;
        await updateDoc(productRef, {
          bought: currentBought + count
        });
      }
    } else {
      // Update the document found by numeric ID
      const docRef = querySnapshot.docs[0].ref;
      const productData = querySnapshot.docs[0].data();

      await updateDoc(docRef, {
        bought: (productData.bought || 0) + count
      });
    }
  } catch (error) {
    console.error('Error simulating product bought counts:', error);
  }
};

