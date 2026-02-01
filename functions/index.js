/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Razorpay = require("razorpay");
const crypto = require("crypto");

admin.initializeApp();

// Get Razorpay credentials from Firebase config
const razorpayConfig = functions.config().razorpay || {};
const razorpayKeyId = process.env.RAZORPAY_KEY_ID || razorpayConfig.key_id;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || razorpayConfig.key_secret;

// Create Razorpay instance with fallback to hardcoded test keys if config is missing
const razorpay = new Razorpay({
  key_id: razorpayKeyId || "rzp_test_05BxV9TnB6Qc7g",  // Fallback to test key
  key_secret: razorpayKeySecret || "J6wyqGXN02nsAAZm8w9Ivzjm",  // Fallback to test key
});

// Test Razorpay connection
exports.testRazorpayConnection = functions.https.onCall(async (data, context) => {
  console.log('=== Testing Razorpay connection ===');
  try {
    // Log key information without exposing full values
    console.log('Razorpay keys info:', {
      key_id: razorpay.key_id.substring(0, 5) + '...',
      key_secret: razorpay.key_secret ? '****' + razorpay.key_secret.substring(razorpay.key_secret.length - 4) : 'undefined',
      key_id_from_config: razorpayConfig?.key_id ? 'exists' : 'missing',
      key_secret_from_config: razorpayConfig?.key_secret ? 'exists' : 'missing',
      key_id_from_env: process.env.RAZORPAY_KEY_ID ? 'exists' : 'missing',
      key_secret_from_env: process.env.RAZORPAY_KEY_SECRET ? 'exists' : 'missing'
    });
    
    const result = await razorpay.payments.all({count: 1});
    console.log('Razorpay connection successful:', result);
    return {
      success: true,
      message: 'Connection successful',
      data: result
    };
  } catch (error) {
    console.error('Razorpay connection test failed:', error);
    return {
      success: false,
      message: 'Connection failed',
      error: {
        message: error.message,
        code: error.error?.code,
        description: error.error?.description
      }
    };
  }
});

// Helper function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to retry with exponential backoff
async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  let retries = 0;
  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (retries >= maxRetries || error.error?.code !== 'SERVER_ERROR') {
        throw error;
      }
      const delay = initialDelay * Math.pow(2, retries);
      console.log(`Retrying after ${delay}ms (attempt ${retries + 1}/${maxRetries})`);
      await wait(delay);
      retries++;
    }
  }
}

// Create Razorpay order
exports.createRazorpayOrder = functions.https.onCall(async (data, context) => {
  console.log('=== Starting createRazorpayOrder function ===');
  console.log('Received data:', data);
  
  // Declare options outside try block so it's available in catch
  let options;
  
  try {
    // Check authentication
    if (!context.auth) {
      console.log('No authentication context found');
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated to create an order"
      );
    }
    console.log('Authentication context:', {
      uid: context.auth.uid,
      email: context.auth.token.email
    });

    // Validate amount
    const { amount } = data;
    console.log('Received amount:', amount, 'Type:', typeof amount);
    
    if (!amount || isNaN(amount) || amount <= 0) {
      console.log('Invalid amount:', amount);
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Amount must be a positive number"
      );
    }

    // Check Razorpay keys - log first few characters only to protect secrets
    console.log('Using Razorpay keys:', {
      key_id: razorpay.key_id.substring(0, 5) + '...',
      key_secret: razorpay.key_secret ? '****' + razorpay.key_secret.substring(razorpay.key_secret.length - 4) : 'undefined',
    });
    
    if (!razorpay.key_id || !razorpay.key_secret) {
      console.error('Razorpay configuration missing');
      throw new functions.https.HttpsError(
        "internal",
        "Razorpay configuration is missing"
      );
    }

    // Prepare order options - ensure amount is an integer in paise
    const amountInPaise = Math.round(parseFloat(amount) * 100);
    
    // Simplified options with only essential fields
    options = {
      amount: amountInPaise,
      currency: "INR"
      // Optional fields removed
    };

    console.log('Creating order with options:', {
      ...options,
      amount_in_rupees: amount,
      amount_in_paise: options.amount
    });

    // Create order with retry mechanism
    const order = await retryWithBackoff(async () => {
      const result = await razorpay.orders.create(options);
      console.log('Order created successfully:', {
        id: result.id,
        amount: result.amount,
        currency: result.currency,
        receipt: result.receipt
      });
      return result;
    });

    console.log('=== Ending createRazorpayOrder function ===');
    return order;
  } catch (error) {
    console.error('Error creating order:', {
      error: error,
      error_message: error.message,
      error_description: error.error?.description,
      error_code: error.error?.code,
      error_reason: error.error?.reason,
      error_source: error.error?.source,
      error_step: error.error?.step,
      error_metadata: error.error?.metadata,
      status_code: error.statusCode,
      options_used: options
    });
    throw new functions.https.HttpsError('internal', 'Error creating order', error);
  }
});

// Verify Razorpay payment
exports.verifyRazorpayPayment = functions.https.onCall(async (data, context) => {
  console.log('=== Starting verifyRazorpayPayment function ===');
  console.log('Received verification data:', data);
  
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;
    
    // Log user context if available
    if (context.auth) {
      console.log('User context:', { 
        uid: context.auth.uid,
        email: context.auth.token.email
      });
    } else {
      console.log('No user context available');
    }
    
    // Validate required parameters
    console.log('Validating payment parameters...');
    if (!razorpay_order_id) {
      console.error('Missing order ID');
    }
    if (!razorpay_payment_id) {
      console.error('Missing payment ID');
    }
    if (!razorpay_signature) {
      console.error('Missing signature');
    }
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error('Missing required payment parameters');
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required payment verification parameters"
      );
    }

    // Verify signature using Razorpay key secret
    console.log('Generating signature for verification...');
    console.log('Using key_secret:', razorpay.key_secret ? '[SECRET PRESENT]' : '[SECRET MISSING]');
    
    const textToHash = razorpay_order_id + "|" + razorpay_payment_id;
    console.log('Text to hash:', textToHash);
    
    const generated_signature = crypto
      .createHmac("sha256", razorpay.key_secret)
      .update(textToHash)
      .digest("hex");
    
    console.log('Generated signature:', generated_signature);
    console.log('Received signature:', razorpay_signature);
    
    const isVerified = generated_signature === razorpay_signature;
    console.log('Signature verification result:', isVerified ? 'VERIFIED' : 'FAILED');
    
    // Store payment information in Firestore (regardless of verification)
    try {
      console.log('Storing payment information in Firestore...');
      const orderRef = admin.firestore().collection('orders').doc(razorpay_order_id);
      await orderRef.set({
        razorpay_order_id,
        razorpay_payment_id,
        verified: isVerified,
        verification_timestamp: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      console.log('Payment information stored successfully');
    } catch (dbError) {
      console.error('Error storing payment information:', dbError);
      // Continue with verification result even if storage fails
    }

    console.log('=== Completed verifyRazorpayPayment function ===');
    return {
      success: true,
      verified: isVerified,
    };
  } catch (error) {
    console.error("Error verifying payment:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      details: error.details
    });
    throw new functions.https.HttpsError(
      "internal",
      error.message || "Error verifying payment"
    );
  }
});

// Create test order with fixed amount
exports.createTestOrder = functions.https.onCall(async (data, context) => {
  console.log('=== Starting createTestOrder function ===');
  
  try {
    // Using a fixed small amount for testing
    const testAmount = 10000; // 100 INR in paise
    
    console.log('Test Razorpay keys:', {
      key_id: razorpay.key_id ? 'Present' : 'Missing',
      key_secret: razorpay.key_secret ? 'Present' : 'Missing',
    });
    
    console.log('Creating test order with amount:', testAmount);
    
    const options = {
      amount: testAmount,
      currency: "INR",
      receipt: `test_${Date.now()}`,
      notes: {
        test: true
      }
    };
    
    // Direct API call without retry
    try {
      const result = await razorpay.orders.create(options);
      console.log('Test order created successfully:', {
        id: result.id,
        amount: result.amount,
        currency: result.currency
      });
      return result;
    } catch (error) {
      console.error('Test order creation error:', {
        error_message: error.message,
        error_description: error.error?.description,
        statusCode: error.statusCode
      });
      throw error;
    }
  } catch (error) {
    console.error('Overall test error:', error);
    throw new functions.https.HttpsError('internal', 'Error creating test order', error);
  }
});

// HTTP endpoint for payment verification via callback URL
exports.verifyPaymentCallback = functions.https.onRequest(async (req, res) => {
  console.log('=== Payment callback received ===');
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  console.log('Request origin:', req.headers.origin || 'No origin in headers');
  
  try {
    // Get webhook secret from environment
    const webhookSecret = razorpay.webhook_secret;
    console.log('Webhook secret available:', webhookSecret ? 'Yes' : 'No');
    
    // Verify webhook signature
    const razorpaySignature = req.headers['x-razorpay-signature'];
    console.log('Razorpay signature in headers:', razorpaySignature ? 'Present' : 'Missing');
    
    if (!razorpaySignature) {
      console.error('No Razorpay signature found in headers');
      return res.status(400).json({ 
        success: false, 
        message: 'No Razorpay signature found' 
      });
    }

    // Create HMAC SHA256 hash
    console.log('Generating signature for webhook verification...');
    const bodyString = JSON.stringify(req.body);
    console.log('Body string length:', bodyString.length);
    
    const generatedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(bodyString)
      .digest('hex');
      
    console.log('Generated signature:', generatedSignature);
    console.log('Received signature:', razorpaySignature);
    
    // Verify signature
    const isSignatureValid = generatedSignature === razorpaySignature;
    console.log('Webhook signature verification result:', isSignatureValid ? 'VALID' : 'INVALID');
    
    if (!isSignatureValid) {
      console.error('Invalid webhook signature');
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid webhook signature' 
      });
    }

    console.log('Extracting payment information from webhook payload...');
    const { payload } = req.body;
    
    if (!payload) {
      console.error('No payload in webhook body');
      return res.status(400).json({
        success: false,
        message: 'No payload in webhook body'
      });
    }
    
    const { payment, order } = payload;
    
    if (!payment) {
      console.error('No payment in webhook payload');
    }
    if (!order) {
      console.error('No order in webhook payload');
    }
    
    if (!payment || !order) {
      console.error('Missing payment or order information in webhook payload');
      return res.status(400).json({
        success: false,
        message: 'Missing payment or order information'
      });
    }
    
    console.log('Payment details:', {
      id: payment.id,
      amount: payment.amount,
      status: payment.status,
      method: payment.method
    });
    console.log('Order details:', {
      id: order.id,
      amount: order.amount,
      status: order.status
    });

    // Store payment information in Firestore
    console.log('Storing payment information in Firestore...');
    const orderRef = admin.firestore().collection('orders').doc(order.id);
    await orderRef.set({
      razorpay_order_id: order.id,
      razorpay_payment_id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      payment_method: payment.method,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log('Payment information stored in Firestore successfully');

    // Handle different payment statuses
    console.log('Processing based on payment status:', payment.status);
    switch (payment.status) {
      case 'captured':
        console.log('Payment captured successfully');
        const successUrl = `${req.headers.origin || '/'}/payment-success?order_id=${order.id}`;
        console.log('Redirecting to success URL:', successUrl);
        res.redirect(302, successUrl);
        break;
      case 'failed':
        console.log('Payment failed');
        const failureUrl = `${req.headers.origin || '/'}/payment-failed?order_id=${order.id}`;
        console.log('Redirecting to failure URL:', failureUrl);
        res.redirect(302, failureUrl);
        break;
      default:
        console.log('Payment status:', payment.status);
        console.log('Sending success response without redirect');
        res.status(200).json({ 
          success: true, 
          message: 'Webhook processed successfully' 
        });
    }
  } catch (error) {
    console.error('Error in payment callback:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      details: error.details
    });
    res.status(500).json({ 
      success: false, 
      message: 'Error processing payment verification' 
    });
  }
});

// exports.checkPromoEligibility = functions.https.onCall(async (data, context) => {
//   const { userId, promoCode } = data;
//   if (!userId || !promoCode) {
//     return { eligible: false, message: "Missing user or promo code." };
//   }
//   if (promoCode !== "NEW10OFF") {
//     return { eligible: false, message: "Invalid promo code." };
//   }

//   const userRef = admin.firestore().collection("users").doc(userId);
//   const userSnap = await userRef.get();
//   if (!userSnap.exists) {
//     return { eligible: false, message: "User not found." };
//   }
//   const userData = userSnap.data();
//   const usedPromoCodes = userData.usedPromoCodes || [];

//   // Check if promo code already used
//   if (usedPromoCodes.includes("NEW10OFF")) {
//     return { eligible: false, message: "Promo code already used." };
//   }

//   // Check if user has any orders
//   const ordersSnap = await admin.firestore().collection("orders").where("userId", "==", userId).limit(1).get();
//   if (!ordersSnap.empty) {
//     return { eligible: false, message: "Promo code only valid for your first order." };
//   }

//   return { eligible: true, message: "Promo code applied!" };
// });


exports.checkPromoEligibility = functions.https.onCall(async (data, context) => {
  const { userId, promoCode } = data;
  if( !userId || !promoCode) {
    return { eligible: false, message: "Missing user or Promo code"}
  }
  if( promoCode != "NEW10OFF" ) {
    return { eligible: false, message: "Invalid Promo code"}
  }

  const userRef = admin.firestore().collection("users").doc(userId);
  const userSnap = await userRef.get();
  if( !userSnap.exists ) {
    return { eligible: false, message: "user not found"}
  }

  const userData = userSnap.data();
  const usedPromoCodes = userData.usedPromoCodes || [];

  if(usedPromoCodes.includes("NEW10OFF")) {
    return { eligible: false, message: "Promo code already used"}
  }

  const ordersSnap = await admin.firestore().collection("orders").where("userId", "==", userId).limit(1).get();

  if(!ordersSnap.empty) {
    return { eligible: false, message: "promo code only valid for your first order"}
  }
  return { eligible: true, message: "promo code applied!"}


});